import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Search, RotateCcw, Trash2, FileText, FlaskConical, Layers, Receipt, RefreshCw, ArrowUpRight } from 'lucide-react';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';

export const Trash = ({ setActiveTab }) => {
  const { addToast } = useToast();
  const { isAdmin, isDemo } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('reports'); // 'reports' | 'invoices' | 'parameters' | 'report_types'
  const [reports, setReports] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [reportTypes, setReportTypes] = useState([]);
  const [counts, setCounts] = useState({ reports: 0, invoices: 0, parameters: 0, report_types: 0 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadTrash = async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/trash', {
        params: {
          search,
          type: activeSubTab,
          page: p,
          per_page: 15,
        },
      });
      if (res.data.reports) {
        setReports(res.data.reports.data || []);
        setLastPage(res.data.reports.last_page || 1);
        setPage(res.data.reports.current_page || 1);
      }
      setInvoices(res.data.invoices || []);
      setParameters(res.data.parameters || []);
      setReportTypes(res.data.report_types || []);
      setCounts(res.data.counts || { reports: 0, invoices: 0, parameters: 0, report_types: 0 });
    } catch (err) {
      addToast('Failed to load trash items', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => loadTrash(1), 300);
    return () => clearTimeout(t);
  }, [search, activeSubTab]);

  const handleRestoreReport = async (id, reportNo) => {
    if (isDemo) { addToast('Demo Mode: Action disabled', 'error'); return; }
    if (!confirm(`Restore report ${reportNo} (and its invoice) back to active records?`)) return;
    try {
      const res = await api.post(`/trash/reports/${id}/restore`);
      addToast(res.data.message || `Report ${reportNo} restored`, 'success');
      loadTrash(page);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to restore report', 'error');
    }
  };

  const handleForceDeleteReport = async (id, reportNo) => {
    if (isDemo) { addToast('Demo Mode: Action disabled', 'error'); return; }
    if (!confirm(`PERMANENT DELETE WARNING:\nAre you sure you want to PERMANENTLY delete report ${reportNo}?\nThis action CANNOT be undone!`)) return;
    try {
      const res = await api.delete(`/trash/reports/${id}/force`);
      addToast(res.data.message || `Report ${reportNo} permanently deleted`, 'success');
      loadTrash(page);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to permanently delete report', 'error');
    }
  };

  const handleRestoreInvoice = async (id, invNo) => {
    if (isDemo) { addToast('Demo Mode: Action disabled', 'error'); return; }
    if (!confirm(`Restore invoice ${invNo}?`)) return;
    try {
      const res = await api.post(`/trash/invoices/${id}/restore`);
      addToast(res.data.message || `Invoice ${invNo} restored`, 'success');
      loadTrash(page);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to restore invoice', 'error');
    }
  };

  const handleForceDeleteInvoice = async (id, invNo) => {
    if (isDemo) { addToast('Demo Mode: Action disabled', 'error'); return; }
    if (!confirm(`PERMANENT DELETE WARNING:\nAre you sure you want to PERMANENTLY delete invoice ${invNo}?\nThis action CANNOT be undone!`)) return;
    try {
      const res = await api.delete(`/trash/invoices/${id}/force`);
      addToast(res.data.message || `Invoice ${invNo} permanently deleted`, 'success');
      loadTrash(page);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to permanently delete invoice', 'error');
    }
  };

  const handleRestoreParameter = async (id, name) => {
    if (isDemo) { addToast('Demo Mode: Action disabled', 'error'); return; }
    if (!confirm(`Restore parameter "${name}"?`)) return;
    try {
      const res = await api.post(`/trash/parameters/${id}/restore`);
      addToast(res.data.message || `Parameter "${name}" restored`, 'success');
      loadTrash(page);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to restore parameter', 'error');
    }
  };

  const handleForceDeleteParameter = async (id, name) => {
    if (isDemo) { addToast('Demo Mode: Action disabled', 'error'); return; }
    if (!confirm(`PERMANENT DELETE WARNING:\nAre you sure you want to PERMANENTLY delete parameter "${name}"?\nThis action CANNOT be undone!`)) return;
    try {
      const res = await api.delete(`/trash/parameters/${id}/force`);
      addToast(res.data.message || `Parameter "${name}" permanently deleted`, 'success');
      loadTrash(page);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to permanently delete parameter', 'error');
    }
  };

  const handleRestoreReportType = async (id, name) => {
    if (isDemo) { addToast('Demo Mode: Action disabled', 'error'); return; }
    if (!confirm(`Restore report type "${name}"?`)) return;
    try {
      const res = await api.post(`/trash/report-types/${id}/restore`);
      addToast(res.data.message || `Report type "${name}" restored`, 'success');
      loadTrash(page);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to restore report type', 'error');
    }
  };

  const handleForceDeleteReportType = async (id, name) => {
    if (isDemo) { addToast('Demo Mode: Action disabled', 'error'); return; }
    if (!confirm(`PERMANENT DELETE WARNING:\nAre you sure you want to PERMANENTLY delete report type "${name}"?\nThis action CANNOT be undone!`)) return;
    try {
      const res = await api.delete(`/trash/report-types/${id}/force`);
      addToast(res.data.message || `Report type "${name}" permanently deleted`, 'success');
      loadTrash(page);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to permanently delete report type', 'error');
    }
  };

  const handleEmptyTrash = async () => {
    if (isDemo) { addToast('Demo Mode: Action disabled', 'error'); return; }
    if (!confirm(`PERMANENT DELETE ALL:\nAre you sure you want to EMPTY THE TRASH?\nAll soft-deleted reports, invoices, parameters, and report types will be PERMANENTLY removed.\nThis action CANNOT be undone!`)) return;
    try {
      const res = await api.delete('/trash/empty');
      addToast(res.data.message || 'Trash emptied successfully', 'success');
      loadTrash(1);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to empty trash', 'error');
    }
  };

  const totalTrashedCount = (counts.reports || 0) + (counts.invoices || 0) + (counts.parameters || 0) + (counts.report_types || 0);

  return (
    <div className="space-y-4">
      {isDemo && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-800 font-semibold flex items-center justify-between">
          <span>🔒 Demo Mode: You are in read-only access. Restoring and permanent deletion are disabled.</span>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" /> Trash / Recycle Bin
          </h1>
          <p className="text-xs text-[#6B7280]">
            Soft-deleted reports, invoices, parameters, and report types are safely stored here. Restore or permanently delete them.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadTrash(page)}
            className="px-3 py-2 rounded-xl border border-[#D1D5DB] text-xs font-bold text-[#1F2937] hover:bg-[#EAF7F0] flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          {isAdmin && !isDemo && totalTrashedCount > 0 && (
            <button
              onClick={handleEmptyTrash}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 transition-colors text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" /> Empty Trash
            </button>
          )}
        </div>
      </div>

      {/* Category Cards (matching Dashboard stat card container UI) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          onClick={() => setActiveSubTab('reports')}
          className={`bg-white rounded-3xl p-6 border transition-all cursor-pointer min-h-[168px] flex flex-col justify-between ${
            activeSubTab === 'reports'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md scale-[1.01]'
              : 'border-emerald-100/70 shadow-[0_4px_25px_rgba(22,139,87,0.03)] hover:shadow-md hover:border-emerald-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <span className="text-[#168B57] text-xs font-black tracking-wider flex items-center gap-1.5 uppercase">
              REPORTS <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
            </span>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${activeSubTab === 'reports' ? 'bg-[#168B57] text-white' : 'bg-[#EAF7F0] text-[#168B57]'}`}>
              <FileText className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <p className="text-4xl font-black text-gray-900 tracking-tight leading-none my-3">
            {counts.reports}
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-gray-50">
            <span className="text-xs font-medium text-gray-400">
              Trashed reports
            </span>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${activeSubTab === 'reports' ? 'bg-[#EAF7F0] text-[#0B6B43]' : 'text-gray-400'}`}>
              {activeSubTab === 'reports' ? 'Active' : 'View'}
            </span>
          </div>
        </div>

        <div
          onClick={() => setActiveSubTab('invoices')}
          className={`bg-white rounded-3xl p-6 border transition-all cursor-pointer min-h-[168px] flex flex-col justify-between ${
            activeSubTab === 'invoices'
              ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-md scale-[1.01]'
              : 'border-sky-100/70 shadow-[0_4px_25px_rgba(14,165,233,0.03)] hover:shadow-md hover:border-sky-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <span className="text-[#0284C7] text-xs font-black tracking-wider flex items-center gap-1.5 uppercase">
              INVOICES <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
            </span>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${activeSubTab === 'invoices' ? 'bg-[#0284C7] text-white' : 'bg-[#E0F2FE] text-[#0284C7]'}`}>
              <Receipt className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <p className="text-4xl font-black text-gray-900 tracking-tight leading-none my-3">
            {counts.invoices}
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-gray-50">
            <span className="text-xs font-medium text-gray-400">
              Trashed invoices
            </span>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${activeSubTab === 'invoices' ? 'bg-sky-50 text-sky-700' : 'text-gray-400'}`}>
              {activeSubTab === 'invoices' ? 'Active' : 'View'}
            </span>
          </div>
        </div>

        <div
          onClick={() => setActiveSubTab('parameters')}
          className={`bg-white rounded-3xl p-6 border transition-all cursor-pointer min-h-[168px] flex flex-col justify-between ${
            activeSubTab === 'parameters'
              ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md scale-[1.01]'
              : 'border-amber-100/70 shadow-[0_4px_25px_rgba(245,158,11,0.03)] hover:shadow-md hover:border-amber-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <span className="text-[#D97706] text-xs font-black tracking-wider flex items-center gap-1.5 uppercase">
              PARAMETERS <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
            </span>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${activeSubTab === 'parameters' ? 'bg-[#D97706] text-white' : 'bg-[#FEF3C7] text-[#D97706]'}`}>
              <FlaskConical className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <p className="text-4xl font-black text-gray-900 tracking-tight leading-none my-3">
            {counts.parameters}
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-gray-50">
            <span className="text-xs font-medium text-gray-400">
              Trashed parameters
            </span>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${activeSubTab === 'parameters' ? 'bg-amber-50 text-amber-700' : 'text-gray-400'}`}>
              {activeSubTab === 'parameters' ? 'Active' : 'View'}
            </span>
          </div>
        </div>

        <div
          onClick={() => setActiveSubTab('report_types')}
          className={`bg-white rounded-3xl p-6 border transition-all cursor-pointer min-h-[168px] flex flex-col justify-between ${
            activeSubTab === 'report_types'
              ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-md scale-[1.01]'
              : 'border-purple-100/70 shadow-[0_4px_25px_rgba(139,92,246,0.03)] hover:shadow-md hover:border-purple-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <span className="text-[#8B5CF6] text-xs font-black tracking-wider flex items-center gap-1.5 uppercase">
              REPORT TYPES <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
            </span>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${activeSubTab === 'report_types' ? 'bg-[#8B5CF6] text-white' : 'bg-[#F3E8FF] text-[#8B5CF6]'}`}>
              <Layers className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <p className="text-4xl font-black text-gray-900 tracking-tight leading-none my-3">
            {counts.report_types}
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-gray-50">
            <span className="text-xs font-medium text-gray-400">
              Trashed types
            </span>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${activeSubTab === 'report_types' ? 'bg-purple-50 text-purple-700' : 'text-gray-400'}`}>
              {activeSubTab === 'report_types' ? 'Active' : 'View'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-3xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-white/80 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('reports')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-2xs ${
              activeSubTab === 'reports' ? 'bg-[#168B57] text-white shadow-[0_4px_14px_rgba(22,139,87,0.25)]' : 'bg-gray-100 text-gray-700 hover:bg-emerald-50'
            }`}
          >
            Reports ({counts.reports})
          </button>
          <button
            onClick={() => setActiveSubTab('invoices')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-2xs ${
              activeSubTab === 'invoices' ? 'bg-[#168B57] text-white shadow-[0_4px_14px_rgba(22,139,87,0.25)]' : 'bg-gray-100 text-gray-700 hover:bg-emerald-50'
            }`}
          >
            Invoices ({counts.invoices})
          </button>
          <button
            onClick={() => setActiveSubTab('parameters')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-2xs ${
              activeSubTab === 'parameters' ? 'bg-[#168B57] text-white shadow-[0_4px_14px_rgba(22,139,87,0.25)]' : 'bg-gray-100 text-gray-700 hover:bg-emerald-50'
            }`}
          >
            Parameters ({counts.parameters})
          </button>
          <button
            onClick={() => setActiveSubTab('report_types')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-2xs ${
              activeSubTab === 'report_types' ? 'bg-[#168B57] text-white shadow-[0_4px_14px_rgba(22,139,87,0.25)]' : 'bg-gray-100 text-gray-700 hover:bg-emerald-50'
            }`}
          >
            Report Types ({counts.report_types})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${activeSubTab.replace('_', ' ')}...`}
            className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-3xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-white/80 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-400 font-medium">Loading trash items...</div>
        ) : activeSubTab === 'reports' ? (
          reports.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-400 font-medium">
              <Trash2 className="w-8 h-8 text-gray-300 mx-auto mb-2 opacity-50" />
              No trashed reports found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#EFEAFD] text-[11px] uppercase font-bold text-[#7A709E] border-b border-purple-100/60">
                    <th className="py-3 px-4 rounded-l-2xl">Report No</th>
                    <th className="py-3 px-4">Deleted Date</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Sample</th>
                    <th className="py-3 px-4">Created By</th>
                    {!isDemo && <th className="py-3 px-4 text-right rounded-r-2xl">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reports.map((r) => (
                    <tr key={r.id} className="hover:bg-red-50/20">
                      <td className="py-2.5 px-4 font-mono font-bold text-[#0B6B43]">{r.report_no}</td>
                      <td className="py-2.5 px-4 text-[#6B7280]">
                        {r.deleted_at ? new Date(r.deleted_at).toLocaleString() : '-'}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-[#1F2937]">{r.party_name || r.customer_name || '-'}</td>
                      <td className="py-2.5 px-4">{r.report_type?.name || '-'}</td>
                      <td className="py-2.5 px-4">{r.sample_name || '-'}</td>
                      <td className="py-2.5 px-4">{r.creator?.name || '-'}</td>
                      {!isDemo && (
                        <td className="py-2.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleRestoreReport(r.id, r.report_no)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#EAF7F0] text-[#168B57] hover:bg-[#168B57] hover:text-white font-bold text-xs flex items-center gap-1 transition-colors"
                              title="Restore report"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Restore
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => handleForceDeleteReport(r.id, r.report_no)}
                                className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-bold text-xs flex items-center gap-1 transition-colors"
                                title="Permanently Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete Permanently
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : activeSubTab === 'invoices' ? (
          invoices.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#6B7280]">
              <Trash2 className="w-8 h-8 text-[#9CA3AF] mx-auto mb-2 opacity-50" />
              No trashed invoices found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#EFEAFD] text-[11px] uppercase font-bold text-[#7A709E] border-b border-purple-100/60">
                    <th className="py-3 px-4 rounded-l-2xl">Invoice No</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Amount (₹)</th>
                    <th className="py-3 px-4">Deleted Date</th>
                    {!isDemo && <th className="py-3 px-4 text-right rounded-r-2xl">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-red-50/20">
                      <td className="py-2.5 px-4 font-mono font-bold text-[#0B6B43]">{inv.invoice_no}</td>
                      <td className="py-2.5 px-4 font-bold text-[#1F2937]">{inv.party_name || inv.customer_name || '-'}</td>
                      <td className="py-2.5 px-4 font-bold text-[#168B57]">₹{inv.total_amount}</td>
                      <td className="py-2.5 px-4 text-[#6B7280]">
                        {inv.deleted_at ? new Date(inv.deleted_at).toLocaleString() : '-'}
                      </td>
                      {!isDemo && (
                        <td className="py-2.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleRestoreInvoice(inv.id, inv.invoice_no)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#EAF7F0] text-[#168B57] hover:bg-[#168B57] hover:text-white font-bold text-xs flex items-center gap-1 transition-colors"
                              title="Restore invoice"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Restore
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => handleForceDeleteInvoice(inv.id, inv.invoice_no)}
                                className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-bold text-xs flex items-center gap-1 transition-colors"
                                title="Permanently Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete Permanently
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : activeSubTab === 'parameters' ? (
          parameters.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-400 font-medium">
              <Trash2 className="w-8 h-8 text-gray-300 mx-auto mb-2 opacity-50" />
              No trashed parameters found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#EFEAFD] text-[11px] uppercase font-bold text-[#7A709E] border-b border-purple-100/60">
                    <th className="py-3 px-4 rounded-l-2xl">Parameter Name</th>
                    <th className="py-3 px-4">Report Type</th>
                    <th className="py-3 px-4">Unit</th>
                    <th className="py-3 px-4">Deleted Date</th>
                    {!isDemo && <th className="py-3 px-4 text-right rounded-r-2xl">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {parameters.map((p) => (
                    <tr key={p.id} className="hover:bg-red-50/20">
                      <td className="py-2.5 px-4 font-bold text-[#1F2937]">{p.name}</td>
                      <td className="py-2.5 px-4">{p.report_type?.name || '-'}</td>
                      <td className="py-2.5 px-4">{p.unit || '-'}</td>
                      <td className="py-2.5 px-4 text-[#6B7280]">
                        {p.deleted_at ? new Date(p.deleted_at).toLocaleString() : '-'}
                      </td>
                      {!isDemo && (
                        <td className="py-2.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleRestoreParameter(p.id, p.name)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#EAF7F0] text-[#168B57] hover:bg-[#168B57] hover:text-white font-bold text-xs flex items-center gap-1 transition-colors"
                              title="Restore parameter"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Restore
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => handleForceDeleteParameter(p.id, p.name)}
                                className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-bold text-xs flex items-center gap-1 transition-colors"
                                title="Permanently Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete Permanently
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          reportTypes.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-400 font-medium">
              <Trash2 className="w-8 h-8 text-gray-300 mx-auto mb-2 opacity-50" />
              No trashed report types found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#EFEAFD] text-[11px] uppercase font-bold text-[#7A709E] border-b border-purple-100/60">
                    <th className="py-3 px-4 rounded-l-2xl">Report Type Name</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Deleted Date</th>
                    {!isDemo && <th className="py-3 px-4 text-right rounded-r-2xl">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reportTypes.map((rt) => (
                    <tr key={rt.id} className="hover:bg-red-50/20">
                      <td className="py-2.5 px-4 font-bold text-[#1F2937]">{rt.name}</td>
                      <td className="py-2.5 px-4">{rt.title || '-'}</td>
                      <td className="py-2.5 px-4 text-[#6B7280]">
                        {rt.deleted_at ? new Date(rt.deleted_at).toLocaleString() : '-'}
                      </td>
                      {!isDemo && (
                        <td className="py-2.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleRestoreReportType(rt.id, rt.name)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#EAF7F0] text-[#168B57] hover:bg-[#168B57] hover:text-white font-bold text-xs flex items-center gap-1 transition-colors"
                              title="Restore report type"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Restore
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => handleForceDeleteReportType(rt.id, rt.name)}
                                className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-bold text-xs flex items-center gap-1 transition-colors"
                                title="Permanently Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete Permanently
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* Pagination */}
        {activeSubTab === 'reports' && reports.length > 0 && (
          <div className="p-3 border-t border-[#D1D5DB] flex items-center justify-between text-xs">
            <span className="text-[#6B7280]">
              Page {page} of {lastPage}
            </span>
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => loadTrash(page - 1)}
                className="px-3 py-1 rounded-lg border border-[#D1D5DB] disabled:opacity-50"
              >
                Prev
              </button>
              <button
                disabled={page >= lastPage}
                onClick={() => loadTrash(page + 1)}
                className="px-3 py-1 rounded-lg border border-[#D1D5DB] disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Trash;
