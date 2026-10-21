import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FilePlus,
  Files,
  Users,
  Layers,
  FlaskConical,
  Settings,
  Globe,
  LogOut,
  Building2,
  Receipt,
  Trash2,
  MessageSquare,
  X
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const { isAdmin, user, logout } = useAuth();

  const labItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(!user?.is_demo ? [{ id: 'new-report', label: 'New Report', icon: FilePlus }] : []),
    { id: 'reports', label: 'Reports', icon: Files },
  ];

  const adminItems = [
    { id: 'customers', label: 'Customers', icon: Building2 },
    { id: 'invoices', label: 'Invoices', icon: Receipt },
    { id: 'report-types', label: 'Report Types', icon: Layers },
    { id: 'parameters', label: 'Parameters', icon: FlaskConical },
    { id: 'enquiries', label: 'Enquiries & Traffic', icon: MessageSquare },
    ...(!user?.is_demo ? [{ id: 'staff', label: 'Staff Team', icon: Users }] : []),
    ...(!user?.is_demo ? [{ id: 'cms', label: 'Website CMS', icon: Globe }] : []),
    ...(!user?.is_demo ? [{ id: 'settings', label: 'Settings', icon: Settings }] : []),
  ];

  const renderItem = (it) => {
    const Icon = it.icon;
    const active = activeTab === it.id;

    return (
      <button
        key={it.id}
        onClick={() => {
          setActiveTab(it.id);
          setIsOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs transition-all duration-200 text-left group ${
          active
            ? 'bg-gradient-to-r from-[#168B57] to-[#0B6B43] text-white font-black shadow-[0_4px_14px_rgba(22,139,87,0.25)] scale-[1.01]'
            : 'text-gray-600 hover:text-[#0B6B43] hover:bg-[#EAF7F0] font-semibold'
        }`}
      >
        <Icon
          className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
            active ? 'text-white stroke-[2.4]' : 'text-gray-400 group-hover:text-[#0B6B43]'
          }`}
        />
        <span className="truncate">{it.label}</span>
      </button>
    );
  };

  const userInitials =
    user?.name
      ?.split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'KL';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sleek Light Custom Scrollbar */}
      <style>{`
        .custom-sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-sidebar-scroll::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 4px;
        }
        .custom-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1;
        }
      `}</style>

      {/* Floating Light Theme Sidebar (Matching Landing Page UI) */}
      <aside
        className={`fixed top-2.5 bottom-2.5 z-50 w-[260px] bg-white border border-gray-200/90 rounded-[28px] p-3 flex flex-col justify-between shadow-[0_10px_30px_rgba(11,107,67,0.06)] transition-transform duration-300 ease-out no-print ${
          isOpen ? 'left-2.5 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:left-2.5'
        }`}
      >
        {/* TOP BRAND HEADER & SCROLLABLE NAV */}
        <div className="flex flex-col min-h-0 flex-1">
          {/* Centered 2x Bigger Logo Header */}
          <div className="relative flex items-center justify-center p-2 pb-3.5 border-b border-gray-100 shrink-0">
            {/* Mobile Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden absolute top-1 right-1 p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 shrink-0"
              aria-label="Close Sidebar"
            >
              <X className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setActiveTab('dashboard');
                setIsOpen(false);
              }}
              className="flex items-center justify-center w-full group transition-transform duration-200 hover:scale-[1.02]"
              title="Krishi Analytical Laboratory"
            >
              <img
                src="/krishi-transparent.png"
                alt="Krishi Analytical Laboratory"
                className="h-16 sm:h-20 w-auto object-contain max-w-[215px] mx-auto"
              />
            </button>
          </div>

          {/* NAVIGATION LINKS CONTAINER (SCROLLABLE) */}
          <div className="custom-sidebar-scroll overflow-y-auto flex-1 pr-1 pt-2 space-y-4">
            
            {/* Section 1: Laboratory */}
            <div>
              <div className="flex items-center justify-between px-3 py-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                  LABORATORY
                </span>
                <div className="h-[1px] bg-gray-100 flex-1 ml-3" />
              </div>
              <div className="space-y-1 mt-1">
                {labItems.map(renderItem)}
              </div>
            </div>

            {/* Section 2: Administration (Admin Only) */}
            {isAdmin && (
              <div>
                <div className="flex items-center justify-between px-3 py-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                    ADMINISTRATION
                  </span>
                  <div className="h-[1px] bg-gray-100 flex-1 ml-3" />
                </div>
                <div className="space-y-1 mt-1">
                  {adminItems.map(renderItem)}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* BOTTOM SECTION: TRASH AT THE VERY BOTTOM + USER PROFILE CARD */}
        <div className="pt-2 space-y-2 border-t border-gray-100 shrink-0">
          {/* Trash Button - Placed at the very bottom / last */}
          <button
            onClick={() => {
              setActiveTab('trash');
              setIsOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs transition-all duration-200 text-left group ${
              activeTab === 'trash'
                ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white font-black shadow-[0_4px_14px_rgba(220,38,38,0.25)] scale-[1.01]'
                : 'text-gray-500 hover:text-red-600 hover:bg-red-50/80 font-semibold'
            }`}
          >
            <Trash2
              className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                activeTab === 'trash' ? 'text-white stroke-[2.4]' : 'text-gray-400 group-hover:text-red-500'
              }`}
            />
            <span className="truncate">Trash &amp; Archive</span>
          </button>

          {/* User Profile Card */}
          <div className="p-2.5 rounded-2xl bg-[#EAF7F0] border border-[#D1EEE0] flex items-center justify-between shadow-xs text-gray-900">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#168B57] to-[#0B6B43] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                {userInitials}
              </div>
              <div className="min-w-0 text-left">
                <p className="font-black text-xs text-gray-900 leading-tight truncate max-w-[120px]">
                  {user?.name || 'Krishi Admin'}
                </p>
                <p className="text-[10px] font-bold text-[#0B6B43] leading-tight capitalize truncate mt-0.5">
                  {user?.role === 'admin' ? 'Super Admin' : user?.role || 'Staff Chemist'}
                </p>
              </div>
            </div>

            {/* Logout Action Button */}
            <button
              onClick={logout}
              title="Logout"
              className="w-8 h-8 rounded-xl bg-white hover:bg-red-50 text-gray-500 hover:text-red-600 border border-gray-200/90 hover:border-red-200 flex items-center justify-center shadow-xs transition-all hover:scale-105 active:scale-95 shrink-0 ml-1.5"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
