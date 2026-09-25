import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import api from '../../services/api';
import { X, User, KeyRound, Save, Shield } from 'lucide-react';

export const MyProfile = ({ onClose }) => {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);
  const [pwd, setPwd] = useState({ current_password:'', password:'', password_confirmation:'' });
  const [savingPwd, setSavingPwd] = useState(false);

  const saveName = async (e) => {
    e.preventDefault();
    setSavingName(true);
    try {
      const r = await api.put('/user/profile', { name });
      setUser(r.data.user);
      localStorage.setItem('auth_user', JSON.stringify(r.data.user));
      addToast('Username updated');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update username', 'error');
    } finally { setSavingName(false); }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pwd.password !== pwd.password_confirmation) {
      addToast('Passwords do not match', 'error');
      return;
    }
    setSavingPwd(true);
    try {
      const r = await api.put('/user/password', pwd);
      addToast(r.data.message || 'Password changed');
      setPwd({ current_password:'', password:'', password_confirmation:'' });
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally { setSavingPwd(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-[#D1D5DB] w-full max-w-md overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.25)]" onClick={e=>e.stopPropagation()}>
        <div className="h-1.5 bg-gradient-to-r from-[#168B57] to-[#0B6B43]" />
        <div className="px-6 pt-5 pb-4 border-b border-[#D1D5DB]/60 flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#1F2937] flex items-center gap-2"><User className="w-4 h-4 text-[#168B57]" /> My Profile</h3>
            <p className="text-[11px] text-[#6B7280] mt-0.5 flex items-center gap-1"><Shield className="w-3 h-3" /> {user?.email} · <span className="capitalize">{user?.role}</span></p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#EAF7F0] text-[#6B7280]"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6 space-y-6">
          <form onSubmit={saveName} className="space-y-3">
            <p className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-[#168B57]" /> Username / Display Name</p>
            <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" className="w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
            <button type="submit" disabled={savingName || name.trim()===(user?.name||'').trim()} className="px-4 py-2 rounded-xl bg-[#168B57] hover:bg-[#0B6B43] transition-colors text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50">
              <Save className="w-3.5 h-3.5" /> {savingName ? 'Saving...' : 'Save Name'}
            </button>
          </form>

          <form onSubmit={savePassword} className="space-y-3 pt-4 border-t border-[#D1D5DB]/60">
            <p className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5"><KeyRound className="w-3.5 h-3.5 text-[#168B57]" /> Change Password</p>
            <input required type="password" autoComplete="current-password" placeholder="Current password" value={pwd.current_password} onChange={e=>setPwd({...pwd, current_password:e.target.value})} className="w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
            <input required type="password" autoComplete="new-password" placeholder="New password (min 6 chars)" value={pwd.password} onChange={e=>setPwd({...pwd, password:e.target.value})} className="w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
            <input required type="password" autoComplete="new-password" placeholder="Confirm new password" value={pwd.password_confirmation} onChange={e=>setPwd({...pwd, password_confirmation:e.target.value})} className="w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-[#D1D5DB] text-xs font-bold">Close</button>
              <button type="submit" disabled={savingPwd} className="px-4 py-2 rounded-xl bg-[#168B57] hover:bg-[#0B6B43] transition-colors text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50">
                <KeyRound className="w-3.5 h-3.5" /> {savingPwd ? 'Updating...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
