import React, { useEffect, useState } from 'react';
import api, { openPdf, openWord, printReport } from '../services/api';
import { Search, Eye, Pencil, Trash2, FileText, Printer, FileType, Users, FlaskConical, FileClock, ChevronDown, MoreVertical, Receipt } from 'lucide-react';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';

export const Reports = ({ setActiveTab, setSelectedReportId }) => {
  const { addToast } = useToast();
  const { isAdmin } = useAuth();
  const [reports, setReports] = useState([]);
  const [types, setTypes] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({});
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [party, setParty] = useState('');
  const [openSug, setOpenSug] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState(null);

  const loadReports = async (p=1, overrides={}) => {
    setLoading(true);
    try {
      const q = { search, report_type_id:typeFilter||undefined, party:party||undefined, from:from||undefined, to:to||undefined, page:p, per_page:15, ...overrides };
      const res = await api.get('/reports', { params:q });
      setReports(res.data.data);
      setLastPage(res.data.last_page);
      setPage(res.data.current_page);
      setStats(res.data.stats || {});
    } catch {} finally { setLoading(false); }
  };

  useEffect(()=>{ api.get('/report-types').then(r=>setTypes(r.data)).catch(()=>{}); }, []);
  useEffect(()=>{ api.get('/customers', { params:{ per_page:100 } }).then(r=>setCustomers(r.data.data || r.data || [])).catch(()=>{}); }, []);
  useEffect(()=>{
    const t = setTimeout(()=>loadReports(1), 350);
    return ()=>clearTimeout(t);
  }, [search, typeFilter, party, from, to]);

  const suggestions = party.trim()==='' ? customers.slice(0,8) : customers.filter(c =>
    (c.name||'').toLowerCase().includes(party.toLowerCase()) || (c.company_name||'').toLowerCase().includes(party.toLowerCase())
  ).slice(0,8);

  const del = async (id, no) => {
    if (!confirm(`Are you sure you want to delete report ${no}?`)) return;
    try { await api.delete(`/reports/${id}`); addToast('Deleted'); loadReports(page); } catch (e){ addToast(e.response?.data?.message||'Delete failed','error'); }
  };

  const cards = [
    { label:'Total Reports', value: stats.total_reports ?? '-', icon: FileText, cls:'bg-[#168B57] border-[#168B57]', shadow:'shadow-[0_8px_20px_rgba(22,139,87,0.25)]' },
    { label:'Parties', value: stats.parties ?? '-', icon: Users, cls:'bg-sky-500 border-sky-600', shadow:'shadow-[0_8px_20px_rgba(14,165,233,0.25)]' },
    { label:'Tests (parameters)', value: stats.tests ?? '-', icon: FlaskConical, cls:'bg-amber-500 border-amber-600', shadow:'shadow-[0_8px_20px_rgba(245,158,11,0.25)]' },
    { label:'Completed / Draft', value: `${stats.completed ?? 0} / ${stats.draft ?? 0}`, icon: FileClock, cls:'bg-[#1F2937] border-[#1F2937]', shadow:'shadow-[0_8px_20px_rgba(31,41,55,0.25)]' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-[#1F2937]">Reports</h1>
        <button onClick={()=>setActiveTab('new-report')} className="px-4 py-2 rounded-xl bg-[#168B57] hover:bg-[#0B6B43] transition-colors text-white font-bold text-xs">+ New Report</button>
      </div>

      {/* Stats (respect date/party/type/search filters) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map(({label, value, icon: Icon, cls, shadow})=>(
          <div key={label} className={`${cls} ${shadow} border rounded-2xl p-4 text-white`}>
            <p className="text-[11px] font-bold text-white/80 flex items-center gap-1"><Icon className="w-3 h-3"/> {label}</p>
            <p className="text-lg font-bold text-white">{value}</p>
            <p className="text-[11px] text-white/70">{from && to ? `${from} → ${to}` : from ? `From ${from}` : to ? `Until ${to}` : 'All dates'}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#D1D5DB] rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Report No, Party, Sample..." className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
        </div>
        <div className="relative md:w-56">
          <Users className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={party} onChange={e=>{setParty(e.target.value); setOpenSug(true);}} onFocus={()=>setOpenSug(true)} onBlur={()=>setTimeout(()=>setOpenSug(false), 150)} placeholder="Party — pick dropdown or type" className="w-full pl-9 pr-8 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
          <ChevronDown className="w-3.5 h-3.5 text-[#6B7280] absolute right-3 top-1/2 -translate-y-1/2" />
          {openSug && (
            <div className="absolute z-30 mt-1 w-full bg-white border border-[#D1D5DB] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] max-h-56 overflow-y-auto">
              <button type="button" onMouseDown={()=>{setParty(''); setOpenSug(false);}} className="w-full text-left px-3 py-2 text-xs font-bold text-[#0B6B43] hover:bg-[#EAF7F0]">All Parties</button>
              {suggestions.length===0 ? (
                <div className="px-3 py-2 text-xs text-[#6B7280]">No match — will search as typed: <b>{party}</b></div>
              ) : suggestions.map(c=>(
                <button key={c.id} type="button" onMouseDown={()=>{setParty(c.company_name||c.name); setOpenSug(false);}} className="w-full text-left px-3 py-2 text-xs hover:bg-[#EAF7F0] flex items-center justify-between gap-2">
                  <span className="font-bold text-[#1F2937] truncate">{c.company_name || c.name}</span>
                  {c.phone && <span className="text-[#6B7280] shrink-0">{c.phone}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white">
          <option value="">All Types</option>
          {types.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
        <input type="date" value={to} onChange={e=>setTo(e.target.value)} className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
        {(party||search||typeFilter||from||to) && (
          <button onClick={()=>{setParty(''); setSearch(''); setTypeFilter(''); setFrom(''); setTo('');}} className="px-3 py-2 rounded-xl border border-[#D1D5DB] text-xs font-bold text-[#6B7280] hover:bg-[#EAF7F0]">Clear</button>
        )}
      </div>

      <div className="bg-white border border-[#D1D5DB] rounded-2xl overflow-hidden">
        {loading ? <div className="p-8 text-center text-xs text-[#6B7280]">Loading...</div> : reports.length===0 ? <div className="p-8 text-center text-xs text-[#6B7280]">No reports found</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead><tr className="bg-[#EAF7F0] text-[11px] uppercase font-bold text-[#6B7280] border-b border-[#D1D5DB]">
                <th className="py-2.5 px-4">Report No</th><th className="py-2.5 px-4">Date</th><th className="py-2.5 px-4">Company</th><th className="py-2.5 px-4">Type</th><th className="py-2.5 px-4">Sample</th><th className="py-2.5 px-4">By</th><th className="py-2.5 px-4 text-right">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-[#D1D5DB]/60">
                {reports.map(r=>(
                  <tr key={r.id} className="hover:bg-[#EAF7F0]/30">
                    <td className="py-2.5 px-4 font-mono font-bold text-[#0B6B43]">{r.report_no}</td>
                    <td className="py-2.5 px-4">{r.sample_date ? r.sample_date.split('T')[0] : r.created_at?.split('T')[0]}</td>
                    <td className="py-2.5 px-4 font-bold text-[#1F2937]">{r.party_name || r.customer_name || '-'}</td>
                    <td className="py-2.5 px-4">{r.report_type?.name}</td>
                    <td className="py-2.5 px-4">{r.sample_name || '-'}</td>
                    <td className="py-2.5 px-4">{r.creator?.name || '-'}</td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={()=>{setSelectedReportId(r.id); setActiveTab('view-report');}} className="p-1.5 rounded-lg hover:bg-[#EAF7F0] text-[#168B57]" title="View"><Eye className="w-3.5 h-3.5"/></button>
                        <button onClick={()=>{setSelectedReportId(r.id); setActiveTab('edit-report');}} className="p-1.5 rounded-lg hover:bg-[#EAF7F0] text-[#1F2937]" title="Edit"><Pencil className="w-3.5 h-3.5"/></button>
                        <button onClick={()=>openPdf(r.id)} className="p-1.5 rounded-lg hover:bg-[#EAF7F0] text-[#168B57]" title="Report PDF"><FileText className="w-3.5 h-3.5"/></button>
                        <button onClick={(e)=>{
                          if (menu?.id===r.id) { setMenu(null); return; }
                          const b = e.currentTarget.getBoundingClientRect();
                          setMenu({ id:r.id, top:b.bottom+6, right:Math.max(8, window.innerWidth-b.right) });
                        }} className="p-1.5 rounded-lg hover:bg-[#EAF7F0] text-[#6B7280]" title="More actions"><MoreVertical className="w-3.5 h-3.5"/></button>
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
            <button disabled={page<=1} onClick={()=>loadReports(page-1)} className="px-3 py-1 rounded-lg border border-[#D1D5DB] disabled:opacity-50">Prev</button>
            <button disabled={page>=lastPage} onClick={()=>loadReports(page+1)} className="px-3 py-1 rounded-lg border border-[#D1D5DB] disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      {menu && (() => {
        const mr = reports.find(x=>x.id===menu.id);
        const openInvoicePdf = (id) => {
          const t=localStorage.getItem('auth_token');
          const base=import.meta.env.VITE_API_URL||'http://localhost:8000/api';
          window.open(`${base}/reports/${id}/invoice/pdf${t?`?token=${t}`:''}`,'_blank');
        };
        return (
          <>
            <div className="fixed inset-0 z-40" onClick={()=>setMenu(null)} />
            <div className="fixed z-50 w-48 bg-white border border-[#D1D5DB] rounded-xl shadow-[0_12px_36px_rgba(0,0,0,0.18)] py-1 text-xs" style={{ top: menu.top, right: menu.right }}>
              <button onClick={()=>{ const id=menu.id; setMenu(null); openInvoicePdf(id); }} className="w-full text-left px-3 py-2 hover:bg-[#EAF7F0] flex items-center gap-2 font-bold text-[#1F2937]"><Receipt className="w-3.5 h-3.5 text-[#168B57]"/> Invoice PDF (₹)</button>
              <button onClick={()=>{ const id=menu.id; setMenu(null); openWord(id); }} className="w-full text-left px-3 py-2 hover:bg-[#EAF7F0] flex items-center gap-2 font-bold text-[#1F2937]"><FileType className="w-3.5 h-3.5 text-sky-600"/> Word</button>
              <button onClick={()=>{ const id=menu.id; setMenu(null); printReport(id); }} className="w-full text-left px-3 py-2 hover:bg-[#EAF7F0] flex items-center gap-2 font-bold text-[#1F2937]"><Printer className="w-3.5 h-3.5 text-[#6B7280]"/> Print</button>
              {isAdmin && mr && <button onClick={()=>{ const id=mr.id, no=mr.report_no; setMenu(null); del(id, no); }} className="w-full text-left px-3 py-2 hover:bg-red-50 flex items-center gap-2 font-bold text-red-600 border-t border-[#D1D5DB]"><Trash2 className="w-3.5 h-3.5"/> Delete</button>}
            </div>
          </>
        );
      })()}
    </div>
  );
};
