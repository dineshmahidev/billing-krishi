import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { Building2 } from 'lucide-react';

export const CustomerAutocomplete = ({ value, onChange, onSelect, placeholder="Customer", label }) => {
  const [q, setQ] = useState(value || '');
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(()=> setQ(value||''), [value]);

  useEffect(()=>{
    if (!q || q.length < 1) { setList([]); return; }
    const t = setTimeout(async ()=>{
      try {
        const r = await api.get('/customers/search', { params:{ q } });
        setList(r.data);
        setOpen(true);
      } catch {}
    }, 300);
    return ()=> clearTimeout(t);
  }, [q]);

  useEffect(()=>{
    const onClickOutside = (e)=> { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClickOutside);
    return ()=> document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const pick = (c) => {
    setQ(c.name);
    setOpen(false);
    onChange(c.name);
    if (onSelect) onSelect(c);
  };

  return (
    <div ref={ref} className="relative">
      {label && <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1"><Building2 className="w-3.5 h-3.5 text-[#168B57]" />{label}</label>}
      <div className="relative group">
        <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#168B57]" />
        <input
          value={q}
          onChange={e=>{ setQ(e.target.value); onChange(e.target.value); }}
          onFocus={()=> { if (list.length) setOpen(true); }}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs"
        />
      </div>
      {open && list.length > 0 && (
        <div className="absolute z-30 mt-1.5 w-full bg-white border border-gray-200 rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] max-h-52 overflow-y-auto p-1 divide-y divide-gray-50">
          {list.map(c=>(
            <button key={c.id} type="button" onClick={()=>pick(c)} className="w-full text-left px-3.5 py-2.5 hover:bg-[#EAF7F0] rounded-xl transition-colors">
              <p className="text-xs font-bold text-gray-900">{c.name} {c.company_name && <span className="font-normal text-gray-500">— {c.company_name}</span>}</p>
              <p className="text-[11px] text-gray-400 truncate mt-0.5">{[c.phone, c.email, c.gstin].filter(Boolean).join(' • ')}</p>
            </button>
          ))}
          <div className="px-3.5 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50 rounded-lg text-center mt-1">Select existing or type to add new</div>
        </div>
      )}
      {open && q && list.length===0 && (
        <div className="absolute z-30 mt-1.5 w-full bg-white border border-gray-200 rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] p-3 text-xs text-gray-500 rounded-xl">
          No match — will create new customer &quot;<span className="font-bold text-gray-900">{q}</span>&quot; on save
        </div>
      )}
    </div>
  );
};
export default CustomerAutocomplete;
