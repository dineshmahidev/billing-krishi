import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { Login } from './Login';
import { Dashboard } from './Dashboard';
import { NewReport } from './NewReport';
import { Reports } from './Reports';
import { ViewReport } from './ViewReport';
import { EditReport } from './EditReport';
import { Staff } from './admin/Staff';
import { Customers } from './admin/Customers';
import { Invoices } from './admin/Invoices';
import { ReportTypes } from './admin/ReportTypes';
import { Parameters } from './admin/Parameters';
import { Cms } from './admin/Cms';
import { Settings } from './admin/Settings';

export const ControlPanel = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-10 h-10 border-4 border-[#168B57] border-t-transparent rounded-full animate-spin" /></div>;
  }
  if (!user) return <Login />;

  return (
    <div className="min-h-screen bg-white text-[#1F2937] flex flex-col relative">
      {/* Plain background with subtle spread dot pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-white">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#168B57 1.5px, transparent 1.5px)', backgroundSize: '20px 20px', opacity: 0.35 }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#9CA3AF 1.5px, transparent 1.5px)', backgroundSize: '40px 40px', opacity: 0.30 }} />
        <div className="absolute top-0 left-0 right-0 h-[35%] bg-gradient-to-b from-[#EAF7F0]/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[25%] bg-gradient-to-t from-[#F3F4F6]/60 to-transparent" />
      </div>
      <Header onToggleSidebar={()=>setSidebarOpen(v=>!v)} />
      <div className="flex flex-1">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 max-w-[1600px] w-full mx-auto relative">
          {activeTab==='dashboard' && <Dashboard setActiveTab={setActiveTab} setSelectedReportId={setSelectedReportId} />}
          {activeTab==='new-report' && <NewReport setActiveTab={setActiveTab} setSelectedReportId={setSelectedReportId} />}
          {activeTab==='reports' && <Reports setActiveTab={setActiveTab} setSelectedReportId={setSelectedReportId} />}
          {activeTab==='view-report' && <ViewReport reportId={selectedReportId} setActiveTab={setActiveTab} setSelectedReportId={setSelectedReportId} />}
          {activeTab==='edit-report' && <EditReport reportId={selectedReportId} setActiveTab={setActiveTab} setSelectedReportId={setSelectedReportId} />}
          {activeTab==='staff' && <Staff />}
          {activeTab==='customers' && <Customers />}
          {activeTab==='invoices' && <Invoices />}
          {activeTab==='report-types' && <ReportTypes />}
          {activeTab==='parameters' && <Parameters />}
          {activeTab==='cms' && <Cms />}
          {activeTab==='settings' && <Settings />}
        </main>
      </div>
    </div>
  );
};
export default ControlPanel;
