import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Menu, User, Shield } from 'lucide-react';

export const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#D1D5DB] no-print">
      <div className="px-4 sm:px-6 h-[64px] flex items-center justify-between max-w-[1600px] mx-auto">
        <div className="flex items-center gap-3">
          <button onClick={onToggleSidebar} className="lg:hidden p-2 text-[#6B7280] hover:bg-[#EAF7F0] rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 bg-white">
            <img src="/logo-krishi.png" alt="Krishi Analytical Lab" className="h-10 sm:h-11 w-auto object-contain" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-bold text-[#1F2937] leading-none">{user?.name || 'User'}</p>
            <p className="text-[11px] text-[#6B7280] capitalize">{user?.role || 'staff'}</p>
          </div>
          <div className="relative">
            <button onClick={()=>setOpen(!open)} className="w-9 h-9 rounded-xl bg-[#EAF7F0] text-[#0B6B43] font-bold flex items-center justify-center border border-[#D1D5DB]">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[#D1D5DB] rounded-xl shadow-lg p-2 z-50">
                <div className="px-3 py-2 border-b border-[#D1D5DB]/60 mb-1">
                  <p className="text-xs font-bold text-[#1F2937] truncate">{user?.name}</p>
                  <p className="text-[11px] text-[#6B7280] truncate">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#EAF7F0] text-[#0B6B43]">{user?.role}</span>
                </div>
                <button onClick={logout} className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
