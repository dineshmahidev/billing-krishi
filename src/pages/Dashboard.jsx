import React, { useEffect, useState } from 'react';
import api, { openPdf } from '../services/api';
import {
  FilePlus,
  Eye,
  Pencil,
  FileText,
  Calendar,
  ChevronRight,
  TrendingUp,
  Globe,
  CalendarClock,
  ArrowUpRight
} from 'lucide-react';

const toLocalISO = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const todayISO = () => toLocalISO(new Date());

const firstDayISO = () => {
  const d = new Date();
  d.setDate(1);
  return toLocalISO(d);
};

export const Dashboard = ({ setActiveTab, setSelectedReportId }) => {
  const [metrics, setMetrics] = useState({ total_reports: 0, today_reports: 0, month_reports: 0 });
  const [traffic, setTraffic] = useState({ total_visits: 0, today_visits: 0, unique_ips: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  // Date range filter
  const [fromDate, setFromDate] = useState(firstDayISO);
  const [toDate, setToDate] = useState(todayISO);

  const loadDashboard = async (from = fromDate, to = toDate) => {
    setLoading(true);
    try {
      const [res, trafRes] = await Promise.all([
        api.get('/dashboard', { params: { from, to } }),
        api.get('/traffic/stats').catch(() => ({ data: { total_visits: 0, today_visits: 0 } })),
      ]);
      setMetrics(res.data.metrics || {});
      setRecent(res.data.recent_reports || []);
      setTraffic(trafRes.data || { total_visits: 0, today_visits: 0, unique_ips: 0 });
    } catch {} finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let from = fromDate;
    let to = toDate;
    if (from && to && from > to) {
      [from, to] = [to, from];
      setFromDate(from);
      setToDate(to);
    }
    loadDashboard(from, to);
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header: Title & Subtitle + Date Filter + New Report Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-xs text-gray-400 font-medium mt-0.5">
            Laboratory Report Management System
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Date Filter Bar */}
          <div className="bg-white rounded-2xl px-3 py-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-white/90 flex items-center gap-2 text-xs text-gray-700">
            <div className="flex items-center gap-1.5 text-gray-500 font-semibold px-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <input
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-transparent text-xs font-semibold text-gray-700 outline-none focus:text-[#168B57] cursor-pointer"
              />
            </div>
            <span className="text-gray-400 text-[11px] font-medium">to</span>
            <div className="flex items-center gap-1.5 text-gray-500 font-semibold px-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-transparent text-xs font-semibold text-gray-700 outline-none focus:text-[#168B57] cursor-pointer"
              />
            </div>
            <button
              onClick={applyFilter}
              className="bg-[#0E2030] hover:bg-black text-white px-3 py-1 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Apply
            </button>
          </div>

          {/* New Report Action Button */}
          <button
            onClick={() => setActiveTab('new-report')}
            className="bg-[#168B57] hover:bg-[#0B6B43] text-white px-5 py-2.5 rounded-2xl font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <FilePlus className="w-4 h-4" /> + New Report
          </button>
        </div>
      </div>

      {/* STAT CARDS CONTAINER (CORRECT DATA TEXT FROM ATTACHED SCREENSHOT) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: TOTAL REPORTS */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-100/70 shadow-[0_4px_25px_rgba(22,139,87,0.03)] flex flex-col justify-between hover:shadow-md transition-all min-h-[168px]">
          <div className="flex items-start justify-between">
            <span className="text-[#168B57] text-xs font-black tracking-wider flex items-center gap-1.5 uppercase">
              TOTAL REPORTS <ArrowUpRight className="w-3.5 h-3.5 text-[#168B57]/60" />
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#EAF7F0] flex items-center justify-center text-[#168B57] shrink-0">
              <FileText className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <p className="text-4xl font-black text-gray-900 tracking-tight leading-none my-3">
            {metrics.total_reports || 0}
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-gray-50">
            <span className="text-xs font-medium text-gray-400">
              All time created
            </span>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs font-bold text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: TODAY'S REPORTS */}
        <div className="bg-white rounded-3xl p-6 border border-sky-100/70 shadow-[0_4px_25px_rgba(14,165,233,0.03)] flex flex-col justify-between hover:shadow-md transition-all min-h-[168px]">
          <div className="flex items-start justify-between">
            <span className="text-[#0284C7] text-xs font-black tracking-wider flex items-center gap-1.5 uppercase">
              TODAY&apos;S REPORTS <ArrowUpRight className="w-3.5 h-3.5 text-[#0284C7]/60" />
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#E0F2FE] flex items-center justify-center text-[#0284C7] shrink-0">
              <CalendarClock className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <p className="text-4xl font-black text-gray-900 tracking-tight leading-none my-3">
            {metrics.today_reports || 0}
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-gray-50">
            <span className="text-xs font-medium text-gray-400">
              Created now
            </span>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs font-bold text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors"
            >
              View today <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 3: THIS MONTH */}
        <div className="bg-white rounded-3xl p-6 border border-amber-100/70 shadow-[0_4px_25px_rgba(245,158,11,0.03)] flex flex-col justify-between hover:shadow-md transition-all min-h-[168px]">
          <div className="flex items-start justify-between">
            <span className="text-[#D97706] text-xs font-black tracking-wider flex items-center gap-1.5 uppercase">
              THIS MONTH <ArrowUpRight className="w-3.5 h-3.5 text-[#D97706]/60" />
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#FEF3C7] flex items-center justify-center text-[#D97706] shrink-0">
              <TrendingUp className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <p className="text-4xl font-black text-gray-900 tracking-tight leading-none my-3">
            {metrics.month_reports || 0}
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-gray-50">
            <span className="text-xs font-medium text-gray-400">
              Current billing month
            </span>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs font-bold text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors"
            >
              View month <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 4: WEB TRAFFIC */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-100/70 shadow-[0_4px_25px_rgba(11,107,67,0.03)] flex flex-col justify-between hover:shadow-md transition-all min-h-[168px]">
          <div className="flex items-start justify-between">
            <span className="text-[#0B6B43] text-xs font-black tracking-wider flex items-center gap-1.5 uppercase">
              WEB TRAFFIC <ArrowUpRight className="w-3.5 h-3.5 text-[#0B6B43]/60" />
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#EAF7F0] flex items-center justify-center text-[#0B6B43] shrink-0">
              <Globe className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <p className="text-4xl font-black text-gray-900 tracking-tight leading-none my-3">
            {traffic.total_visits?.toLocaleString() || 0}
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-gray-50">
            <span className="text-xs font-medium text-gray-400">
              {traffic.today_visits || 0} visits today
            </span>
            <button
              onClick={() => setActiveTab('enquiries')}
              className="text-xs font-bold text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors"
            >
              View traffic <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* TABLE CONTAINER: RECENT REPORTS */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-gray-900 tracking-tight">Recent Reports</h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Laboratory Report Management System • Live Feed
            </p>
          </div>
          <button
            onClick={() => setActiveTab('reports')}
            className="text-xs font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
          >
            View all <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400 font-medium">Loading reports...</div>
        ) : recent.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400 font-medium">
            No reports yet. Click &quot;+ New Report&quot; to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-separate border-spacing-y-1">
              {/* Lavender Header Strip matching reference UI */}
              <thead>
                <tr className="bg-[#EFEAFD] text-[#7A709E] text-[11px] font-black uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-l-2xl">REPORT NO</th>
                  <th className="py-3 px-4">DATE</th>
                  <th className="py-3 px-4">CUSTOMER</th>
                  <th className="py-3 px-4">TYPE</th>
                  <th className="py-3 px-4">SAMPLE</th>
                  <th className="py-3 px-4">BY</th>
                  <th className="py-3 px-4 text-right rounded-r-2xl">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id} className="hover:bg-purple-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0B6B43]">
                      {r.report_no}
                    </td>
                    <td className="py-3 px-4 text-gray-500 font-medium">
                      {r.sample_date ? r.sample_date.split('T')[0] : r.created_at?.split('T')[0]}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      {r.party_name || r.customer_name || '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-medium">
                      {r.report_type?.name || '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-medium">
                      {r.sample_name || r.nature_of_sample || '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-500 font-medium">
                      {r.creator?.name || '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedReportId(r.id);
                            setActiveTab('view-report');
                          }}
                          className="p-1.5 rounded-xl hover:bg-[#EAF7F0] text-[#168B57] transition-colors"
                          title="View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedReportId(r.id);
                            setActiveTab('edit-report');
                          }}
                          className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-700 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openPdf(r.id)}
                          className="p-1.5 rounded-xl hover:bg-emerald-50 text-emerald-700 transition-colors"
                          title="PDF"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
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
export default Dashboard;
