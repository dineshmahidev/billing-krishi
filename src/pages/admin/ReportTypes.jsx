import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';

export const ReportTypes = () => {
  const { addToast } = useToast();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ name:'', title:'', active:true });
  const [editing, setEditing] = useState(null);

  const fetch = async () => { const r=await api.get('/report-types'); setList(r.data); };
  useEffect(()=>{ fetch(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/report-types/${editing}`, form);
      else await api.post('/report-types', form);
      addToast(editing?'Updated':'Created');
      setForm({ name:'', title:'', active:true }); setEditing(null); fetch();
    } catch(err){ addToast(err.response?.data?.message||'Failed','error'); }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-xl font-bold text-[#1F2937]">Report Types</h1>
      <form onSubmit={submit} className="bg-white border border-[#D1D5DB] rounded-2xl p-4 flex flex-wrap gap-2 items-end">
        <div><label className="text-xs font-bold">Name</label><input required value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Water" className="mt-1 w-40 px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" /></div>
        <div><label className="text-xs font-bold">Title</label><input required value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="CERTIFICATE OF ANALYSIS" className="mt-1 w-64 px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" /></div>
        <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form, active:e.target.checked})} /> Active</label>
        <button type="submit" className="px-4 py-2 rounded-xl bg-[#168B57] text-white font-bold text-xs">{editing?'Update':'Add'}</button>
        {editing && <button type="button" onClick={()=>{setEditing(null); setForm({name:'',title:'',active:true});}} className="px-3 py-2 rounded-xl border border-[#D1D5DB] text-xs">Cancel</button>}
      </form>

      <div className="bg-white border border-[#D1D5DB] rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead><tr className="bg-[#EAF7F0] text-[11px] uppercase font-bold text-[#6B7280] border-b border-[#D1D5DB]"><th className="py-2 px-4">Name</th><th className="py-2 px-4">Title</th><th className="py-2 px-4">Active</th><th className="py-2 px-4 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-[#D1D5DB]/60">
            {list.map(t=>(
              <tr key={t.id}>
                <td className="py-2 px-4 font-bold">{t.name}</td>
                <td className="py-2 px-4">{t.title}</td>
                <td className="py-2 px-4">{t.active ? 'Yes':'No'}</td>
                <td className="py-2 px-4 text-right"><button onClick={()=>{setEditing(t.id); setForm({name:t.name, title:t.title, active:t.active});}} className="px-3 py-1 rounded-lg border border-[#D1D5DB] text-xs font-bold">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
