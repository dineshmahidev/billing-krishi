import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';

export const ReportTypes = () => {
  const { addToast } = useToast();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ name:'', title:'', active:true, show_specification:true, custom_columns:[] });
  const [editing, setEditing] = useState(null);
  const [newCol, setNewCol] = useState('');

  const loadTypes = async () => { try { const r=await api.get('/report-types'); setList(r.data); } catch { addToast('Failed to load report types','error'); } };
  useEffect(()=>{ loadTypes(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, custom_columns: form.custom_columns || [] };
      if (editing) await api.put(`/report-types/${editing}`, payload);
      else await api.post('/report-types', payload);
      addToast(editing?'Updated':'Created');
      setForm({ name:'', title:'', active:true, show_specification:true, custom_columns:[] }); setEditing(null); setNewCol(''); loadTypes();
    } catch(err){ addToast(err.response?.data?.message||'Failed','error'); }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-xl font-bold text-[#1F2937]">Report Types</h1>
      <form onSubmit={submit} className="bg-white border border-[#D1D5DB] rounded-2xl p-4 space-y-3">
        <div className="flex flex-wrap gap-2 items-end">
          <div><label className="text-xs font-bold">Name</label><input required value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Water" className="mt-1 w-40 px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" /></div>
          <div><label className="text-xs font-bold">Title</label><input required value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="CERTIFICATE OF ANALYSIS" className="mt-1 w-64 px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" /></div>
          <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form, active:e.target.checked})} /> Active</label>
          <label className="flex items-center gap-1 text-xs border border-[#D1EEE0] bg-[#EAF7F0] px-2 py-1 rounded-full"><input type="checkbox" checked={form.show_specification} onChange={e=>setForm({...form, show_specification:e.target.checked})} /> Show Specification</label>
        </div>
        <div className="border border-[#D1EEE0] bg-[#F9FAFB] rounded-xl p-3 space-y-2">
          <p className="text-xs font-bold text-[#0B6B43]">Custom Columns (report-wise show/hide)</p>
          <div className="flex gap-2">
            <input value={newCol} onChange={e=>setNewCol(e.target.value)} placeholder="e.g. Colour, Texture" className="flex-1 px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
            <button type="button" onClick={()=>{ if(newCol.trim()){ setForm({...form, custom_columns:[...(form.custom_columns||[]), newCol.trim()]}); setNewCol(''); } }} className="px-3 py-2 rounded-xl bg-white border border-[#168B57] text-[#168B57] font-bold text-xs">Add Column</button>
          </div>
          <div className="flex flex-wrap gap-1">
            {(form.custom_columns||[]).map((c,i)=>(
              <span key={i} className="inline-flex items-center gap-1 bg-white border border-[#D1D5DB] px-2 py-1 rounded-full text-xs">{c} <button type="button" onClick={()=> setForm({...form, custom_columns: form.custom_columns.filter((_,idx)=>idx!==i)})} className="text-red-500 font-bold">×</button></span>
            ))}
            {(!form.custom_columns || form.custom_columns.length===0) && <span className="text-[11px] text-[#6B7280]">No custom columns — enable Specification toggle above</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 rounded-xl bg-[#168B57] hover:bg-[#0B6B43] transition-colors text-white font-bold text-xs">{editing?'Update':'Add'}</button>
          {editing && <button type="button" onClick={()=>{setEditing(null); setForm({name:'',title:'',active:true, show_specification:true, custom_columns:[]}); setNewCol('');}} className="px-3 py-2 rounded-xl border border-[#D1D5DB] text-xs">Cancel</button>}
        </div>
      </form>

      <div className="bg-white border border-[#D1D5DB] rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead><tr className="bg-[#EAF7F0] text-[11px] uppercase font-bold text-[#6B7280] border-b border-[#D1D5DB]"><th className="py-2 px-4">Name</th><th className="py-2 px-4">Title</th><th className="py-2 px-4">Spec</th><th className="py-2 px-4">Custom Cols</th><th className="py-2 px-4">Active</th><th className="py-2 px-4 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-[#D1D5DB]/60">
            {list.map(t=>(
              <tr key={t.id}>
                <td className="py-2 px-4 font-bold">{t.name}</td>
                <td className="py-2 px-4">{t.title}</td>
                <td className="py-2 px-4">{t.show_specification ? 'Shown' : 'Hidden'}</td>
                <td className="py-2 px-4">{(t.custom_columns||[]).join(', ') || '-'}</td>
                <td className="py-2 px-4">{t.active ? 'Yes':'No'}</td>
                <td className="py-2 px-4 text-right"><button onClick={()=>{setEditing(t.id); setForm({name:t.name, title:t.title, active:t.active, show_specification: t.show_specification ?? true, custom_columns: t.custom_columns||[]});}} className="px-3 py-1 rounded-lg border border-[#D1D5DB] text-xs font-bold">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
