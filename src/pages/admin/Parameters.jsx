import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';

export const Parameters = () => {
  const { addToast } = useToast();
  const { isDemo } = useAuth();
  const [types, setTypes] = useState([]);
  const [selected, setSelected] = useState('');
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ name:'', short_code:'', unit:'', specification:'', price:'', hsn_code:'', display_order:'', active:true });
  const [editing, setEditing] = useState(null);

  useEffect(()=>{ api.get('/report-types').then(r=>setTypes(r.data)).catch(()=>{}); }, []);
  const loadParams = async () => {
    if (!selected) { setList([]); return; }
    try { const r = await api.get('/parameters', { params:{ report_type_id:selected }}); setList(r.data); } catch { setList([]); }
  };
  useEffect(()=>{ loadParams(); }, [selected]);

  const submit = async (e) => {
    e.preventDefault();
    if (isDemo) { addToast('Demo Mode: Action disabled', 'error'); return; }
    try {
      const payload = { ...form, report_type_id: selected, display_order: form.display_order ? parseInt(form.display_order) : undefined, price: form.price ? parseFloat(form.price) : 0 };
      if (editing) await api.put(`/parameters/${editing}`, payload);
      else await api.post('/parameters', payload);
      addToast(editing?'Updated':'Created');
      setForm({ name:'', short_code:'', unit:'', specification:'', price:'', hsn_code:'', display_order:'', active:true }); setEditing(null); loadParams();
    } catch(err){ addToast(err.response?.data?.message||'Failed','error'); }
  };

  const toggle = async (p) => {
    if (isDemo) { addToast('Demo Mode: Action disabled', 'error'); return; }
    try { await api.put(`/parameters/${p.id}`, { active: !p.active }); loadParams(); } catch {}
  };

  const remove = async (p) => {
    if (isDemo) { addToast('Demo Mode: Action disabled', 'error'); return; }
    if (!window.confirm(`Remove "${p.name}" from this type?\n\nOld reports keep their row — it just won't appear for new reports.`)) return;
    try {
      const r = await api.delete(`/parameters/${p.id}`);
      addToast(r.data?.message || 'Removed');
      if (editing === p.id) { setEditing(null); setForm({ name:'', short_code:'', unit:'', specification:'', price:'', hsn_code:'', display_order:'', active:true }); }
      loadParams();
    } catch(err){ addToast(err.response?.data?.message || 'Delete failed', 'error'); }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Parameters</h1>
        <p className="text-xs text-gray-400 font-medium mt-0.5">Manage analytical test parameters, standard specifications, and pricing per report type</p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-white/80">
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Select Report Type</label>
        <select value={selected} onChange={e=>setSelected(e.target.value)} className="w-full sm:w-80 px-4 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs">
          <option value="">-- Select Report Type --</option>
          {types.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {selected && (
        <>
          {!isDemo && (
            <form onSubmit={submit} className="bg-white rounded-3xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-white/80 space-y-4">
              <h3 className="text-xs font-black text-[#168B57] uppercase tracking-wider">
                {editing ? 'Edit Test Parameter' : 'Add New Parameter'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Parameter Name *</label>
                  <input required placeholder="e.g. Oil Content" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-xl text-xs font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Short Code</label>
                  <input placeholder="e.g. OC, FFA (Auto)" value={form.short_code} onChange={e=>setForm({...form, short_code:e.target.value})} className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-xl text-xs font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Unit</label>
                  <input placeholder="e.g. %, mg/l" value={form.unit} onChange={e=>setForm({...form, unit:e.target.value})} className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Specification</label>
                  <input placeholder="e.g. 0.50 % Max" value={form.specification} onChange={e=>setForm({...form, specification:e.target.value})} className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Price ₹ (Test Cost)</label>
                  <input type="number" step="0.01" placeholder="0.00" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-xl text-xs font-mono font-bold text-[#0B6B43] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">HSN Code</label>
                  <input placeholder="e.g. 998346" value={form.hsn_code} onChange={e=>setForm({...form, hsn_code:e.target.value})} className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Display Order</label>
                  <input type="number" placeholder="1" value={form.display_order} onChange={e=>setForm({...form, display_order:e.target.value})} className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all" />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer select-none">
                    <input type="checkbox" checked={form.active} onChange={e=>setForm({...form, active:e.target.checked})} className="w-4 h-4 rounded text-[#168B57] accent-[#168B57]" /> Active in Reports
                  </label>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button type="submit" className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#168B57] to-[#0B6B43] hover:from-[#0B6B43] hover:to-[#168B57] text-white font-bold text-xs shadow-[0_4px_14px_rgba(22,139,87,0.25)] hover:scale-[1.01] active:scale-[0.99] transition-all">
                  {editing?'Update Parameter':'Add Parameter'}
                </button>
                {editing && (
                  <button type="button" onClick={()=>{setEditing(null); setForm({name:'',short_code:'',unit:'',specification:'',price:'',hsn_code:'',display_order:'',active:true});}} className="px-4 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}

          <div className="bg-white rounded-3xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-white/80 overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#EFEAFD] text-[#7A709E] text-[10px] font-bold uppercase tracking-wider rounded-2xl">
                  <th className="py-3 px-3.5 rounded-l-2xl">#</th>
                  <th className="py-3 px-3.5">Name</th>
                  <th className="py-3 px-3.5">Short Code</th>
                  <th className="py-3 px-3.5">Unit</th>
                  <th className="py-3 px-3.5">Specification</th>
                  <th className="py-3 px-3.5">Price</th>
                  <th className="py-3 px-3.5">HSN</th>
                  <th className="py-3 px-3.5">Order</th>
                  <th className="py-3 px-3.5">Active</th>
                  {!isDemo && <th className="py-3 px-3.5 text-right rounded-r-2xl">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map(p=>(
                  <tr key={p.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-3 px-3.5 text-gray-400 font-bold">{p.display_order}</td>
                    <td className="py-3 px-3.5 font-bold text-gray-900">{p.name}</td>
                    <td className="py-3 px-3.5 font-mono text-[#0B6B43] font-semibold">{p.short_code || <span className="text-gray-400 italic font-normal">Auto</span>}</td>
                    <td className="py-3 px-3.5 text-gray-600">{p.unit || '-'}</td>
                    <td className="py-3 px-3.5 text-gray-600">{p.specification || '-'}</td>
                    <td className="py-3 px-3.5 font-mono font-bold text-gray-900">₹{Number(p.price||0).toFixed(2)}</td>
                    <td className="py-3 px-3.5 font-mono text-gray-500">{p.hsn_code || '-'}</td>
                    <td className="py-3 px-3.5 text-gray-600">{p.display_order}</td>
                    <td className="py-3 px-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
                        {p.active?'Active':'Disabled'}
                      </span>
                    </td>
                    {!isDemo && (
                      <td className="py-3 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={()=>{setEditing(p.id); setForm({name:p.name, short_code:p.short_code||'', unit:p.unit||'', specification:p.specification||'', price:p.price||'', hsn_code:p.hsn_code||'', display_order:p.display_order, active:p.active});}} className="px-2.5 py-1 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50">Edit</button>
                          <button onClick={()=>toggle(p)} className="px-2.5 py-1 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50">{p.active?'Disable':'Enable'}</button>
                          <button onClick={()=>remove(p)} className="px-2.5 py-1 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50">Delete</button>
                        </div>
                      </td>
                    )}
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
