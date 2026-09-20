import React, { useEffect, useState } from 'react';
import api, { openPdf } from '../services/api';
import { FilePlus, Search, Eye, Pencil, FileText, Printer } from 'lucide-react';

export const Dashboard = ({ setActiveTab, setSelectedReportId }) => {
  const [metrics, setMetrics] = useState({ total_reports:0, today_reports:0, month_reports:0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard');
      setMetrics(res.data.metrics || {});
      setRecent(res.data.recent_reports || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(()=>{ fetch(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1F2937]">Dashboard</h1>
          <p className="text-xs text-[#6B7280]">Laboratory Report Management System</p>
        </div>
        <button onClick={()=>setActiveTab('new-report')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#168B57] hover:bg-[#0B6B43] text-white font-bold text-xs">
          <FilePlus className="w-4 h-4" /> + New Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-[#D1D5DB] bg-white">
          <p className="text-[11px] font-bold uppercase text-[#6B7280]">Total Reports</p>
          <p className="text-2xl font-black text-[#1F2937] mt-1">{metrics.total_reports}</p>
        </div>
        <div className="p-5 rounded-2xl border border-[#D1D5DB] bg-white">
          <p className="text-[11px] font-bold uppercase text-[#6B7280]">Today's Reports</p>
          <p className="text-2xl font-black text-[#168B57] mt-1">{metrics.today_reports}</p>
        </div>
        <div className="p-5 rounded-2xl border border-[#D1D5DB] bg-white">
          <p className="text-[11px] font-bold uppercase text-[#6B7280]">This Month</p>
          <p className="text-2xl font-black text-[#0B6B43] mt-1">{metrics.month_reports}</p>
        </div>
      </div>

      <div className="bg-white border border-[#D1D5DB] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[#D1D5DB] flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#1F2937]">Recent Reports</h2>
          <button onClick={()=>setActiveTab('reports')} className="text-xs font-bold text-[#168B57]">View All</button>
        </div>
        {loading ? <div className="p-8 text-center text-xs text-[#6B7280]">Loading...</div> : recent.length===0 ? <div className="p-8 text-center text-xs text-[#6B7280]">No reports yet. Create your first report.</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead><tr className="bg-[#EAF7F0] text-[11px] font-bold uppercase text-[#6B7280] border-b border-[#D1D5DB]">
                <th className="py-2.5 px-4">Report No</th><th className="py-2.5 px-4">Date</th><th className="py-2.5 px-4">Party / Customer</th><th className="py-2.5 px-4">Type</th><th className="py-2.5 px-4">Sample</th><th className="py-2.5 px-4">By</th><th className="py-2.5 px-4 text-right">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-[#D1D5DB]/60">
                {recent.map(r=>(
                  <tr key={r.id} className="hover:bg-[#EAF7F0]/40">
                    <td className="py-2.5 px-4 font-mono font-bold text-[#0B6B43]">{r.report_no}</td>
                    <td className="py-2.5 px-4 text-[#6B7280]">{r.sample_date ? r.sample_date.split('T')[0] : r.created_at?.split('T')[0]}</td>
                    <td className="py-2.5 px-4 font-bold text-[#1F2937]">{r.party_name || r.customer_name || '-'}</td>
                    <td className="py-2.5 px-4">{r.report_type?.name}</td>
                    <td className="py-2.5 px-4">{r.sample_name || r.nature_of_sample || '-'}</td>
                    <td className="py-2.5 px-4">{r.creator?.name || '-'}</td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={()=>{setSelectedReportId(r.id); setActiveTab('view-report');}} className="p-1.5 rounded-lg hover:bg-[#EAF7F0] text-[#168B57]"><Eye className="w-3.5 h-3.5"/></button>
                        <button onClick={()=>{setSelectedReportId(r.id); setActiveTab('edit-report');}} className="p-1.5 rounded-lg hover:bg-[#EAF7F0] text-[#1F2937]"><Pencil className="w-3.5 h-3.5"/></button>
                        <button onClick={()=>openPdf(r.id)} className="p-1.5 rounded-lg hover:bg-[#EAF7F0] text-[#6B7280]"><FileText className="w-3.5 h-3.5"/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
