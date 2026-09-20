import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';

export const Staff = () => {
  const { addToast } = useToast();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', password:'', password_confirmation:'', role:'staff', status:'active', permissions:[] });

  const fetch = async () => {
    setLoading(true);
    try { const r=await api.get('/staff'); setList(r.data);} catch(e){ addToast('Failed to load staff','error'); } finally { setLoading(false); }
  };
  useEffect(()=>{ fetch(); }, []);

  const perms = ['create_report','edit_report','view_reports','generate_pdf','print_report'];
  const togglePerm = (p) => setForm(f=>({...f, permissions: f.permissions.includes(p) ? f.permissions.filter(x=>x!==p) : [...f.permissions, p]}));

  const submit = async (e) => {
    e.preventDefault();
    try { await api.post('/staff', form); addToast('Staff created'); setShow(false); setForm({ name:'', email:'', password:'', password_confirmation:'', role:'staff', status:'active', permissions:[] }); fetch(); }
    catch(err){ addToast(err.response?.data?.message || 'Failed','error'); }
  };

  const toggleStatus = async (u) => {
    const newStatus = u.status==='active'?'inactive':'active';
    try { await api.patch(`/staff/${u.id}/status`, { status:newStatus }); addToast(`User ${newStatus}`); fetch(); } catch { addToast('Failed','error'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1F2937]">Staff Management</h1>
        <button onClick={()=>setShow(true)} className="px-4 py-2 rounded-xl bg-[#168B57] text-white font-bold text-xs">+ Create Staff</button>
      </div>

      <div className="bg-white border border-[#D1D5DB] rounded-2xl overflow-hidden">
        {loading ? <div className="p-8 text-center text-xs text-[#6B7280]">Loading...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead><tr className="bg-[#EAF7F0] text-[11px] uppercase font-bold text-[#6B7280] border-b border-[#D1D5DB]">
                <th className="py-2.5 px-4">Name</th><th className="py-2.5 px-4">Email</th><th className="py-2.5 px-4">Role</th><th className="py-2.5 px-4">Status</th><th className="py-2.5 px-4 text-right">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-[#D1D5DB]/60">
                {list.map(u=>(
                  <tr key={u.id} className="hover:bg-[#EAF7F0]/30">
                    <td className="py-2.5 px-4 font-bold">{u.name}</td>
                    <td className="py-2.5 px-4">{u.email}</td>
                    <td className="py-2.5 px-4 capitalize">{u.role}</td>
                    <td className="py-2.5 px-4"><span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${u.status==='active'?'bg-[#EAF7F0] text-[#0B6B43]':'bg-red-50 text-red-600'}`}>{u.status}</span></td>
                    <td className="py-2.5 px-4 text-right">
                      <button onClick={()=>toggleStatus(u)} className="px-3 py-1 rounded-lg border border-[#D1D5DB] text-xs font-bold">{u.status==='active'?'Disable':'Enable'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {show && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <form onSubmit={submit} className="bg-white rounded-2xl border border-[#D1D5DB] p-6 w-full max-w-lg space-y-3">
            <h3 className="text-sm font-bold text-[#1F2937]">Create Staff</h3>
            <input required placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
            <input required type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} className="w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
            <input required type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} className="w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
            <input required type="password" placeholder="Confirm Password" value={form.password_confirmation} onChange={e=>setForm({...form, password_confirmation:e.target.value})} className="w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
            <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})} className="w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white">
              <option value="staff">Staff</option><option value="admin">Admin</option>
            </select>
            <div>
              <p className="text-xs font-bold text-[#1F2937] mb-1">Permissions</p>
              <div className="grid grid-cols-2 gap-1">
                {perms.map(p=>(
                  <label key={p} className="flex items-center gap-1 text-xs"><input type="checkbox" checked={form.permissions.includes(p)} onChange={()=>togglePerm(p)} /> {p}</label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={()=>setShow(false)} className="px-4 py-2 rounded-xl border border-[#D1D5DB] text-xs font-bold">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-[#168B57] text-white font-bold text-xs">Create</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
