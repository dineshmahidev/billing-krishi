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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl border border-white/80 w-full max-w-md overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.2)]" onClick={e=>e.stopPropagation()}>
        <div className="h-1.5 bg-gradient-to-r from-[#168B57] to-[#0B6B43]" />
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-2"><User className="w-4 h-4 text-[#168B57]" /> My Profile</h3>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5 flex items-center gap-1"><Shield className="w-3 h-3 text-[#168B57]" /> {user?.email} · <span className="capitalize font-bold text-[#0B6B43]">{user?.role}</span></p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6 space-y-6">
          <form onSubmit={saveName} className="space-y-3">
            <p className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-[#168B57]" /> Username / Display Name</p>
            <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs" />
            <button type="submit" disabled={savingName || name.trim()===(user?.name||'').trim()} className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#168B57] to-[#0B6B43] hover:from-[#0B6B43] hover:to-[#168B57] transition-all text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_4px_14px_rgba(22,139,87,0.25)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50">
              <Save className="w-3.5 h-3.5" /> {savingName ? 'Saving...' : 'Save Name'}
            </button>
          </form>

          <form onSubmit={savePassword} className="space-y-3 pt-4 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><KeyRound className="w-3.5 h-3.5 text-[#168B57]" /> Change Password</p>
            <input required type="password" autoComplete="current-password" placeholder="Current password" value={pwd.current_password} onChange={e=>setPwd({...pwd, current_password:e.target.value})} className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs" />
            <input required type="password" autoComplete="new-password" placeholder="New password (min 6 chars)" value={pwd.password} onChange={e=>setPwd({...pwd, password:e.target.value})} className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs" />
            <input required type="password" autoComplete="new-password" placeholder="Confirm new password" value={pwd.password_confirmation} onChange={e=>setPwd({...pwd, password_confirmation:e.target.value})} className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs" />
            <div className="flex justify-end gap-2.5 pt-2">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-2xs">Close</button>
              <button type="submit" disabled={savingPwd} className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#168B57] to-[#0B6B43] hover:from-[#0B6B43] hover:to-[#168B57] transition-all text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_4px_14px_rgba(22,139,87,0.25)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50">
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
