import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { NewReport } from './pages/NewReport';
import { Reports } from './pages/Reports';
import { ViewReport } from './pages/ViewReport';
import { EditReport } from './pages/EditReport';
import { Staff } from './pages/admin/Staff';
import { ReportTypes } from './pages/admin/ReportTypes';
import { Parameters } from './pages/admin/Parameters';
import { Settings } from './pages/admin/Settings';

export function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-10 h-10 border-4 border-[#168B57] border-t-transparent rounded-full animate-spin" /></div>;
  }
  if (!user) return <Login />;

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#1F2937] flex flex-col">
      <Header onToggleSidebar={()=>setSidebarOpen(v=>!v)} />
      <div className="flex flex-1">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 max-w-[1600px] w-full mx-auto">
          {activeTab==='dashboard' && <Dashboard setActiveTab={setActiveTab} setSelectedReportId={setSelectedReportId} />}
          {activeTab==='new-report' && <NewReport setActiveTab={setActiveTab} setSelectedReportId={setSelectedReportId} />}
          {activeTab==='reports' && <Reports setActiveTab={setActiveTab} setSelectedReportId={setSelectedReportId} />}
          {activeTab==='view-report' && <ViewReport reportId={selectedReportId} setActiveTab={setActiveTab} setSelectedReportId={setSelectedReportId} />}
          {activeTab==='edit-report' && <EditReport reportId={selectedReportId} setActiveTab={setActiveTab} setSelectedReportId={setSelectedReportId} />}
          {activeTab==='staff' && <Staff />}
          {activeTab==='report-types' && <ReportTypes />}
          {activeTab==='parameters' && <Parameters />}
          {activeTab==='settings' && <Settings />}
        </main>
      </div>
      <Footer />
    </div>
  );
}
export default App;
