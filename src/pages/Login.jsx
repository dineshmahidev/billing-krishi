import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState('admin@krishilab.com');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      addToast('Logged in');
    } catch (err) {
      addToast(err.response?.data?.message || 'Login failed', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-block bg-white border border-[#D1D5DB] rounded-2xl px-6 py-4 shadow-sm">
            <img src="/logo-krishi.png" alt="Krishi Analytical Lab" className="h-12 w-auto" />
          </div>
          <h1 className="mt-3 text-lg font-bold text-[#1F2937]">Krishi Analytical Lab</h1>
          <p className="text-xs text-[#168B57]">"Discovering Solutions, One Test at a Time"</p>
          <p className="text-[11px] text-[#6B7280] mt-1">182-B, Tiruppur Road, Kangeyam - 638701 • +91 63793 12357</p>
        </div>
        <form onSubmit={submit} className="bg-white border border-[#D1D5DB] rounded-2xl p-6 space-y-4 shadow-sm">
          <div>
            <label className="text-xs font-bold text-[#1F2937]">Email</label>
            <div className="relative mt-1">
              <Mail className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@krishilab.com" className="w-full pl-10 pr-3 py-2.5 border border-[#D1D5DB] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#168B57]" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-[#1F2937]">Password</label>
            <div className="relative mt-1">
              <Lock className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-3 py-2.5 border border-[#D1D5DB] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#168B57]" />
            </div>
          </div>
          <button disabled={loading} className="w-full py-3 rounded-xl bg-[#168B57] hover:bg-[#0B6B43] text-white font-bold text-xs flex items-center justify-center gap-2">
            {loading?'Signing in...':'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#D1D5DB]/60">
            <button type="button" onClick={()=>{setEmail('admin@krishilab.com'); setPassword('Password123!');}} className="p-2 rounded-xl bg-[#EAF7F0] border border-[#D1D5DB] text-xs font-bold text-[#0B6B43]">Admin</button>
            <button type="button" onClick={()=>{setEmail('staff@krishilab.com'); setPassword('Password123!');}} className="p-2 rounded-xl bg-white border border-[#D1D5DB] text-xs font-bold text-[#1F2937]">Staff</button>
          </div>
        </form>
      </div>
    </div>
  );
};
