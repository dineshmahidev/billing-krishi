import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { Building2 } from 'lucide-react';

export const CustomerAutocomplete = ({ value, onChange, onSelect, placeholder="Party / Company", label }) => {
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
      {label && <label className="text-xs font-semibold text-[#1F2937] flex items-center gap-1"><Building2 className="w-3 h-3 text-[#168B57]" />{label}</label>}
      <div className="relative mt-1">
        <Building2 className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={q}
          onChange={e=>{ setQ(e.target.value); onChange(e.target.value); }}
          onFocus={()=> { if (list.length) setOpen(true); }}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#168B57] bg-white"
        />
      </div>
      {open && list.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-[#D1D5DB] rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {list.map(c=>(
            <button key={c.id} type="button" onClick={()=>pick(c)} className="w-full text-left px-3 py-2 hover:bg-[#EAF7F0] border-b border-[#D1D5DB]/40 last:border-0">
              <p className="text-xs font-bold">{c.name} {c.company_name && <span className="font-normal text-[#6B7280]">— {c.company_name}</span>}</p>
              <p className="text-[11px] text-[#6B7280] truncate">{[c.phone, c.email, c.gstin].filter(Boolean).join(' • ')}</p>
            </button>
          ))}
          <div className="px-3 py-2 text-[11px] text-[#6B7280] bg-[#F9FAFB]">Select existing or keep typing to add new</div>
        </div>
      )}
      {open && q && list.length===0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-[#D1D5DB] rounded-xl shadow p-3 text-xs text-[#6B7280]">
          No match — will create new customer "<span className="font-bold text-[#1F2937]">{q}</span>" on save
        </div>
      )}
    </div>
  );
};
export default CustomerAutocomplete;
