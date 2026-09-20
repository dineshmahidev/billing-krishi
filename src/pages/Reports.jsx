import React, { useEffect, useState } from 'react';
import api, { openPdf } from '../services/api';
import { Search, Eye, Pencil, Trash2, FileText, Printer } from 'lucide-react';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';

export const Reports = ({ setActiveTab, setSelectedReportId }) => {
  const { addToast } = useToast();
  const { isAdmin } = useAuth();
  const [reports, setReports] = useState([]);
  const [types, setTypes] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetch = async (p=1) => {
    setLoading(true);
    try {
      const res = await api.get('/reports', { params:{ search, report_type_id:typeFilter||undefined, from:from||undefined, to:to||undefined, page:p, per_page:15 }});
      setReports(res.data.data);
      setLastPage(res.data.last_page);
      setPage(res.data.current_page);
    } catch {} finally { setLoading(false); }
  };

  useEffect(()=>{ api.get('/report-types').then(r=>setTypes(r.data)).catch(()=>{}); }, []);
  useEffect(()=>{ fetch(1); }, [search, typeFilter, from, to]);

  const del = async (id, no) => {
    if (!confirm(`Are you sure you want to delete report ${no}?`)) return;
    try { await api.delete(`/reports/${id}`); addToast('Deleted'); fetch(page); } catch (e){ addToast(e.response?.data?.message||'Delete failed','error'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-[#1F2937]">Reports</h1>
        <button onClick={()=>setActiveTab('new-report')} className="px-4 py-2 rounded-xl bg-[#168B57] text-white font-bold text-xs">+ New Report</button>
      </div>

      <div className="bg-white border border-[#D1D5DB] rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Report No, Party, Sample..." className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
        </div>
        <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white">
          <option value="">All Types</option>
          {types.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
        <input type="date" value={to} onChange={e=>setTo(e.target.value)} className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
      </div>

      <div className="bg-white border border-[#D1D5DB] rounded-2xl overflow-hidden">
        {loading ? <div className="p-8 text-center text-xs text-[#6B7280]">Loading...</div> : reports.length===0 ? <div className="p-8 text-center text-xs text-[#6B7280]">No reports found</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead><tr className="bg-[#EAF7F0] text-[11px] uppercase font-bold text-[#6B7280] border-b border-[#D1D5DB]">
                <th className="py-2.5 px-4">Report No</th><th className="py-2.5 px-4">Date</th><th className="py-2.5 px-4">Party/Customer</th><th className="py-2.5 px-4">Type</th><th className="py-2.5 px-4">Sample</th><th className="py-2.5 px-4">By</th><th className="py-2.5 px-4 text-right">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-[#D1D5DB]/60">
                {reports.map(r=>(
                  <tr key={r.id} className="hover:bg-[#EAF7F0]/30">
                    <td className="py-2.5 px-4 font-mono font-bold text-[#0B6B43]">{r.report_no}</td>
                    <td className="py-2.5 px-4">{r.sample_date ? r.sample_date.split('T')[0] : r.created_at?.split('T')[0]}</td>
                    <td className="py-2.5 px-4 font-bold text-[#1F2937]">{r.party_name || r.customer_name || '-'}</td>
                    <td className="py-2.5 px-4">{r.report_type?.name}</td>
                    <td className="py-2.5 px-4">{r.sample_name || r.nature_of_sample || '-'}</td>
                    <td className="py-2.5 px-4">{r.creator?.name || '-'}</td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={()=>{setSelectedReportId(r.id); setActiveTab('view-report');}} className="p-1.5 rounded-lg hover:bg-[#EAF7F0] text-[#168B57]" title="View"><Eye className="w-3.5 h-3.5"/></button>
                        <button onClick={()=>{setSelectedReportId(r.id); setActiveTab('edit-report');}} className="p-1.5 rounded-lg hover:bg-[#EAF7F0] text-[#1F2937]" title="Edit"><Pencil className="w-3.5 h-3.5"/></button>
                        <button onClick={()=>openPdf(r.id)} className="p-1.5 rounded-lg hover:bg-[#EAF7F0] text-[#6B7280]" title="PDF"><FileText className="w-3.5 h-3.5"/></button>
                        <button onClick={()=>openPdf(r.id)} className="p-1.5 rounded-lg hover:bg-[#EAF7F0] text-[#6B7280]" title="Print"><Printer className="w-3.5 h-3.5"/></button>
                        {isAdmin && <button onClick={()=>del(r.id, r.report_no)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Delete"><Trash2 className="w-3.5 h-3.5"/></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="p-3 border-t border-[#D1D5DB] flex items-center justify-between text-xs">
          <span className="text-[#6B7280]">Page {page} of {lastPage}</span>
          <div className="flex gap-1">
            <button disabled={page<=1} onClick={()=>fetch(page-1)} className="px-3 py-1 rounded-lg border border-[#D1D5DB] disabled:opacity-50">Prev</button>
            <button disabled={page>=lastPage} onClick={()=>fetch(page+1)} className="px-3 py-1 rounded-lg border border-[#D1D5DB] disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};
