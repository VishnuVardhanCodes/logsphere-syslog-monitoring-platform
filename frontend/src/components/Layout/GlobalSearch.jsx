import { useState, useEffect, useRef } from 'react'
import { Search, Monitor, ShieldAlert, User, Terminal, Loader2 } from 'lucide-react'
import API from '../../lib/api'
import { useNavigate } from 'react-router-dom'

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [ref])

  useEffect(() => {
    if (query.length < 2) {
      setResults(null)
      setOpen(false)
      return
    }
    const fetchResults = async () => {
      setLoading(true)
      setOpen(true)
      try {
        const res = await API.get(`/search/?q=${encodeURIComponent(query)}`)
        setResults(res.data.results)
      } catch (err) {
        console.error("Search failed", err)
      } finally {
        setLoading(false)
      }
    }
    const t = setTimeout(fetchResults, 400)
    return () => clearTimeout(t)
  }, [query])

  const navigateTo = (path) => {
    setOpen(false)
    setQuery('')
    navigate(path)
  }

  return (
    <div className="relative z-50 flex-1 max-w-md hidden lg:block" ref={ref}>
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input 
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Global search (devices, logs, alerts...)"
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-all focus:bg-[#0B1120]"
        />
        {loading && <Loader2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 animate-spin" />}
      </div>

      {open && results && (
        <div className="absolute top-full left-0 w-full mt-2 bg-[#0B1120] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="p-2 space-y-4">
            
            {results.devices?.length > 0 && (
              <div>
                <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Devices</p>
                {results.devices.map((d, i) => (
                  <button key={i} onClick={() => navigateTo('/devices')} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-all group">
                    <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500"><Monitor size={14} /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate group-hover:text-blue-400">{d.hostname}</p>
                      <p className="text-[10px] font-mono text-slate-500">{d.ip_address}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {results.alerts?.length > 0 && (
              <div>
                <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Alerts</p>
                {results.alerts.map((a, i) => (
                  <button key={i} onClick={() => navigateTo('/alerts')} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-all group">
                    <div className="p-1.5 rounded-md bg-red-500/10 text-red-500"><ShieldAlert size={14} /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate group-hover:text-red-400">{a.message}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">{a.severity}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {results.logs?.length > 0 && (
              <div>
                <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Logs</p>
                {results.logs.map((l, i) => (
                  <button key={i} onClick={() => navigateTo('/')} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-all group">
                    <div className="p-1.5 rounded-md bg-white/5 text-slate-400"><Terminal size={14} /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-slate-300 truncate font-mono">{l.message}</p>
                      <p className="text-[10px] font-bold text-slate-500">{l.hostname}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {results.users?.length > 0 && (
              <div>
                <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Users</p>
                {results.users.map((u, i) => (
                  <button key={i} onClick={() => navigateTo('/users')} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-all group">
                    <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-500"><User size={14} /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white group-hover:text-purple-400">{u.username}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {Object.values(results).every(arr => arr.length === 0) && (
              <div className="py-8 text-center text-slate-500 text-xs">No matches found.</div>
            )}
            
          </div>
        </div>
      )}
    </div>
  )
}
