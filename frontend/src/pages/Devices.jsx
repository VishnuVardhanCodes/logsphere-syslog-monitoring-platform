import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Monitor, Wifi, WifiOff, RefreshCw, Search, 
  MoreVertical, Cpu, HardDrive, Activity, 
  ShieldCheck, Server, Globe, Settings, Terminal
} from 'lucide-react'
import API from '../lib/api'
import { fmtDate } from '../lib/utils'
import toast from 'react-hot-toast'
import socket from '../lib/socket'
import HostHealthModal from '../components/Modals/HostHealthModal'
import DeviceDetailModal from '../components/Modals/DeviceDetailModal'

function DeviceCard({ device, index, onOpenTerminal, onOpenHealth }) {
  const online = device.status === 'online'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -5 }}
      className={`
        glass-strong border p-6 group relative overflow-hidden transition-all duration-500
        ${online ? 'border-emerald-500/20 hover:border-emerald-500/40 shadow-emerald-500/5' : 'border-white/5 hover:border-white/10 opacity-75'}
      `}
    >
      {/* Background Glow */}
      <div className={`absolute -right-12 -top-12 w-32 h-32 blur-[80px] rounded-full transition-opacity duration-500 opacity-20 ${online ? 'bg-emerald-500 group-hover:opacity-40' : 'bg-slate-500'}`} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className={`
            p-3 rounded-2xl border transition-all duration-500
            ${online ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-lg shadow-emerald-500/10' : 'bg-slate-800/40 text-slate-500 border-white/5'}
          `}>
            <Server size={22} className={online ? 'animate-pulse' : ''} />
          </div>
          
          <div className="flex flex-col items-end">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${online ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              {online ? 'Active' : 'Offline'}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-black text-white tracking-tight mb-1 group-hover:text-blue-400 transition-colors">{device.hostname}</h3>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
            <Globe size={12} className="text-slate-700" />
            {device.ip_address}
          </div>
        </div>



        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Total Logs</span>
            <span className="text-xs font-bold text-white">{(device.log_count || 0).toLocaleString()}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onOpenTerminal(device.hostname)} className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-500 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all z-20 relative">
              <Terminal size={14} />
            </button>
            <button onClick={() => onOpenHealth(device.hostname)} className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-500 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all z-20 relative">
              <Activity size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Devices() {
  const [data, setData] = useState({ devices: [], total: 0, online: 0, offline: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // all, online, offline
  const [detailHostname, setDetailHostname] = useState(null)
  const [healthHostname, setHealthHostname] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await API.get('/devices/')
      setData(res.data)
    } catch {
      toast.error('Network inventory discovery failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const t = setInterval(fetchData, 45000)

    const handleNewLog = (log) => {
      setData(prev => {
        let exists = false;
        const newDevices = prev.devices.map(d => {
          if (d.ip_address === log.ip_address) {
            exists = true;
            return { ...d, log_count: (d.log_count || 0) + 1, last_seen: log.timestamp, status: 'online' };
          }
          return d;
        });

        if (!exists) {
          newDevices.unshift({
            ip_address: log.ip_address,
            hostname: log.hostname,
            device_type: log.device_type,
            log_count: 1,
            last_seen: log.timestamp,
            status: 'online'
          });
        }

        return {
          ...prev,
          devices: newDevices,
          total: !exists ? prev.total + 1 : prev.total,
          online: newDevices.filter(d => d.status === 'online').length,
          offline: newDevices.filter(d => d.status !== 'online').length
        };
      });
    }

    socket.on('new_log', handleNewLog)
    return () => {
      clearInterval(t)
      socket.off('new_log', handleNewLog)
    }
  }, [fetchData])

  const filtered = data.devices.filter(d => {
    const matchesSearch = !search || d.hostname?.toLowerCase().includes(search.toLowerCase()) || d.ip_address?.includes(search)
    const matchesFilter = filter === 'all' || (filter === 'online' && d.status === 'online') || (filter === 'offline' && d.status !== 'online')
    return matchesSearch && matchesFilter
  })

  return (
    <div className="pb-12 space-y-8 animate-fade-in">
      {/* Header Section */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-500 border border-blue-500/20">
              <ShieldCheck size={18} />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Infrastructure Grid</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            Node Registry
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-md">Manage and monitor all detected network endpoints, assets, and integrated security nodes in real-time.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-[#0B1120]/50 p-2 rounded-2xl border border-white/5">
          {[
            { id: 'all', label: 'All Assets', count: data.total },
            { id: 'online', label: 'Online', count: data.online },
            { id: 'offline', label: 'Offline', count: data.offline },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              {f.label} <span className="ml-2 opacity-50">{f.count}</span>
            </button>
          ))}
          <div className="w-[1px] h-6 bg-white/5 mx-1" />
          <button 
            onClick={fetchData}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all group"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Coverage', value: `${data.total > 0 ? Math.round((data.online/data.total)*100) : 0}%`, sub: 'Nodes Operational', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'System Uptime', value: '99.98%', sub: 'Last 24 Hours', icon: Wifi, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Data Throughput', value: '1.2 GB/s', sub: 'Inbound Telemetry', icon: Globe, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
          { label: 'Security Health', value: 'Robust', sub: 'No Critical Failures', icon: ShieldCheck, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        ].map((stat, i) => (
          <div key={i} className="glass-strong border border-white/5 p-5 rounded-2xl flex items-center gap-5">
            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} border border-white/5 shadow-inner`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{stat.label}</p>
              <p className="text-xl font-black text-white leading-tight">{stat.value}</p>
              <p className="text-[9px] font-bold text-slate-600 mt-0.5">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative group max-w-xl">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
        <input 
          value={search} 
          onChange={e => setSearch(e.target.value)}
          placeholder="Lookup endpoint by hostname, IP address or hardware profile..."
          className="w-full bg-[#0B1120] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all shadow-2xl" 
        />
      </div>

      {/* Content Grid */}
      <AnimatePresence mode="popLayout">
        {loading && data.devices.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="glass-strong border border-white/5 p-6 h-[280px] animate-pulse">
                <div className="w-12 h-12 rounded-2xl bg-white/5 mb-6" />
                <div className="h-6 w-3/4 bg-white/5 rounded mb-2" />
                <div className="h-4 w-1/2 bg-white/5 rounded mb-8" />
                <div className="space-y-4">
                  <div className="h-2 w-full bg-white/5 rounded" />
                  <div className="h-2 w-full bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((d, i) => <DeviceCard key={d.ip_address} device={d} index={i} onOpenTerminal={setDetailHostname} onOpenHealth={setHealthHostname} />)}
            
            {!filtered.length && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="col-span-full py-32 flex flex-col items-center text-center"
              >
                <div className="p-8 rounded-full bg-white/[0.02] border border-white/5 text-slate-700 mb-6">
                  <Monitor size={64} strokeWidth={1} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No infrastructure nodes detected</h3>
                <p className="text-sm text-slate-500 max-w-sm">No devices matching your current search criteria or status filter were found in the registry.</p>
                <button 
                  onClick={() => { setSearch(''); setFilter('all'); }}
                  className="mt-6 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-blue-600/20"
                >
                  Clear All Filters
                </button>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>

      <DeviceDetailModal 
        isOpen={!!detailHostname} 
        onClose={() => setDetailHostname(null)} 
        hostname={detailHostname} 
      />
      
      <HostHealthModal 
        isOpen={!!healthHostname} 
        onClose={() => setHealthHostname(null)} 
        hostname={healthHostname} 
      />
    </div>
  )
}
