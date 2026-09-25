import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, FilePlus, Files, Users, Layers, FlaskConical, Settings, Globe, LogOut, Building2, Receipt } from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const { isAdmin, logout } = useAuth();
  const items = [
    { id:'dashboard', label:'Dashboard', icon: LayoutDashboard },
    { id:'new-report', label:'New Report', icon: FilePlus },
    { id:'reports', label:'Reports', icon: Files },
  ];
  const adminItems = [
    { id:'staff', label:'Staff', icon: Users, admin:true },
    { id:'customers', label:'Customers', icon: Building2, admin:true },
    { id:'invoices', label:'Invoices', icon: Receipt, admin:true },
    { id:'report-types', label:'Report Types', icon: Layers, admin:true },
    { id:'parameters', label:'Parameters', icon: FlaskConical, admin:true },
    { id:'cms', label:'Website CMS', icon: Globe, admin:true },
    { id:'settings', label:'Settings', icon: Settings, admin:true },
  ];
  return (
    <>
      {isOpen && <div className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden" onClick={()=>setIsOpen(false)} />}
      <style>{`aside::-webkit-scrollbar{width:6px} aside::-webkit-scrollbar-thumb{background:#168B57; border-radius:4px} aside::-webkit-scrollbar-track{background:#EAF7F0}`}</style>
      <aside className={`fixed top-[64px] bottom-0 z-30 w-64 bg-white border-r border-[#D1D5DB] flex flex-col justify-between p-4 no-print overflow-y-auto shadow-[4px_0_24px_rgba(22,139,87,0.06)] transition-transform duration-300 lg:left-0 lg:right-auto right-0 lg:translate-x-0 ${isOpen?'translate-x-0':'translate-x-full lg:translate-x-0'}`}>
        <div className="space-y-6">
          <div className="space-y-1">
            {items.map(it=>{
              const Icon=it.icon; const active=activeTab===it.id;
              return <button key={it.id} onClick={()=>{setActiveTab(it.id); setIsOpen(false);}} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${active?'bg-gradient-to-r from-[#168B57] to-[#0B6B43] text-white shadow-[0_4px_12px_rgba(22,139,87,0.3)]':'text-[#1F2937] hover:bg-[#EAF7F0] hover:translate-x-0.5'}`}>
                <Icon className={`w-4 h-4 ${active?'text-white':'text-[#6B7280]'}`} /> {it.label}
              </button>
            })}
            {isAdmin && (
              <>
                <p className="px-3 pt-4 text-[10px] font-bold uppercase tracking-widest text-[#6B7280] flex items-center gap-1">Admin <span className="w-1 h-1 bg-[#168B57] rounded-full" /></p>
                {adminItems.map(it=>{
                  const Icon=it.icon; const active=activeTab===it.id;
                  return <button key={it.id} onClick={()=>{setActiveTab(it.id); setIsOpen(false);}} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${active?'bg-gradient-to-r from-[#168B57] to-[#0B6B43] text-white shadow-[0_4px_12px_rgba(22,139,87,0.3)]':'text-[#1F2937] hover:bg-[#EAF7F0] hover:translate-x-0.5'}`}>
                    <Icon className={`w-4 h-4 ${active?'text-white':'text-[#6B7280]'}`} /> {it.label}
                  </button>
                })}
              </>
            )}
          </div>
        </div>
        <div className="pt-3 border-t border-[#D1D5DB]/40">
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};
