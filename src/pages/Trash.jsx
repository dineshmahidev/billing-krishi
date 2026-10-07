import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Search, RotateCcw, Trash2, FileText, FlaskConical, Layers, Receipt, RefreshCw } from 'lucide-react';
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

      {/* Category Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          onClick={() => setActiveSubTab('reports')}
          className={`border rounded-2xl p-4 cursor-pointer transition-all ${
            activeSubTab === 'reports'
              ? 'bg-[#168B57] text-white border-[#168B57] shadow-[0_6px_18px_rgba(22,139,87,0.25)]'
              : 'bg-white text-[#1F2937] border-[#D1D5DB] hover:border-[#168B57]'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> Reports
            </p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeSubTab === 'reports' ? 'bg-white/20 text-white' : 'bg-[#EAF7F0] text-[#168B57]'}`}>
              {counts.reports}
            </span>
          </div>
          <p className="text-2xl font-bold mt-2">{counts.reports}</p>
        </div>

        <div
          onClick={() => setActiveSubTab('invoices')}
          className={`border rounded-2xl p-4 cursor-pointer transition-all ${
            activeSubTab === 'invoices'
              ? 'bg-[#168B57] text-white border-[#168B57] shadow-[0_6px_18px_rgba(22,139,87,0.25)]'
              : 'bg-white text-[#1F2937] border-[#D1D5DB] hover:border-[#168B57]'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold flex items-center gap-1.5">
              <Receipt className="w-4 h-4" /> Invoices
            </p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeSubTab === 'invoices' ? 'bg-white/20 text-white' : 'bg-[#EAF7F0] text-[#168B57]'}`}>
              {counts.invoices}
            </span>
          </div>
          <p className="text-2xl font-bold mt-2">{counts.invoices}</p>
        </div>

        <div
          onClick={() => setActiveSubTab('parameters')}
          className={`border rounded-2xl p-4 cursor-pointer transition-all ${
            activeSubTab === 'parameters'
              ? 'bg-[#168B57] text-white border-[#168B57] shadow-[0_6px_18px_rgba(22,139,87,0.25)]'
              : 'bg-white text-[#1F2937] border-[#D1D5DB] hover:border-[#168B57]'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4" /> Parameters
            </p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeSubTab === 'parameters' ? 'bg-white/20 text-white' : 'bg-[#EAF7F0] text-[#168B57]'}`}>
              {counts.parameters}
            </span>
          </div>
          <p className="text-2xl font-bold mt-2">{counts.parameters}</p>
        </div>

        <div
          onClick={() => setActiveSubTab('report_types')}
          className={`border rounded-2xl p-4 cursor-pointer transition-all ${
            activeSubTab === 'report_types'
              ? 'bg-[#168B57] text-white border-[#168B57] shadow-[0_6px_18px_rgba(22,139,87,0.25)]'
              : 'bg-white text-[#1F2937] border-[#D1D5DB] hover:border-[#168B57]'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold flex items-center gap-1.5">
              <Layers className="w-4 h-4" /> Report Types
            </p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeSubTab === 'report_types' ? 'bg-white/20 text-white' : 'bg-[#EAF7F0] text-[#168B57]'}`}>
              {counts.report_types}
            </span>
          </div>
          <p className="text-2xl font-bold mt-2">{counts.report_types}</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white border border-[#D1D5DB] rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('reports')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeSubTab === 'reports' ? 'bg-[#168B57] text-white' : 'bg-[#F3F4F6] text-[#1F2937] hover:bg-[#EAF7F0]'
            }`}
          >
            Reports ({counts.reports})
          </button>
          <button
            onClick={() => setActiveSubTab('invoices')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeSubTab === 'invoices' ? 'bg-[#168B57] text-white' : 'bg-[#F3F4F6] text-[#1F2937] hover:bg-[#EAF7F0]'
            }`}
          >
            Invoices ({counts.invoices})
          </button>
          <button
            onClick={() => setActiveSubTab('parameters')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeSubTab === 'parameters' ? 'bg-[#168B57] text-white' : 'bg-[#F3F4F6] text-[#1F2937] hover:bg-[#EAF7F0]'
            }`}
          >
            Parameters ({counts.parameters})
          </button>
          <button
            onClick={() => setActiveSubTab('report_types')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeSubTab === 'report_types' ? 'bg-[#168B57] text-white' : 'bg-[#F3F4F6] text-[#1F2937] hover:bg-[#EAF7F0]'
            }`}
          >
            Report Types ({counts.report_types})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${activeSubTab.replace('_', ' ')}...`}
            className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-xl text-xs"
          />
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-white border border-[#D1D5DB] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#6B7280]">Loading trash items...</div>
        ) : activeSubTab === 'reports' ? (
          reports.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#6B7280]">
              <Trash2 className="w-8 h-8 text-[#9CA3AF] mx-auto mb-2 opacity-50" />
              No trashed reports found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#EAF7F0] text-[11px] uppercase font-bold text-[#6B7280] border-b border-[#D1D5DB]">
                    <th className="py-2.5 px-4">Report No</th>
                    <th className="py-2.5 px-4">Deleted Date</th>
                    <th className="py-2.5 px-4">Customer</th>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4">Sample</th>
                    <th className="py-2.5 px-4">Created By</th>
                    {!isDemo && <th className="py-2.5 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D1D5DB]/60">
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
                  <tr className="bg-[#EAF7F0] text-[11px] uppercase font-bold text-[#6B7280] border-b border-[#D1D5DB]">
                    <th className="py-2.5 px-4">Invoice No</th>
                    <th className="py-2.5 px-4">Customer</th>
                    <th className="py-2.5 px-4">Amount (₹)</th>
                    <th className="py-2.5 px-4">Deleted Date</th>
                    {!isDemo && <th className="py-2.5 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D1D5DB]/60">
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
            <div className="p-12 text-center text-xs text-[#6B7280]">
              <Trash2 className="w-8 h-8 text-[#9CA3AF] mx-auto mb-2 opacity-50" />
              No trashed parameters found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#EAF7F0] text-[11px] uppercase font-bold text-[#6B7280] border-b border-[#D1D5DB]">
                    <th className="py-2.5 px-4">Parameter Name</th>
                    <th className="py-2.5 px-4">Report Type</th>
                    <th className="py-2.5 px-4">Unit</th>
                    <th className="py-2.5 px-4">Deleted Date</th>
                    {!isDemo && <th className="py-2.5 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D1D5DB]/60">
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
            <div className="p-12 text-center text-xs text-[#6B7280]">
              <Trash2 className="w-8 h-8 text-[#9CA3AF] mx-auto mb-2 opacity-50" />
              No trashed report types found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#EAF7F0] text-[11px] uppercase font-bold text-[#6B7280] border-b border-[#D1D5DB]">
                    <th className="py-2.5 px-4">Report Type Name</th>
                    <th className="py-2.5 px-4">Title</th>
                    <th className="py-2.5 px-4">Deleted Date</th>
                    {!isDemo && <th className="py-2.5 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D1D5DB]/60">
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
