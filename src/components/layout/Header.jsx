import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Menu, User, Shield, UserCog, FlaskConical } from 'lucide-react';
import { MyProfile } from './MyProfile';

export const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
    return (
    <>
    <header className="sticky top-0 z-40 bg-white border-b border-[#D1D5DB] no-print shadow-[0_2px_20px_rgba(22,139,87,0.06)]">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#168B57] to-transparent opacity-60" />
      <div className="px-4 sm:px-6 h-[64px] flex items-center justify-between max-w-[1600px] mx-auto">
        <div className="flex items-center gap-3">
          <button onClick={onToggleSidebar} className="lg:hidden p-2 text-[#6B7280] hover:bg-[#EAF7F0] rounded-xl border border-transparent hover:border-[#D1D5DB]">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/krishi-transparent.png" alt="Krishi" className="h-9 sm:h-10 w-10 object-contain bg-white" />
            <div className="hidden sm:block">
              <p className="text-xs font-bold leading-none text-[#168B57]">KRISHI ANALYTICAL LAB</p>
              <p className="text-[10px] text-black font-semibold">Discovering Solutions, One Test at a Time</p>
            </div>
          </div>
          <span className="hidden lg:flex items-center gap-1.5 ml-3 bg-[#EAF7F0] border border-[#D1EEE0] text-[#0B6B43] text-[11px] font-bold px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Control Panel
          </span>
          {user?.is_demo && (
            <span className="flex items-center gap-1.5 ml-2 bg-amber-50 border border-amber-300 text-amber-700 text-[11px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wide">
              <FlaskConical className="w-3 h-3" /> Demo Mode
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-bold text-[#1F2937] leading-none">{user?.name || 'User'}</p>
            <p className="text-[11px] text-[#6B7280] capitalize flex items-center justify-end gap-1"><Shield className="w-3 h-3 text-[#168B57]" />{user?.role || 'staff'}</p>
          </div>
          <div className="relative">
            <button onClick={()=>setOpen(!open)} className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#168B57] to-[#0B6B43] text-white font-bold flex items-center justify-center shadow-[0_4px_12px_rgba(22,139,87,0.3)] hover:shadow-[0_6px_16px_rgba(22,139,87,0.4)] hover:-translate-y-0.5 transition-all">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-60 bg-white/95 backdrop-blur-xl border border-[#D1D5DB]/60 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.12)] p-2 z-50 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-[#168B57] to-[#0B6B43] -m-2 mb-2" />
                <div className="px-3 py-2 border-b border-[#D1D5DB]/40 mb-1">
                  <p className="text-xs font-bold text-[#1F2937] truncate flex items-center gap-1.5"><User className="w-3 h-3 text-[#168B57]" />{user?.name}</p>
                  <p className="text-[11px] text-[#6B7280] truncate">{user?.email}</p>
                  <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF7F0] text-[#0B6B43] border border-[#D1EEE0]"><Shield className="w-3 h-3" />{user?.role}</span>
                </div>
                <button onClick={()=>{ setOpen(false); setShowProfile(true); }} className="w-full text-left px-3 py-2.5 text-xs font-bold text-[#1F2937] hover:bg-[#EAF7F0] rounded-xl flex items-center gap-2">
                  <UserCog className="w-4 h-4 text-[#168B57]" /> My Profile
                </button>
                {user?.is_demo ? (
                  <button onClick={async ()=>{ setOpen(false); await logout(); navigate('/'); }} className="w-full text-left px-3 py-2.5 text-xs font-bold text-amber-700 hover:bg-amber-50 rounded-xl flex items-center gap-2">
                    <FlaskConical className="w-4 h-4" /> Exit Demo
                  </button>
                ) : (
                  <button onClick={logout} className="w-full text-left px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
    {showProfile && <MyProfile onClose={()=>setShowProfile(false)} />}
    </>
  );
};
