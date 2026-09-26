import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';

export const Parameters = () => {
  const { addToast } = useToast();
  const [types, setTypes] = useState([]);
  const [selected, setSelected] = useState('');
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ name:'', unit:'', specification:'', price:'', hsn_code:'', display_order:'', active:true });
  const [editing, setEditing] = useState(null);

  useEffect(()=>{ api.get('/report-types').then(r=>setTypes(r.data)).catch(()=>{}); }, []);
  const loadParams = async () => {
    if (!selected) { setList([]); return; }
    try { const r = await api.get('/parameters', { params:{ report_type_id:selected }}); setList(r.data); } catch { setList([]); }
  };
  useEffect(()=>{ loadParams(); }, [selected]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, report_type_id: selected, display_order: form.display_order ? parseInt(form.display_order) : undefined, price: form.price ? parseFloat(form.price) : 0 };
      if (editing) await api.put(`/parameters/${editing}`, payload);
      else await api.post('/parameters', payload);
      addToast(editing?'Updated':'Created');
      setForm({ name:'', unit:'', specification:'', price:'', hsn_code:'', display_order:'', active:true }); setEditing(null); loadParams();
    } catch(err){ addToast(err.response?.data?.message||'Failed','error'); }
  };

  const toggle = async (p) => {
    try { await api.put(`/parameters/${p.id}`, { active: !p.active }); loadParams(); } catch {}
  };

  const remove = async (p) => {
    if (!window.confirm(`Remove "${p.name}" from this type?\n\nOld reports keep their row — it just won't appear for new reports.`)) return;
    try {
      const r = await api.delete(`/parameters/${p.id}`);
      addToast(r.data?.message || 'Removed');
      if (editing === p.id) { setEditing(null); setForm({ name:'', unit:'', specification:'', price:'', hsn_code:'', display_order:'', active:true }); }
      loadParams();
    } catch(err){ addToast(err.response?.data?.message || 'Delete failed', 'error'); }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <h1 className="text-xl font-bold text-[#1F2937]">Parameters</h1>
      <div className="bg-white border border-[#D1D5DB] rounded-2xl p-4">
        <label className="text-xs font-bold">Report Type</label>
        <select value={selected} onChange={e=>setSelected(e.target.value)} className="mt-1 w-full sm:w-64 px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white">
          <option value="">-- Select Report Type --</option>
          {types.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {selected && (
        <>
          <form onSubmit={submit} className="bg-white border border-[#D1D5DB] rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input required placeholder="Parameter Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
            <input placeholder="Unit (e.g. %, mg/l)" value={form.unit} onChange={e=>setForm({...form, unit:e.target.value})} className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
            <input placeholder="Specification (e.g. 0.50 % Max)" value={form.specification} onChange={e=>setForm({...form, specification:e.target.value})} className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
            <input type="number" step="0.01" placeholder="Price ₹ (test cost)" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
            <input placeholder="HSN Code" value={form.hsn_code} onChange={e=>setForm({...form, hsn_code:e.target.value})} className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
            <input type="number" placeholder="Display Order" value={form.display_order} onChange={e=>setForm({...form, display_order:e.target.value})} className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
            <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form, active:e.target.checked})} /> Active</label>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" className="px-4 py-2 rounded-xl bg-[#168B57] hover:bg-[#0B6B43] transition-colors text-white font-bold text-xs">{editing?'Update':'Add Parameter'}</button>
              {editing && <button type="button" onClick={()=>{setEditing(null); setForm({name:'',unit:'',specification:'',price:'',hsn_code:'',display_order:'',active:true});}} className="px-3 py-2 rounded-xl border border-[#D1D5DB] text-xs">Cancel</button>}
            </div>
          </form>

          <div className="bg-white border border-[#D1D5DB] rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead><tr className="bg-[#EAF7F0] text-[11px] uppercase font-bold text-[#6B7280] border-b border-[#D1D5DB]"><th className="py-2 px-3">#</th><th className="py-2 px-3">Name</th><th className="py-2 px-3">Unit</th><th className="py-2 px-3">Specification</th><th className="py-2 px-3">Price</th><th className="py-2 px-3">HSN</th><th className="py-2 px-3">Order</th><th className="py-2 px-3">Active</th><th className="py-2 px-3 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-[#D1D5DB]/60">
                {list.map(p=>(
                  <tr key={p.id}>
                    <td className="py-2 px-3">{p.display_order}</td>
                    <td className="py-2 px-3 font-bold">{p.name}</td>
                    <td className="py-2 px-3">{p.unit || '-'}</td>
                    <td className="py-2 px-3">{p.specification || '-'}</td>
                    <td className="py-2 px-3 font-mono">₹{Number(p.price||0).toFixed(2)}</td>
                    <td className="py-2 px-3">{p.hsn_code || '-'}</td>
                    <td className="py-2 px-3">{p.display_order}</td>
                    <td className="py-2 px-3">{p.active?'Yes':'No'}</td>
                    <td className="py-2 px-3 text-right flex items-center justify-end gap-1">
                      <button onClick={()=>{setEditing(p.id); setForm({name:p.name, unit:p.unit||'', specification:p.specification||'', price:p.price||'', hsn_code:p.hsn_code||'', display_order:p.display_order, active:p.active});}} className="px-2 py-1 rounded-lg border border-[#D1D5DB] text-xs">Edit</button>
                      <button onClick={()=>toggle(p)} className="px-2 py-1 rounded-lg border border-[#D1D5DB] text-xs">{p.active?'Disable':'Enable'}</button>
                      <button onClick={()=>remove(p)} className="px-2 py-1 rounded-lg border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
