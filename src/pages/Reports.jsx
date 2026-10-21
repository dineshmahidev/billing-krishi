import React, { useEffect, useState } from 'react';
import api, { openPdf, openWord, printReport } from '../services/api';
import { Search, Eye, Pencil, Trash2, FileText, Printer, FileType, Users, FlaskConical, FileClock, FileCheck, ChevronDown, MoreVertical, Receipt, MessageCircle, ArrowUpRight } from 'lucide-react';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import { WhatsAppModal } from '../components/common/WhatsAppModal';

export const Reports = ({ setActiveTab, setSelectedReportId }) => {
  const { addToast } = useToast();
  const { isAdmin, isDemo } = useAuth();
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
  const [waModal, setWaModal] = useState({ isOpen: false, phone: '', recipientName: '', docTitle: '', summaryLines: [], pdfUrl: '' });

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
    if (isDemo) { addToast('Demo mode is read-only', 'error'); return; }
    if (!confirm(`Are you sure you want to move report ${no} to Trash?`)) return;
    try { await api.delete(`/reports/${id}`); addToast(`Report ${no} moved to trash`, 'success'); loadReports(page); } catch (e){ addToast(e.response?.data?.message||'Delete failed','error'); }
  };

  const cards = [
    {
      label: 'TOTAL REPORTS',
      value: stats.total_reports ?? '-',
      icon: FileText,
      color: 'text-[#168B57]',
      bubbleBg: 'bg-[#EAF7F0]',
      bubbleColor: 'text-[#168B57]',
      borderColor: 'border-emerald-100/70',
      shadowColor: 'shadow-[0_4px_25px_rgba(22,139,87,0.03)]'
    },
    {
      label: 'PARTIES',
      value: stats.parties ?? '-',
      icon: Users,
      color: 'text-[#0284C7]',
      bubbleBg: 'bg-[#E0F2FE]',
      bubbleColor: 'text-[#0284C7]',
      borderColor: 'border-sky-100/70',
      shadowColor: 'shadow-[0_4px_25px_rgba(14,165,233,0.03)]'
    },
    {
      label: 'TESTS (PARAMETERS)',
      value: stats.tests ?? '-',
      icon: FlaskConical,
      color: 'text-[#D97706]',
      bubbleBg: 'bg-[#FEF3C7]',
      bubbleColor: 'text-[#D97706]',
      borderColor: 'border-amber-100/70',
      shadowColor: 'shadow-[0_4px_25px_rgba(245,158,11,0.03)]'
    },
    {
      label: 'COMPLETED REPORTS',
      value: stats.completed ?? 0,
      icon: FileCheck,
      color: 'text-[#8B5CF6]',
      bubbleBg: 'bg-[#F3E8FF]',
      bubbleColor: 'text-[#8B5CF6]',
      borderColor: 'border-purple-100/70',
      shadowColor: 'shadow-[0_4px_25px_rgba(139,92,246,0.03)]'
    },
  ];

  return (
    <div className="space-y-6">
      {isDemo && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-center gap-2 text-amber-800 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <span>Demo Access Mode (Read-Only): Only existing demo data is accessible. Creating, editing, and deleting reports are disabled.</span>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Reports</h1>
          <p className="text-xs text-gray-400 font-medium mt-0.5">Laboratory Report Management System • Complete Database</p>
        </div>
        {!isDemo && (
          <button onClick={()=>setActiveTab('new-report')} className="px-5 py-2.5 rounded-2xl bg-[#168B57] hover:bg-[#0B6B43] transition-colors text-white font-bold text-xs shadow-xs">+ New Report</button>
        )}
      </div>

      {/* Stats (matching Dashboard container UI) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map(({label, value, icon: Icon, color, bubbleBg, bubbleColor, borderColor, shadowColor})=>(
          <div
            key={label}
            className={`bg-white rounded-3xl p-6 border ${borderColor} ${shadowColor} flex flex-col justify-between hover:shadow-md transition-all min-h-[168px]`}
          >
            <div className="flex items-start justify-between">
              <span className={`${color} text-xs font-black tracking-wider flex items-center gap-1.5 uppercase`}>
                {label} <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
              </span>
              <div className={`w-10 h-10 rounded-2xl ${bubbleBg} flex items-center justify-center ${bubbleColor} shrink-0`}>
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>
            <p className="text-4xl font-black text-gray-900 tracking-tight leading-none my-3">
              {value}
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-gray-50">
              <span className="text-xs font-medium text-gray-400">
                {from && to ? `${from} → ${to}` : from ? `From ${from}` : to ? `Until ${to}` : 'All dates'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-white/80 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder="Search Report No, Customer, Sample..."
            className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs"
          />
        </div>
        <div className="relative md:w-64">
          <Users className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={party}
            onChange={e=>{setParty(e.target.value); setOpenSug(true);}}
            onFocus={()=>setOpenSug(true)}
            onBlur={()=>setTimeout(()=>setOpenSug(false), 150)}
            placeholder="Customer — pick or type"
            className="w-full pl-10 pr-9 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs"
          />
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          {openSug && (
            <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] max-h-56 overflow-y-auto p-1.5">
              <button type="button" onMouseDown={()=>{setParty(''); setOpenSug(false);}} className="w-full text-left px-3 py-2 text-xs font-bold text-[#168B57] hover:bg-emerald-50 rounded-xl transition-colors">All Customers</button>
              {suggestions.length===0 ? (
                <div className="px-3 py-2 text-xs text-gray-400 font-medium">No match — will search as typed: <b>{party}</b></div>
              ) : suggestions.map(c=>(
                <button key={c.id} type="button" onMouseDown={()=>{setParty(c.company_name||c.name); setOpenSug(false);}} className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 rounded-xl flex items-center justify-between gap-2 transition-colors">
                  <span className="font-bold text-gray-900 truncate">{c.company_name || c.name}</span>
                  {c.phone && <span className="text-gray-400 shrink-0 text-[11px] font-medium">{c.phone}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        <select
          value={typeFilter}
          onChange={e=>setTypeFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs"
        >
          <option value="">All Types</option>
          {types.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <input
          type="date"
          value={from}
          onChange={e=>setFrom(e.target.value)}
          className="px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs"
        />
        <input
          type="date"
          value={to}
          onChange={e=>setTo(e.target.value)}
          className="px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs"
        />
        {(party||search||typeFilter||from||to) && (
          <button
            onClick={()=>{setParty(''); setSearch(''); setTypeFilter(''); setFrom(''); setTo('');}}
            className="px-4 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 shadow-2xs transition-all"
          >
            Clear
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100/80 space-y-4">
        {loading ? <div className="py-12 text-center text-xs text-gray-400 font-medium">Loading reports...</div> : reports.length===0 ? <div className="py-12 text-center text-xs text-gray-400 font-medium">No report records found. Click &quot;New Report&quot; to create one.</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-separate border-spacing-y-1">
              <thead><tr className="bg-[#EFEAFD] text-[11px] uppercase font-black tracking-wider text-[#7A709E]">
                <th className="py-3 px-4 rounded-l-2xl">REPORT NO</th><th className="py-3 px-4">DATE</th><th className="py-3 px-4">CUSTOMER</th><th className="py-3 px-4">TYPE</th><th className="py-3 px-4">SAMPLE</th><th className="py-3 px-4">BY</th><th className="py-3 px-4 text-right rounded-r-2xl">ACTIONS</th>
              </tr></thead>
              <tbody>
                {reports.map(r=>(
                  <tr key={r.id} className="hover:bg-purple-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-purple-700">{r.report_no}</td>
                    <td className="py-3 px-4 text-gray-500 font-medium">{r.sample_date ? r.sample_date.split('T')[0] : r.created_at?.split('T')[0]}</td>
                    <td className="py-3 px-4 font-bold text-gray-900">{r.party_name || r.customer_name || '-'}</td>
                    <td className="py-3 px-4 text-gray-600 font-medium">{r.report_type?.name}</td>
                    <td className="py-3 px-4 text-gray-600 font-medium">{r.sample_name || '-'}</td>
                    <td className="py-3 px-4 text-gray-500 font-medium">{r.creator?.name || '-'}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={()=>{setSelectedReportId(r.id); setActiveTab('view-report');}} className="p-1.5 rounded-xl hover:bg-purple-100/60 text-purple-700 transition-colors" title="View"><Eye className="w-3.5 h-3.5"/></button>
                        {!isDemo && (
                          <button onClick={()=>{setSelectedReportId(r.id); setActiveTab('edit-report');}} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-700 transition-colors" title="Edit"><Pencil className="w-3.5 h-3.5"/></button>
                        )}
                        <button onClick={()=>openPdf(r.id)} className="p-1.5 rounded-xl hover:bg-emerald-50 text-emerald-700 transition-colors" title="Report PDF"><FileText className="w-3.5 h-3.5"/></button>
                        {!isDemo && (
                          <button onClick={()=>del(r.id, r.report_no)} className="p-1.5 rounded-xl hover:bg-red-50 text-red-600 transition-colors" title="Delete (Move to Trash)"><Trash2 className="w-3.5 h-3.5"/></button>
                        )}
                        <button onClick={(e)=>{
                          if (menu?.id===r.id) { setMenu(null); return; }
                          const b = e.currentTarget.getBoundingClientRect();
                          setMenu({ id:r.id, top:b.bottom+6, right:Math.max(8, window.innerWidth-b.right) });
                        }} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors" title="More actions"><MoreVertical className="w-3.5 h-3.5"/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="text-gray-400 font-medium">Page {page} of {lastPage}</span>
          <div className="flex gap-1">
            <button disabled={page<=1} onClick={()=>loadReports(page-1)} className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-bold disabled:opacity-40 hover:bg-gray-50 transition-colors">Prev</button>
            <button disabled={page>=lastPage} onClick={()=>loadReports(page+1)} className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-bold disabled:opacity-40 hover:bg-gray-50 transition-colors">Next</button>
          </div>
        </div>
      </div>

      {menu && (() => {
        const mr = reports.find(x => x.id === menu.id);
        const openInvoicePdf = (id) => {
          const t = localStorage.getItem('auth_token');
          const base = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
          window.open(`${base}/reports/${id}/invoice/pdf${t ? `?token=${t}` : ''}`, '_blank');
        };
        const shareReportWhatsapp = (r) => {
          if (!r) return;
          const partyName = r.party_name || r.customer_name || 'Customer';
          const phone = r.customer?.phone || '';
          const repNo = r.report_no || '-';
          const repType = r.report_type?.name || 'Report';
          const sample = r.sample_name || '-';
          const date = r.sample_date ? r.sample_date.split('T')[0] : (r.created_at?.split('T')[0] || '-');
          const veh = r.vehicle_no || '-';
          const token = localStorage.getItem('auth_token');
          const base = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
          const pdfUrl = `${base}/reports/${r.id}/pdf${token ? `?token=${token}` : ''}`;

          setWaModal({
            isOpen: true,
            phone,
            recipientName: partyName,
            docTitle: `TEST REPORT: ${repNo}`,
            summaryLines: [
              `*Report No:* ${repNo}`,
              `*Customer:* ${partyName}`,
              `*Type:* ${repType}`,
              `*Sample:* ${sample}`,
              `*Vehicle:* ${veh}`,
              `*Sample Date:* ${date}`,
            ],
            pdfUrl,
          });
        };
        return (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenu(null)} />
            <div className="fixed z-50 w-48 bg-white border border-[#D1D5DB] rounded-xl shadow-[0_12px_36px_rgba(0,0,0,0.18)] py-1 text-xs" style={{ top: menu.top, right: menu.right }}>
              <button onClick={() => { const r = mr; setMenu(null); shareReportWhatsapp(r); }} className="w-full text-left px-3 py-2 hover:bg-[#EAF7F0] flex items-center gap-2 font-bold text-[#1F2937]"><MessageCircle className="w-3.5 h-3.5 text-[#25D366]"/> WhatsApp Share</button>
              <button onClick={() => { const id = menu.id; setMenu(null); openInvoicePdf(id); }} className="w-full text-left px-3 py-2 hover:bg-[#EAF7F0] flex items-center gap-2 font-bold text-[#1F2937]"><Receipt className="w-3.5 h-3.5 text-[#168B57]"/> Invoice PDF (₹)</button>
              <button onClick={() => { const id = menu.id; setMenu(null); openWord(id); }} className="w-full text-left px-3 py-2 hover:bg-[#EAF7F0] flex items-center gap-2 font-bold text-[#1F2937]"><FileType className="w-3.5 h-3.5 text-sky-600"/> Word</button>
              <button onClick={() => { const id = menu.id; setMenu(null); printReport(id); }} className="w-full text-left px-3 py-2 hover:bg-[#EAF7F0] flex items-center gap-2 font-bold text-[#1F2937]"><Printer className="w-3.5 h-3.5 text-[#6B7280]"/> Print</button>
              {isAdmin && mr && <button onClick={() => { const id = mr.id, no = mr.report_no; setMenu(null); del(id, no); }} className="w-full text-left px-3 py-2 hover:bg-red-50 flex items-center gap-2 font-bold text-red-600 border-t border-[#D1D5DB]"><Trash2 className="w-3.5 h-3.5"/> Delete</button>}
            </div>
          </>
        );
      })()}

      {/* WhatsApp Share Modal */}
      <WhatsAppModal
        isOpen={waModal.isOpen}
        onClose={() => setWaModal(m => ({ ...m, isOpen: false }))}
        phone={waModal.phone}
        recipientName={waModal.recipientName}
        docTitle={waModal.docTitle}
        summaryLines={waModal.summaryLines}
        pdfUrl={waModal.pdfUrl}
      />
    </div>
  );
};
