import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Menu, User, Shield, UserCog, FlaskConical, ChevronDown } from 'lucide-react';
import { MyProfile } from './MyProfile';

export const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const userInitials =
    user?.name
      ?.split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'AD';

  return (
    <>
      <header className="sticky top-0 z-30 bg-transparent no-print pt-3 sm:pt-4 pb-2 px-4 sm:px-6">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          {/* Left Side: Mobile toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-gray-600 hover:bg-white rounded-2xl border border-gray-200/60 shadow-xs transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {user?.is_demo && (
              <span className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 text-amber-700 text-[11px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wide">
                <FlaskConical className="w-3 h-3" /> Demo Mode
              </span>
            )}
          </div>

          {/* Right Side: Administrator User Info + Round Lime Avatar */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-gray-900 leading-tight">
                {user?.name || 'Krishi Administrator'}
              </p>
              <p className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">
                {user?.email || 'admin@krishilab.com'}
              </p>
            </div>

            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="w-10 h-10 rounded-full bg-[#D2F829] hover:brightness-105 text-black font-black text-xs flex items-center justify-center border-2 border-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:scale-105 active:scale-95"
                title="Account Menu"
              >
                {userInitials}
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl border border-gray-200/80 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.12)] p-2 z-50 overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-[#168B57] to-[#0B6B43] -m-2 mb-2" />
                  <div className="px-3 py-2 border-b border-gray-100 mb-1">
                    <p className="text-xs font-bold text-gray-900 truncate flex items-center gap-1.5">
                      <User className="w-3 h-3 text-[#168B57]" />
                      {user?.name || 'Krishi Administrator'}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">{user?.email || 'admin@krishilab.com'}</p>
                    <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF7F0] text-[#0B6B43] border border-[#D1EEE0]">
                      <Shield className="w-3 h-3" />
                      {user?.role || 'admin'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setOpen(false);
                      setShowProfile(true);
                    }}
                    className="w-full text-left px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-[#EAF7F0] hover:text-[#0B6B43] rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <UserCog className="w-4 h-4 text-[#168B57]" /> My Profile
                  </button>
                  {user?.is_demo ? (
                    <button
                      onClick={async () => {
                        setOpen(false);
                        await logout();
                        navigate('/');
                      }}
                      className="w-full text-left px-3 py-2.5 text-xs font-bold text-amber-700 hover:bg-amber-50 rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <FlaskConical className="w-4 h-4" /> Exit Demo
                    </button>
                  ) : (
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      {showProfile && <MyProfile onClose={() => setShowProfile(false)} />}
    </>
  );
};
