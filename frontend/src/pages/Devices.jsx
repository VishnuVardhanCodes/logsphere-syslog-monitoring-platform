import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Monitor, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import API from '../lib/api'
import { fmtDate } from '../lib/utils'
import toast from 'react-hot-toast'
import socket from '../lib/socket'

function DeviceCard({ device, index }) {
  const online = device.status === 'online'
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      whileHover={{ y: -3, scale: 1.01 }}
      className={`gradient-border p-5 cursor-default transition-all duration-300 ${online ? 'border-emerald-500/20' : ''}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${online ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700/20 text-slate-600'}`}>
          <Monitor size={20} />
        </div>
        <span className={`flex items-center gap-1.5 text-xs font-medium ${online ? 'text-emerald-400' : 'text-slate-500'}`}>
          {online ? <><span className="pulse-dot" style={{width:6,height:6}} />Online</> : <>● Offline</>}
        </span>
      </div>
      <h3 className="font-semibold text-white text-sm truncate mb-0.5">{device.hostname}</h3>
      <p className="text-xs text-slate-500 font-mono mb-3">{device.ip_address}</p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-white/3 rounded-lg px-2.5 py-2">
          <p className="text-slate-600 mb-0.5">Type</p>
          <p className="text-slate-300 font-medium">{device.device_type}</p>
        </div>
        <div className="bg-white/3 rounded-lg px-2.5 py-2">
          <p className="text-slate-600 mb-0.5">Logs</p>
          <p className="text-slate-300 font-medium">{device.log_count?.toLocaleString()}</p>
        </div>
      </div>
      <p className="text-[10px] text-slate-600 mt-3">Last seen: {fmtDate(device.last_seen)}</p>
    </motion.div>
  )
}

export default function Devices() {
  const [data, setData] = useState({ devices: [], total: 0, online: 0, offline: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try { const res = await API.get('/devices/'); setData(res.data) }
    catch { toast.error('Failed to load devices') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    fetchData()
    const t = setInterval(fetchData, 30000)

    const handleNewLog = (log) => {
      setData(prev => {
        let exists = false;
        const newDevices = prev.devices.map(d => {
          if (d.ip_address === log.ip_address) {
            exists = true;
            return { ...d, log_count: d.log_count + 1, last_seen: log.timestamp, status: 'online' };
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
          online: prev.devices.filter(d => d.status === 'online').length + (!exists ? 1 : 0) // rough approx
        };
      });
    }

    socket.on('new_log', handleNewLog)
    return () => {
      clearInterval(t)
      socket.off('new_log', handleNewLog)
    }
  }, [])

  const filtered = data.devices.filter(d =>
    !search || d.hostname?.toLowerCase().includes(search.toLowerCase()) || d.ip_address?.includes(search)
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Devices</h1>
          <p className="text-slate-500 text-sm mt-0.5">Network device inventory</p>
        </div>
        <button onClick={fetchData} className="btn-ghost text-xs py-2 px-3"><RefreshCw size={13} /> Refresh</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: data.total, icon: Monitor, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Online', value: data.online, icon: Wifi, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Offline', value: data.offline, icon: WifiOff, color: 'text-slate-500', bg: 'bg-slate-700/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="gradient-border p-4 flex items-center gap-4">
            <div className={`p-2.5 rounded-xl ${bg} ${color}`}><Icon size={20} /></div>
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search hostname or IP…"
        className="w-full max-w-sm bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all" />

      {loading
        ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => <div key={i} className="gradient-border p-5 space-y-3"><div className="skeleton h-10 w-10 rounded-xl" /><div className="skeleton h-4 w-32 rounded" /><div className="skeleton h-3 w-24 rounded" /></div>)}
          </div>
        : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((d, i) => <DeviceCard key={d.ip_address} device={d} index={i} />)}
            {!filtered.length && <div className="col-span-full text-center py-16"><Monitor size={40} className="text-slate-700 mx-auto mb-3" /><p className="text-slate-600">No devices found</p></div>}
          </div>
      }
    </div>
  )
}
