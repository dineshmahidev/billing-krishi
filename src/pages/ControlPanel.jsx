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
import { Enquiries } from './admin/Enquiries';
import { Cms } from './admin/Cms';
import { Settings } from './admin/Settings';
import { Trash } from './Trash';

export const ControlPanel = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EDEAF8]">
        <div className="w-10 h-10 border-4 border-[#168B57] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Login />;

  return (
    <div className="min-h-screen bg-[#EDEAF8] text-[#1F2937] flex flex-col relative antialiased">
      {/* Floating Dock Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Right Column: Header + Main Content */}
      <div className="flex-1 lg:pl-[272px] flex flex-col min-w-0 relative z-10 transition-all duration-300">
        <Header onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="flex-1 p-4 sm:p-6 sm:pt-3 max-w-[1600px] w-full mx-auto relative space-y-6">
          {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} setSelectedReportId={setSelectedReportId} />}
          {activeTab === 'new-report' && <NewReport setActiveTab={setActiveTab} setSelectedReportId={setSelectedReportId} />}
          {activeTab === 'reports' && <Reports setActiveTab={setActiveTab} setSelectedReportId={setSelectedReportId} />}
          {activeTab === 'view-report' && <ViewReport reportId={selectedReportId} setActiveTab={setActiveTab} setSelectedReportId={setSelectedReportId} />}
          {activeTab === 'edit-report' && <EditReport reportId={selectedReportId} setActiveTab={setActiveTab} setSelectedReportId={setSelectedReportId} />}
          {activeTab === 'trash' && <Trash setActiveTab={setActiveTab} />}
          {activeTab === 'enquiries' && <Enquiries />}
          {activeTab === 'staff' && !user?.is_demo && <Staff />}
          {activeTab === 'customers' && <Customers />}
          {activeTab === 'invoices' && <Invoices />}
          {activeTab === 'report-types' && <ReportTypes />}
          {activeTab === 'parameters' && <Parameters />}
          {activeTab === 'cms' && !user?.is_demo && <Cms />}
          {activeTab === 'settings' && !user?.is_demo && <Settings />}
        </main>
      </div>
    </div>
  );
};
export default ControlPanel;
