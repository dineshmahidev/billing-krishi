import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';

export const Staff = () => {
  const { addToast } = useToast();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name:'', email:'', password:'', password_confirmation:'', role:'staff', status:'active', permissions:[] });

  const loadStaff = async () => {
    setLoading(true);
    try { const r=await api.get('/staff'); setList(r.data);} catch(e){ addToast('Failed to load staff','error'); } finally { setLoading(false); }
  };
  useEffect(()=>{ loadStaff(); }, []);

  const perms = ['create_report','edit_report','view_reports','generate_pdf','print_report'];
  const permsOf = (u) => Array.isArray(u.permissions) ? u.permissions : (typeof u.permissions === 'string' && u.permissions ? (()=>{ try { const d = JSON.parse(u.permissions); return Array.isArray(d) ? d : []; } catch { return []; } })() : []);
  const togglePerm = (p) => setForm(f=>({...f, permissions: f.permissions.includes(p) ? f.permissions.filter(x=>x!==p) : [...f.permissions, p]}));

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const payload = { name:form.name, email:form.email, role:form.role, status:form.status, permissions:form.permissions };
        if (form.password) {
          if (form.password !== form.password_confirmation) { addToast('Passwords do not match','error'); return; }
          payload.password = form.password;
          payload.password_confirmation = form.password_confirmation;
        }
        await api.put(`/staff/${editId}`, payload);
        addToast('User updated');
      } else {
        await api.post('/staff', form);
        addToast('Staff created');
      }
      closeModal(); loadStaff();
    }
    catch(err){ addToast(err.response?.data?.message || 'Failed','error'); }
  };

  const openCreate = () => {
    setEditId(null);
    setForm({ name:'', email:'', password:'', password_confirmation:'', role:'staff', status:'active', permissions:[] });
    setShow(true);
  };

  const openEdit = (u) => {
    setEditId(u.id);
    setForm({ name:u.name, email:u.email, password:'', password_confirmation:'', role:u.role, status:u.status, permissions:permsOf(u) });
    setShow(true);
  };

  const closeModal = () => { setShow(false); setEditId(null); };

  const toggleStatus = async (u) => {
    const newStatus = u.status==='active'?'inactive':'active';
    try { await api.patch(`/staff/${u.id}/status`, { status:newStatus }); addToast(`User ${newStatus}`); loadStaff(); } catch { addToast('Failed','error'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1F2937]">Staff Management <span className="text-xs font-bold text-[#6B7280]">({list.length} users)</span></h1>
        <button onClick={openCreate} className="px-4 py-2 rounded-xl bg-[#168B57] hover:bg-[#0B6B43] transition-colors text-white font-bold text-xs">+ Create Staff</button>
      </div>

      {loading ? (
        <div className="bg-white border border-[#D1D5DB] rounded-2xl p-8 text-center text-xs text-[#6B7280]">Loading...</div>
      ) : list.length === 0 ? (
        <div className="bg-white border border-[#D1D5DB] rounded-2xl p-8 text-center text-xs text-[#6B7280]">No users yet — create your first staff member</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {list.map(u=>{
            const isAdmin = u.role === 'admin';
            const active = u.status === 'active';
            return (
              <div key={u.id} className="bg-white border border-[#D1D5DB] rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow">
                <div className={`h-1.5 ${isAdmin ? 'bg-amber-500' : 'bg-sky-500'}`} />
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 ${isAdmin ? 'bg-amber-500' : 'bg-sky-500'}`}>
                      {(u.name||'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#1F2937] truncate">{u.name}</p>
                      <p className="text-[11px] text-[#6B7280] truncate">{u.email}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide text-white shrink-0 ${isAdmin ? 'bg-amber-500' : 'bg-sky-500'}`}>{u.role}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold text-white ${active ? 'bg-emerald-500' : 'bg-red-500'}`}>{active ? 'Active' : 'Inactive'}</span>
                    {isAdmin
                      ? <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#168B57] text-white">Full access</span>
                      : <span className="px-2 py-0.5 rounded-full text-[11px] font-bold border border-[#D1D5DB] text-[#6B7280]">{permsOf(u).length} permissions</span>}
                  </div>

                  {permsOf(u).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {permsOf(u).map(p=>(
                        <span key={p} className="px-2 py-0.5 rounded-lg bg-[#EAF7F0] text-[#0B6B43] text-[10px] font-bold">{p.replace(/_/g,' ')}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1 border-t border-[#D1D5DB]/60">
                    <button onClick={()=>openEdit(u)} className="flex-1 px-3 py-1.5 rounded-lg bg-[#168B57] hover:bg-[#0B6B43] transition-colors text-white text-xs font-bold">Edit</button>
                    <button onClick={()=>toggleStatus(u)} className={`flex-1 px-3 py-1.5 rounded-lg text-white text-xs font-bold transition-colors ${active ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}>{active ? 'Disable' : 'Enable'}</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {show && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <form onSubmit={submit} className="bg-white rounded-2xl border border-[#D1D5DB] p-6 w-full max-w-lg space-y-3">
            <h3 className="text-sm font-bold text-[#1F2937]">{editId ? 'Edit User' : 'Create Staff'}</h3>
            <input required placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
            <input required type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} className="w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
            <input type="password" required={!editId} autoComplete="new-password" placeholder={editId ? 'New password (leave blank to keep current)' : 'Password'} value={form.password} onChange={e=>setForm({...form, password:e.target.value})} className="w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
            <input type="password" required={!editId} autoComplete="new-password" placeholder={editId ? 'Confirm new password' : 'Confirm Password'} value={form.password_confirmation} onChange={e=>setForm({...form, password_confirmation:e.target.value})} className="w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
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
              <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl border border-[#D1D5DB] text-xs font-bold">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-[#168B57] hover:bg-[#0B6B43] transition-colors text-white font-bold text-xs">{editId ? 'Save Changes' : 'Create'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
