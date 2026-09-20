import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, FilePlus, Files, Users, Layers, FlaskConical, Settings, LogOut } from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const { isAdmin, logout } = useAuth();
  const items = [
    { id:'dashboard', label:'Dashboard', icon: LayoutDashboard },
    { id:'new-report', label:'New Report', icon: FilePlus },
    { id:'reports', label:'Reports', icon: Files },
  ];
  const adminItems = [
    { id:'staff', label:'Staff', icon: Users, admin:true },
    { id:'report-types', label:'Report Types', icon: Layers, admin:true },
    { id:'parameters', label:'Parameters', icon: FlaskConical, admin:true },
    { id:'settings', label:'Settings', icon: Settings, admin:true },
  ];
  return (
    <>
      {isOpen && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={()=>setIsOpen(false)} />}
      <aside className={`fixed top-[64px] bottom-0 left-0 z-30 w-64 bg-white border-r border-[#D1D5DB] flex flex-col justify-between p-4 no-print overflow-y-auto transition-transform lg:translate-x-0 ${isOpen?'translate-x-0':'-translate-x-full'}`}>
        <div className="space-y-6">
          <div className="space-y-1">
            {items.map(it=>{
              const Icon=it.icon; const active=activeTab===it.id;
              return <button key={it.id} onClick={()=>{setActiveTab(it.id); setIsOpen(false);}} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold ${active?'bg-[#168B57] text-white':'text-[#1F2937] hover:bg-[#EAF7F0]'}`}>
                <Icon className={`w-4 h-4 ${active?'text-white':'text-[#6B7280]'}`} /> {it.label}
              </button>
            })}
            {isAdmin && (
              <>
                <p className="px-3 pt-4 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Admin</p>
                {adminItems.map(it=>{
                  const Icon=it.icon; const active=activeTab===it.id;
                  return <button key={it.id} onClick={()=>{setActiveTab(it.id); setIsOpen(false);}} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold ${active?'bg-[#168B57] text-white':'text-[#1F2937] hover:bg-[#EAF7F0]'}`}>
                    <Icon className={`w-4 h-4 ${active?'text-white':'text-[#6B7280]'}`} /> {it.label}
                  </button>
                })}
              </>
            )}
          </div>
        </div>
        <div className="pt-3 border-t border-[#D1D5DB]/60">
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl">
            <LogOut className="w-4 h-4" /> Logout
          </button>
          <p className="text-[11px] text-[#6B7280] mt-2 px-2">182-B, Tiruppur Road, Kangeyam - 638701<br/>+91 63793 12357</p>
        </div>
      </aside>
    </>
  );
};
