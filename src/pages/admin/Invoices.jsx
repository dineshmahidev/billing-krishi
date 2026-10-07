import React, { useEffect, useState } from 'react';
import api, { openInvoiceWord, downloadInvoiceWord } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { WhatsAppModal } from '../../components/common/WhatsAppModal';
import { Receipt, Search, Filter, DollarSign, TrendingUp, Clock, FileType, FileDown, Pencil, X, Layers, Calculator, MessageCircle } from 'lucide-react';

export const openWhatsappMessage = (phone, text) => {
  let cleanPhone = (phone || '').toString().replace(/[^0-9]/g, '');
  if (!cleanPhone) {
    const input = window.prompt('Enter client WhatsApp number (10 digits):');
    if (!input) return;
    cleanPhone = input.replace(/[^0-9]/g, '');
  }
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};

export const Invoices = () => {
  const { addToast } = useToast();
  const { isDemo } = useAuth();
  const [data, setData] = useState({ data:[], stats:{} });
  const [types, setTypes] = useState([]);
  const [search, setSearch] = useState('');
  const [company, setCompany] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editInv, setEditInv] = useState(null);
  const [editItems, setEditItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingInv, setLoadingInv] = useState(false);
  const [tab, setTab] = useState('invoices');
  const [waModal, setWaModal] = useState({ isOpen: false, phone: '', recipientName: '', docTitle: '', summaryLines: [], pdfUrl: '' });

  const loadInvoices = async (p=1) => {
    setLoading(true);
    try {
      const r = await api.get('/invoices', { params:{ search:search||undefined, company:company||undefined, report_type_id:typeFilter||undefined, status:status||undefined, from:from||undefined, to:to||undefined, page:p, per_page:15 }});
      setData(r.data);
      setPage(r.data.current_page || p);
    } catch { addToast('Failed to load invoices','error'); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ api.get('/report-types').then(r=>setTypes(r.data)).catch(()=>{}); }, []);
  useEffect(()=>{
    const t = setTimeout(()=>loadInvoices(1), 350);
    return ()=>clearTimeout(t);
  }, [search, company, typeFilter, status, from, to]);

  const toggleStatus = async (inv) => {
    if (isDemo) { addToast('Demo Mode: Action disabled','error'); return; }
    const newStatus = inv.status === 'paid' ? 'unpaid' : 'paid';
    try {
      await api.put(`/reports/${inv.report_id}/invoice/status`, { status: newStatus });
      addToast(`Marked ${newStatus}`);
      loadInvoices(page);
    } catch { addToast('Status update failed','error'); }
  };

  const openInvoice = (reportId) => {
    const token = localStorage.getItem('auth_token');
    const base = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    window.open(`${base}/reports/${reportId}/invoice/pdf?_t=${Date.now()}${token?`&token=${token}`:''}`, '_blank');
  };

  const openInvoiceDoc = (reportId) => {
    try { openInvoiceWord(reportId); } catch { addToast('Invoice Word open failed','error'); }
  };

  const downloadInvoiceDoc = (inv) => {
    try { downloadInvoiceWord(inv.report_id, `${inv.invoice_no}.doc`); addToast('Invoice Word downloading'); } catch { addToast('Invoice Word download failed','error'); }
  };

  const shareInvoiceWhatsapp = (inv) => {
    const partyName = inv.party_name || inv.customer_name || 'Customer';
    const phone = inv.customer_phone || inv.report?.customer?.phone || '';
    const invNo = inv.invoice_no;
    const repNo = inv.report?.report_no || '-';
    const invDate = inv.created_at?.split('T')[0] || new Date().toISOString().split('T')[0];
    const subtotal = Number(inv.subtotal || 0).toFixed(2);
    const total = Number(inv.total_amount || 0).toFixed(2);
    const gst = inv.gst_enabled ? `₹${Number(inv.gst_amount||0).toFixed(2)} (${inv.gst_percent}%)` : '—';
    const status = (inv.status || 'unpaid').toUpperCase();
    const token = localStorage.getItem('auth_token');
    const base = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const pdfUrl = `${base}/reports/${inv.report_id}/invoice/pdf?_t=${Date.now()}${token ? `&token=${token}` : ''}`;

    setWaModal({
      isOpen: true,
      phone,
      recipientName: partyName,
      docTitle: `INVOICE: ${invNo}`,
      summaryLines: [
        `*Customer:* ${partyName}`,
        `*Report No:* ${repNo}`,
        `*Date:* ${invDate}`,
        `*Subtotal:* ₹${subtotal}`,
        `*GST:* ${gst}`,
        `*Total Amount:* ₹${total}`,
        `*Status:* ${status}`,
      ],
      pdfUrl,
    });
  };

  const stats = data.stats || {};

  const openEdit = async (inv) => {
    if (isDemo) { addToast('Demo Mode: Action disabled','error'); return; }
    setEditInv(inv); setLoadingInv(true);
    try {
      const r = await api.get(`/reports/${inv.report_id}/invoice`);
      const items = (r.data.items||[]).map(i=>({ ...i, rate:Number(i.rate), qty: (i.qty !== undefined && i.qty !== null && i.qty !== '') ? Number(i.qty) : 1 }));
      setEditItems(items);
    } catch(err){ addToast(err.response?.data?.message||'Failed to load invoice','error'); setEditInv(null); }
    finally { setLoadingInv(false); }
  };
  const closeEdit = () => { setEditInv(null); setEditItems([]); };
  const setItem = (idx, field, value) => setEditItems(arr => arr.map((it,i)=> i===idx ? {...it, [field]: value} : it));
  const liveSub = editItems.reduce((s,it)=> s + (Number(it.rate)||0) * (Number(it.qty)||0), 0);
  const liveGst = editInv?.gst_enabled ? liveSub * (Number(editInv.gst_percent)||0) / 100 : 0;
  const saveItems = async () => {
    if (isDemo) { addToast('Demo Mode: Action disabled','error'); return; }
    if (!editInv) return;
    setSaving(true);
    try {
      const payload = { 
        items: editItems.map(it=>({ 
          id: it.id,
          parameter_id: it.parameter_id, 
          name: it.name,
          rate: Number(it.rate)||0, 
          qty: Math.max(0, parseInt(it.qty) || 0) 
        })) 
      };
      await api.put(`/reports/${editInv.report_id}/invoice/items`, payload);
      addToast('Invoice updated successfully');
      closeEdit(); 
      loadInvoices(page);
    } catch(err){ 
      addToast(err.response?.data?.message||'Update failed','error'); 
    }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4 max-w-6xl">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#EAF7F0] flex items-center justify-center text-[#168B57]"><Receipt className="w-5 h-5"/></div>
        <div><h1 className="text-xl font-bold">Invoices</h1><p className="text-xs text-[#6B7280]">Separate from analysis report — GST on/off, paid toggle, revenue, PDF &amp; Word export</p></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id:'invoices', label:'Invoices', icon:Receipt },
          { id:'group', label:'Group Summary', icon:Layers },
          { id:'settlement', label:'Bulk Settlement', icon:Calculator },
        ].map(({id,label,icon:Icon})=>(
          <button key={id} onClick={()=>setTab(id)} className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${tab===id ? 'bg-[#168B57] text-white shadow-[0_4px_12px_rgba(22,139,87,0.3)]' : 'bg-white border border-[#D1D5DB] text-[#6B7280] hover:bg-[#EAF7F0]'}`}>
            <Icon className="w-3.5 h-3.5"/> {label}
          </button>
        ))}
      </div>

      {tab==='invoices' && (<>

      {/* Revenue */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#168B57] border border-[#168B57] rounded-2xl p-4 text-white shadow-[0_8px_20px_rgba(22,139,87,0.25)]">
          <p className="text-[11px] font-bold text-white/80 flex items-center gap-1"><DollarSign className="w-3 h-3"/> Total Revenue</p>
          <p className="text-lg font-bold text-white">₹{Number(stats.total_revenue||0).toFixed(2)}</p>
          <p className="text-[11px] text-white/70">{stats.total_invoices||0} invoices</p>
        </div>
        <div className="bg-emerald-500 border border-emerald-600 rounded-2xl p-4 text-white shadow-[0_8px_20px_rgba(16,185,129,0.25)]">
          <p className="text-[11px] font-bold text-white/80 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Paid</p>
          <p className="text-lg font-bold text-white">₹{Number(stats.paid_revenue||0).toFixed(2)}</p>
          <p className="text-[11px] text-white/70">{stats.paid_count||0} paid</p>
        </div>
        <div className="bg-amber-500 border border-amber-600 rounded-2xl p-4 text-white shadow-[0_8px_20px_rgba(245,158,11,0.25)]">
          <p className="text-[11px] font-bold text-white/80 flex items-center gap-1"><Clock className="w-3 h-3"/> Unpaid</p>
          <p className="text-lg font-bold text-white">₹{Number(stats.unpaid_revenue||0).toFixed(2)}</p>
          <p className="text-[11px] text-white/70">{stats.unpaid_count||0} unpaid</p>
        </div>
        <div className="bg-[#1F2937] border border-[#1F2937] rounded-2xl p-4 text-white shadow-[0_8px_20px_rgba(31,41,55,0.25)]">
          <p className="text-[11px] font-bold text-white/80">Calculation</p>
          <p className="text-xs text-white">Subtotal + GST ({stats.total_revenue ? 'auto' : '18%'}) = Total</p>
          <p className="text-[11px] text-white/70">Per parameter price sum</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#D1D5DB] rounded-2xl p-4 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Invoice No, Company..." className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
        </div>
        <input value={company} onChange={e=>setCompany(e.target.value)} placeholder="Filter by Company" className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
        <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white">
          <option value="">All Types</option>
          {types.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select value={status} onChange={e=>setStatus(e.target.value)} className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white">
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="partial">Partial</option>
        </select>
        <input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" title="From date" />
        <input type="date" value={to} onChange={e=>setTo(e.target.value)} className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" title="To date" />
        <button onClick={()=>{ setFrom(''); setTo(''); }} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold ${(from||to) ? 'bg-[#EAF7F0] text-[#0B6B43]' : 'text-[#D1D5DB]'}`}>All Time</button>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#D1D5DB] rounded-2xl overflow-hidden overflow-x-auto">
        {loading ? <div className="p-8 text-center text-xs text-[#6B7280]">Loading...</div> : (data.data||[]).length===0 ? <div className="p-8 text-center text-xs text-[#6B7280]">No invoices — create a report first (auto generates invoice)</div> : (
          <table className="w-full text-left text-xs">
            <thead><tr className="bg-[#EAF7F0] text-[11px] uppercase font-bold text-[#6B7280] border-b border-[#D1D5DB]">
              <th className="py-2 px-3">Invoice No</th><th className="py-2 px-3">Report</th><th className="py-2 px-3">Company</th><th className="py-2 px-3">Type</th><th className="py-2 px-3">Date</th><th className="py-2 px-3 text-right">Subtotal</th><th className="py-2 px-3 text-right">GST</th><th className="py-2 px-3 text-right">Total</th><th className="py-2 px-3">Status</th><th className="py-2 px-3 text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-[#D1D5DB]/60">
              {(data.data||[]).map(inv=>(
                <tr key={inv.id} className="hover:bg-[#EAF7F0]/30">
                  <td className="py-2 px-3 font-mono font-bold text-[#0B6B43]">{inv.invoice_no}</td>
                  <td className="py-2 px-3 font-mono">{inv.report?.report_no || '-'}</td>
                  <td className="py-2 px-3 font-bold">{inv.party_name || inv.customer_name || '-'}</td>
                  <td className="py-2 px-3">{inv.report?.report_type?.name || '-'}</td>
                  <td className="py-2 px-3">{inv.created_at?.split('T')[0]}</td>
                  <td className="py-2 px-3 text-right">₹{Number(inv.subtotal).toFixed(2)}</td>
                  <td className="py-2 px-3 text-right">{inv.gst_enabled ? <>₹{Number(inv.gst_amount).toFixed(2)} ({inv.gst_percent}%)</> : '—'}</td>
                  <td className="py-2 px-3 text-right font-bold">₹{Number(inv.total_amount).toFixed(2)}</td>
                  <td className="py-2 px-3">
                      <button disabled={isDemo} onClick={()=>toggleStatus(inv)} className={`px-2 py-1 rounded-full text-[11px] font-bold text-white ${inv.status==='paid' ? 'bg-emerald-500' : inv.status==='partial' ? 'bg-sky-500' : 'bg-amber-500'} ${isDemo ? 'opacity-70 cursor-not-allowed' : ''}`}>
                      {inv.status}
                    </button>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <div className="flex gap-1 justify-end">
                      {!isDemo && (
                        <button onClick={()=>openEdit(inv)} title="Edit rates & quantity" className="px-2 py-1 rounded-lg bg-[#168B57] hover:bg-[#0B6B43] transition-colors text-white text-[11px] font-bold flex items-center gap-1"><Pencil className="w-3 h-3"/></button>
                      )}
                      <button onClick={()=>openInvoice(inv.report_id)} title="View Invoice PDF" className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold flex items-center gap-1">PDF</button>
                      <button onClick={()=>shareInvoiceWhatsapp(inv)} title="Share via WhatsApp" className="px-2 py-1 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white text-[11px] font-bold flex items-center gap-1 shadow-sm"><MessageCircle className="w-3 h-3"/></button>
                      <button onClick={()=>openInvoiceDoc(inv.report_id)} title="Open invoice Word" className="px-2 py-1 rounded-lg bg-sky-600 text-white text-[11px] font-bold flex items-center gap-1"><FileType className="w-3 h-3"/></button>
                      <button onClick={()=>downloadInvoiceDoc(inv)} title="Download invoice Word" className="px-2 py-1 rounded-lg bg-white border border-sky-300 text-sky-700 text-[11px] font-bold flex items-center gap-1"><FileDown className="w-3 h-3"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="p-3 border-t border-[#D1D5DB] flex justify-between text-xs">
          <span className="text-[#6B7280]">Page {data.current_page || 1} of {data.last_page || 1}</span>
          <div className="flex gap-1">
            <button disabled={(data.current_page||1)<=1} onClick={()=>loadInvoices((data.current_page||1)-1)} className="px-3 py-1 rounded-lg border border-[#D1D5DB] disabled:opacity-50">Prev</button>
            <button disabled={(data.current_page||1) >= (data.last_page||1)} onClick={()=>loadInvoices((data.current_page||1)+1)} className="px-3 py-1 rounded-lg border border-[#D1D5DB] disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
      </>)}

      {tab==='group' && <GroupSummary />}
      {tab==='settlement' && <BulkSettlement />}

      {editInv && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={closeEdit}>
          <div onClick={e=>e.stopPropagation()} className="bg-white rounded-2xl border border-[#D1D5DB] p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto space-y-4 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#1F2937] flex items-center gap-2"><Pencil className="w-4 h-4 text-[#168B57]"/> Edit Invoice — {editInv.invoice_no}</h3>
                <p className="text-[11px] text-[#6B7280]">Parameter rows are fixed (from report) — only <b>Rate</b> and <b>Qty</b> can be changed</p>
              </div>
              <button onClick={closeEdit} className="p-1.5 rounded-lg hover:bg-[#EAF7F0] text-[#6B7280]"><X className="w-4 h-4"/></button>
            </div>

            {loadingInv ? <div className="p-6 text-center text-xs text-[#6B7280]">Loading invoice...</div> : (
              <>
                <div className="border border-[#D1D5DB] rounded-xl overflow-hidden overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead><tr className="bg-[#EAF7F0] text-[11px] uppercase font-bold text-[#6B7280] border-b border-[#D1D5DB]">
                      <th className="py-2 px-3">S.No</th><th className="py-2 px-3">Parameter</th>
                      <th className="py-2 px-3 text-right">Rate (₹)</th><th className="py-2 px-3 text-right">Qty</th><th className="py-2 px-3 text-right">Amount (₹)</th>
                    </tr></thead>
                    <tbody className="divide-y divide-[#D1D5DB]/60">
                      {editItems.map((it, idx)=>(
                        <tr key={it.parameter_id ?? idx} className="hover:bg-[#EAF7F0]/30">
                          <td className="py-2 px-3 text-[#6B7280]">{idx+1}</td>
                          <td className="py-2 px-3 font-bold">{it.name}</td>
                          <td className="py-2 px-3 text-right">
                            <input type="number" min="0" step="0.01" value={it.rate} onChange={e=>setItem(idx,'rate',e.target.value)} className="w-24 px-2 py-1 border border-[#D1D5DB] rounded-lg text-right text-xs focus:border-[#168B57] outline-none" />
                          </td>
                          <td className="py-2 px-3 text-right">
                            <input type="number" min="0" step="1" value={it.qty} onChange={e=>setItem(idx,'qty',e.target.value)} className="w-16 px-2 py-1 border border-[#D1D5DB] rounded-lg text-right text-xs focus:border-[#168B57] outline-none" />
                          </td>
                          <td className="py-2 px-3 text-right font-bold">₹{((Number(it.rate)||0)*(Number(it.qty)||0)).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-end">
                  <div className="text-[11px] text-[#6B7280]">
                    <p>Report No: <span className="font-mono font-bold text-[#1F2937]">{editInv.report?.report_no || '-'}</span></p>
                    <p>Customer: <span className="font-bold text-[#1F2937]">{editInv.party_name || editInv.customer_name || '-'}</span></p>
                  </div>
                  <div className="w-full sm:w-72 border border-[#D1D5DB] rounded-xl overflow-hidden text-xs">
                    <div className="flex justify-between px-3 py-2 border-b border-[#D1D5DB]"><span className="text-[#6B7280] font-bold">Subtotal</span><span className="font-bold">₹{liveSub.toFixed(2)}</span></div>
                    {editInv.gst_enabled && <div className="flex justify-between px-3 py-2 border-b border-[#D1D5DB]"><span className="text-[#6B7280] font-bold">GST ({editInv.gst_percent}%)</span><span className="font-bold">₹{liveGst.toFixed(2)}</span></div>}
                    <div className="flex justify-between px-3 py-2 bg-[#0B6B43] text-white font-bold"><span>Total</span><span>₹{(liveSub+liveGst).toFixed(2)}</span></div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button onClick={closeEdit} className="px-4 py-2.5 rounded-xl border border-[#D1D5DB] text-xs font-bold">Cancel</button>
                  <button onClick={saveItems} disabled={saving} className="px-5 py-2.5 rounded-xl bg-[#168B57] hover:bg-[#0B6B43] transition-colors text-white font-bold text-xs disabled:opacity-60">{saving?'Saving...':'Save Invoice'}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* WhatsApp Share Modal for Invoices */}
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
const pad = (n)=> String(n).padStart(2,'0');
const isoDate = (d)=> `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const weekStart = (d)=>{ const day=(d.getDay()+6)%7; const s=new Date(d); s.setDate(d.getDate()-day); return s; };
const plusDays = (d,n)=>{ const x=new Date(d); x.setDate(x.getDate()+n); return x; };

const GroupSummary = () => {
  const { addToast } = useToast();
  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState('');
  const ws = weekStart(new Date());
  const [from, setFrom] = useState(isoDate(ws));
  const [to, setTo] = useState(isoDate(plusDays(ws,6)));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(()=>{ api.get('/customer-groups').then(r=>setGroups(r.data||[])).catch(()=>{}); },[]);

  const viewPdf = async () => {
    if (!groupId || exporting) return;
    setExporting(true);
    try {
      const res = await api.post('/group-summary/pdf', { group_id:groupId, from, to }, { responseType:'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type:'application/pdf' }));
      window.open(url, '_blank');
    } catch { addToast('PDF preview failed','error'); }
    finally { setExporting(false); }
  };

  const exportPdf = async () => {
    if (!groupId || exporting) return;
    setExporting(true);
    try {
      const res = await api.post('/group-summary/pdf', { group_id:groupId, from, to }, { responseType:'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type:'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `group-summary-${groups.find(g=>String(g.id)===String(groupId))?.name || groupId}-${from}-to-${to}.pdf`.replace(/\s+/g,'-');
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(()=>URL.revokeObjectURL(url), 5000);
      addToast('PDF downloaded');
    } catch { addToast('PDF export failed','error'); }
    finally { setExporting(false); }
  };

  const load = async (gid=groupId, f=from, t=to) => {
    if (!gid) { setData(null); return; }
    setLoading(true);
    try { const r = await api.get('/group-summary', { params:{ group_id:gid, from:f, to:t } }); setData(r.data); }
    catch(err){ addToast(err.response?.data?.message||'Failed to load summary','error'); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ if (groupId) load(groupId, from, to); }, [groupId]);

  const setRange = (kind) => {
    const now = new Date(); let f, t;
    if (kind==='this'){ const s=weekStart(now); f=isoDate(s); t=isoDate(plusDays(s,6)); }
    else if (kind==='last'){ const s=plusDays(weekStart(now),-7); f=isoDate(s); t=isoDate(plusDays(s,6)); }
    else { f=isoDate(new Date(now.getFullYear(),now.getMonth(),1)); t=isoDate(now); }
    setFrom(f); setTo(t); if (groupId) load(groupId, f, t);
  };

  const rows = data?.rows || [];
  const totals = data?.totals || {};
  const billed = rows.filter(r=>r.invoices>0);

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#D1D5DB] rounded-2xl p-4 flex flex-col lg:flex-row gap-3 items-start lg:items-center">
        <select value={groupId} onChange={e=>setGroupId(e.target.value)} className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white min-w-[200px]">
          <option value="">Select group...</option>
          {groups.map(g=> <option key={g.id} value={g.id}>{g.name} ({g.customers_count})</option>)}
        </select>
        <input type="date" value={from} onChange={e=>setFrom(e.target.value)} onBlur={()=>groupId && load()} className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
        <input type="date" value={to} onChange={e=>setTo(e.target.value)} onBlur={()=>groupId && load()} className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
        <div className="flex gap-2">
          <button onClick={()=>setRange('this')} className="px-3 py-1.5 rounded-lg bg-[#EAF7F0] text-[#0B6B43] text-[11px] font-bold">This Week</button>
          <button onClick={()=>setRange('last')} className="px-3 py-1.5 rounded-lg bg-[#EAF7F0] text-[#0B6B43] text-[11px] font-bold">Last Week</button>
          <button onClick={()=>setRange('month')} className="px-3 py-1.5 rounded-lg bg-[#EAF7F0] text-[#0B6B43] text-[11px] font-bold">This Month</button>
        </div>
        <button onClick={()=>load()} disabled={!groupId || loading} className="ml-auto px-4 py-2 rounded-xl bg-[#168B57] hover:bg-[#0B6B43] transition-colors text-white font-bold text-xs disabled:opacity-50">Load</button>
        <button onClick={viewPdf} disabled={!groupId || exporting || loading} className="px-3.5 py-2 rounded-xl bg-[#168B57] hover:bg-[#0B6B43] transition-colors text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"><FileType className="w-3.5 h-3.5"/>View PDF</button>
        <button onClick={exportPdf} disabled={!groupId || exporting || loading} className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 transition-colors text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"><FileDown className="w-3.5 h-3.5"/>Download</button>
      </div>

      {!groupId ? (
        <div className="bg-white border border-[#D1D5DB] rounded-2xl p-8 text-center text-xs text-[#6B7280]">Select a group to see customer-wise totals for the duration</div>
      ) : loading ? (
        <div className="bg-white border border-[#D1D5DB] rounded-2xl p-8 text-center text-xs text-[#6B7280]">Loading...</div>
      ) : !data ? (
        <div className="bg-white border border-[#D1D5DB] rounded-2xl p-8 text-center text-xs text-[#6B7280]">No data</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-[#168B57] border border-[#168B57] rounded-2xl p-4 text-white shadow-[0_8px_20px_rgba(22,139,87,0.25)]">
              <p className="text-[11px] font-bold text-white/80">Group</p>
              <p className="text-lg font-bold text-white">{data.group?.name || 'Customer'}</p>
              <p className="text-[11px] text-white/70">{data.range.from} → {data.range.to}</p>
            </div>
            <div className="bg-sky-500 border border-sky-600 rounded-2xl p-4 text-white shadow-[0_8px_20px_rgba(14,165,233,0.25)]">
              <p className="text-[11px] font-bold text-white/80">Customers billed</p>
              <p className="text-lg font-bold text-white">{billed.length} / {rows.length}</p>
              <p className="text-[11px] text-white/70">members with invoices</p>
            </div>
            <div className="bg-amber-500 border border-amber-600 rounded-2xl p-4 text-white shadow-[0_8px_20px_rgba(245,158,11,0.25)]">
              <p className="text-[11px] font-bold text-white/80">Invoices</p>
              <p className="text-lg font-bold text-white">{totals.invoices||0}</p>
              <p className="text-[11px] text-white/70">in selected duration</p>
            </div>
            <div className="bg-[#1F2937] border border-[#1F2937] rounded-2xl p-4 text-white shadow-[0_8px_20px_rgba(31,41,55,0.25)]">
              <p className="text-[11px] font-bold text-white/80">Total Amount</p>
              <p className="text-lg font-bold text-white">₹{Number(totals.amount||0).toFixed(2)}</p>
              <p className="text-[11px] text-white/70">paid ₹{Number(totals.paid_amount||0).toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-white border border-[#D1D5DB] rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#D1D5DB] text-xs font-bold text-[#0B6B43]">Customer-wise amount (duration: {data.range.from} → {data.range.to})</div>
            <table className="w-full text-left text-xs">
              <thead><tr className="bg-[#EAF7F0] text-[11px] uppercase font-bold text-[#6B7280] border-b border-[#D1D5DB]">
                <th className="py-2 px-3">Customer</th><th className="py-2 px-3 text-right">Invoices</th>
                <th className="py-2 px-3 text-right">Paid</th><th className="py-2 px-3 text-right">Unpaid</th>
                <th className="py-2 px-3 text-right">Partial</th><th className="py-2 px-3 text-right">Amount (₹)</th>
              </tr></thead>
              <tbody className="divide-y divide-[#D1D5DB]/60">
                {rows.map((r,i)=>(
                  <tr key={r.customer_id ?? i} className="hover:bg-[#EAF7F0]/30">
                    <td className="py-2.5 px-3 font-bold">{r.party}</td>
                    <td className="py-2.5 px-3 text-right">{r.invoices}</td>
                    <td className="py-2.5 px-3 text-right">{r.paid}</td>
                    <td className="py-2.5 px-3 text-right">{r.unpaid}</td>
                    <td className="py-2.5 px-3 text-right">{r.partial}</td>
                    <td className="py-2.5 px-3 text-right font-bold">₹{Number(r.amount||0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr className="bg-[#0B6B43] text-white text-xs font-bold">
                <td className="py-2.5 px-3">Total ({billed.length} customers)</td>
                <td className="py-2.5 px-3 text-right">{totals.invoices||0}</td>
                <td className="py-2.5 px-3" colSpan={3}></td>
                <td className="py-2.5 px-3 text-right">₹{Number(totals.amount||0).toFixed(2)}</td>
              </tr></tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

const BulkSettlement = () => {
  const { addToast } = useToast();
  const [mode, setMode] = useState('group');
  const [subView, setSubView] = useState('statement'); // 'statement' | 'parameters'
  const [groups, setGroups] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [groupId, setGroupId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const ws = weekStart(new Date());
  const [from, setFrom] = useState(isoDate(ws));
  const [to, setTo] = useState(isoDate(plusDays(ws,6)));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [edits, setEdits] = useState({});
  const [exporting, setExporting] = useState(false);
  const [selectedTypeIds, setSelectedTypeIds] = useState(null);
  const [waModal, setWaModal] = useState({ isOpen: false, phone: '', recipientName: '', docTitle: '', summaryLines: [], pdfUrl: '' });

  useEffect(()=>{
    api.get('/customer-groups').then(r=>setGroups(r.data||[])).catch(()=>{});
    api.get('/customers', { params:{ per_page:200 } }).then(r=>setCustomers(r.data.data || r.data || [])).catch(()=>{});
  },[]);

  const load = async (m=mode, f=from, t=to, fTypes=selectedTypeIds) => {
    const params = { from:f, to:t };
    if (m==='group') { if (!groupId) { setData(null); return; } params.group_id = groupId; }
    else { if (!customerId) { setData(null); return; } params.customer_id = customerId; }
    if (fTypes !== null && Array.isArray(fTypes)) {
      params.type_ids = fTypes.join(',');
    }
    setLoading(true);
    try {
      const r = await api.get('/bulk-settlement', { params });
      setData(r.data);
      setEdits({});
    } catch(err){ addToast(err.response?.data?.message||'Failed to load settlement','error'); }
    finally { setLoading(false); }
  };

  const toggleType = (typeId) => {
    if (!data?.available_types) return;
    const allIds = data.available_types.map(t => t.id);
    const current = selectedTypeIds === null ? [...allIds] : [...selectedTypeIds];
    const next = current.includes(typeId)
      ? current.filter(id => id !== typeId)
      : [...current, typeId];

    if (next.length === 0) {
      addToast('At least one report type must be selected', 'warning');
      return;
    }
    setSelectedTypeIds(next);
    load(mode, from, to, next);
  };

  const selectAllTypes = () => {
    setSelectedTypeIds(null);
    load(mode, from, to, null);
  };

  const ekey = (ti, ri) => `${ti}:${ri}`;
  const val = (ti, ri, row, field) => {
    const e = edits[ekey(ti, ri)];
    return Number((e ? e[field] : row[field]) || 0);
  };
  const setVal = (ti, ri, row, field, v) => {
    const e = edits[ekey(ti, ri)] || { rate: Number(row.rate)||0, qty: Number(row.qty)||0 };
    e[field] = Math.max(0, Number(v) || 0);
    setEdits(o=>({ ...o, [ekey(ti,ri)]: { ...e } }));
  };
  const rowAmount = (ti, ri, row) => val(ti, ri, row, 'rate') * val(ti, ri, row, 'qty');
  const typeTotal = (ty, ti) => ty.rows.reduce((s,row,ri)=> s + rowAmount(ti, ri, row), 0);
  const grand = (data?.types||[]).reduce((s,ty,ti)=> s + typeTotal(ty, ti), 0);
  const dirtyCount = data ? data.types.reduce((n,ty,ti)=> n + ty.rows.filter((row,ri)=>{
    const e = edits[ekey(ti,ri)];
    return e && (Number(e.rate)!==Number(row.rate) || Number(e.qty)!==Number(row.qty));
  }).length, 0) : 0;

  const viewPdf = async () => {
    if (!ready || !data || exporting) return;
    setExporting(true);
    try {
      const overrides = [];
      data.types.forEach((ty,ti)=> ty.rows.forEach((row,ri)=>{
        const e = edits[ekey(ti,ri)];
        if (e && (Number(e.rate)!==Number(row.rate) || Number(e.qty)!==Number(row.qty))) {
          overrides.push({ type_id: ty.report_type_id, parameter_id: row.parameter_id, rate: Number(e.rate), qty: Number(e.qty) });
        }
      }));
      const params = mode==='group' ? { group_id:groupId } : { customer_id:customerId };
      const payload = {
        ...params,
        from,
        to,
        overrides,
        type_ids: selectedTypeIds && selectedTypeIds.length > 0 ? selectedTypeIds : undefined,
      };
      const res = await api.post('/bulk-settlement/pdf', payload, { responseType:'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type:'application/pdf' }));
      window.open(url, '_blank');
    } catch(err){ addToast('PDF preview failed','error'); }
    finally { setExporting(false); }
  };

  const exportPdf = async () => {
    if (!ready || !data || exporting) return;
    setExporting(true);
    try {
      const overrides = [];
      data.types.forEach((ty,ti)=> ty.rows.forEach((row,ri)=>{
        const e = edits[ekey(ti,ri)];
        if (e && (Number(e.rate)!==Number(row.rate) || Number(e.qty)!==Number(row.qty))) {
          overrides.push({ type_id: ty.report_type_id, parameter_id: row.parameter_id, rate: Number(e.rate), qty: Number(e.qty) });
        }
      }));
      const params = mode==='group' ? { group_id:groupId } : { customer_id:customerId };
      const payload = {
        ...params,
        from,
        to,
        overrides,
        type_ids: selectedTypeIds && selectedTypeIds.length > 0 ? selectedTypeIds : undefined,
      };
      const res = await api.post('/bulk-settlement/pdf', payload, { responseType:'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type:'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `statement-${(data.customer_name || data.group?.name || 'statement').replace(/[^A-Za-z0-9]+/g,'-')}-${from}-to-${to}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(()=>URL.revokeObjectURL(url), 5000);
      addToast('Customer Statement PDF downloaded');
    } catch(err){ addToast('PDF export failed','error'); }
    finally { setExporting(false); }
  };

  const shareWhatsapp = () => {
    if (!ready || !data) return;
    const partyName = data.customer_name || data.group?.name || data.customer?.name || 'Customer';
    const phone = data.customer_phone || data.customer?.phone || '';
    const fromDate = data.range?.from || from;
    const toDate = data.range?.to || to;
    const repCount = data.report_count || 0;
    const debit = Number(data.totals?.total_debit || data.grand_total || 0).toFixed(2);
    const credit = Number(data.totals?.total_credit || 0).toFixed(2);
    const balance = Number(data.totals?.balance ?? data.balance ?? grand).toFixed(2);

    const base = window.location.origin + '/api';
    const queryParams = new URLSearchParams();
    if (mode === 'group') queryParams.set('group_id', groupId);
    else queryParams.set('customer_id', customerId);
    queryParams.set('from', fromDate);
    queryParams.set('to', toDate);
    if (selectedTypeIds && selectedTypeIds.length > 0) {
      queryParams.set('type_ids', selectedTypeIds.join(','));
    }
    const token = localStorage.getItem('auth_token');
    if (token) queryParams.set('token', token);

    const pdfUrl = `${base}/bulk-settlement/pdf?${queryParams.toString()}`;

    setWaModal({
      isOpen: true,
      phone,
      recipientName: partyName,
      docTitle: 'CUSTOMER ACCOUNT STATEMENT',
      summaryLines: [
        `*Customer / Group:* ${partyName}`,
        `*Period:* ${fromDate} to ${toDate}`,
        `*Total Reports:* ${repCount}`,
        `*Total Charges (Debit):* ₹${debit}`,
        `*Total Paid (Credit):* ₹${credit}`,
        `*Outstanding Balance:* ₹${balance}`,
      ],
      pdfUrl,
    });
  };

  const quick = (kind) => {
    const now = new Date(); let f, t;
    if (kind==='this'){ const s=weekStart(now); f=isoDate(s); t=isoDate(plusDays(s,6)); }
    else if (kind==='last'){ const s=plusDays(weekStart(now),-7); f=isoDate(s); t=isoDate(plusDays(s,6)); }
    else { f=isoDate(new Date(now.getFullYear(),now.getMonth(),1)); t=isoDate(now); }
    setFrom(f); setTo(t); load(mode, f, t, selectedTypeIds);
  };

  const ready = mode==='group' ? groupId : customerId;

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#D1D5DB] rounded-2xl p-4 space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
          <div className="flex gap-1 bg-[#F3F4F6] p-1 rounded-xl">
            {[{v:'group',l:'By Group'},{v:'party',l:'By Customer'}].map(o=>(
              <button key={o.v} onClick={()=>{ setMode(o.v); setData(null); setSelectedTypeIds(null); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${mode===o.v?'bg-[#168B57] text-white':'text-[#6B7280]'}`}>{o.l}</button>
            ))}
          </div>
          {mode==='group' ? (
            <select value={groupId} onChange={e=>{ setGroupId(e.target.value); setSelectedTypeIds(null); }} className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white min-w-[200px]">
              <option value="">Select group...</option>
              {groups.map(g=> <option key={g.id} value={g.id}>{g.name} ({g.customers_count})</option>)}
            </select>
          ) : (
            <select value={customerId} onChange={e=>{ setCustomerId(e.target.value); setSelectedTypeIds(null); }} className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white min-w-[200px]">
              <option value="">Select customer...</option>
              {customers.map(c=> <option key={c.id} value={c.id}>{c.company_name || c.name}</option>)}
            </select>
          )}
          <input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
          <input type="date" value={to} onChange={e=>setTo(e.target.value)} className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
          <div className="flex gap-2">
            <button onClick={()=>quick('this')} className="px-3 py-1.5 rounded-lg bg-[#EAF7F0] text-[#0B6B43] text-[11px] font-bold">This Week</button>
            <button onClick={()=>quick('last')} className="px-3 py-1.5 rounded-lg bg-[#EAF7F0] text-[#0B6B43] text-[11px] font-bold">Last Week</button>
            <button onClick={()=>quick('month')} className="px-3 py-1.5 rounded-lg bg-[#EAF7F0] text-[#0B6B43] text-[11px] font-bold">This Month</button>
          </div>
          <button onClick={()=>load(mode, from, to, selectedTypeIds)} disabled={!ready || loading} className="ml-auto px-4 py-2 rounded-xl bg-[#168B57] hover:bg-[#0B6B43] transition-colors text-white font-bold text-xs disabled:opacity-50">{loading?'Loading...':'Calculate'}</button>
        </div>
        <p className="text-[11px] text-[#6B7280]">Customer Account Statement &amp; Type-wise bill for the duration with chronological test parameters, debits, credits, and balance.</p>
      </div>

      {data && (data.available_types || []).length > 0 && (
        <div className="bg-white border border-[#D1D5DB] rounded-2xl p-3.5 shadow-sm space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-[#EAF7F0] text-[#0B6B43]"><Filter className="w-3.5 h-3.5" /></span>
              <span className="text-xs font-bold text-[#1F2937]">Filter Report Types:</span>
              <span className="text-[11px] text-[#6B7280]">Click to toggle specific report types ON or OFF</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAllTypes}
                className="px-2.5 py-1 rounded-lg bg-[#F3F4F6] hover:bg-gray-200 text-[#374151] font-bold text-[11px] transition-colors"
              >
                All Types
              </button>
              {selectedTypeIds !== null && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                  {selectedTypeIds.length} of {data.available_types.length} selected
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {data.available_types.map(t => {
              const isSelected = selectedTypeIds === null || selectedTypeIds.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleType(t.id)}
                  title={isSelected ? 'Click to exclude this type' : 'Click to include this type'}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    isSelected
                      ? 'bg-[#EAF7F0] border-[#168B57] text-[#0B6B43] shadow-sm'
                      : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#9CA3AF] line-through opacity-70 hover:opacity-100'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                    isSelected ? 'bg-[#168B57] text-white' : 'bg-gray-300 text-white'
                  }`}>
                    {isSelected ? '✓' : '×'}
                  </span>
                  <span>{t.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-normal ${
                    isSelected ? 'bg-[#168B57]/15 text-[#0B6B43]' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {t.report_count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!ready ? (
        <div className="bg-white border border-[#D1D5DB] rounded-2xl p-8 text-center text-xs text-[#6B7280]">Select {mode==='group'?'a group':'a party'} above</div>
      ) : loading ? (
        <div className="bg-white border border-[#D1D5DB] rounded-2xl p-8 text-center text-xs text-[#6B7280]">Calculating...</div>
      ) : !data ? (
        <div className="bg-white border border-[#D1D5DB] rounded-2xl p-8 text-center text-xs text-[#6B7280]">Press Calculate</div>
      ) : (data.statement_rows||[]).length===0 && (data.types||[]).length===0 ? (
        <div className="bg-white border border-[#D1D5DB] rounded-2xl p-8 text-center text-xs text-[#6B7280]">No reports in {data.range?.from} → {data.range?.to}</div>
      ) : (
        <>
          <div className="bg-[#1F2937] border border-[#1F2937] rounded-2xl p-4 text-white flex flex-wrap gap-6 items-center">
            <div><p className="text-[11px] text-white/70 font-bold">{data.scope==='group' ? 'Group' : 'Party'}</p><p className="text-sm font-bold">{data.customer_name || data.group?.name || data.customer?.name}</p></div>
            <div><p className="text-[11px] text-white/70 font-bold">Duration</p><p className="text-sm font-bold">{data.range?.from} → {data.range?.to}</p></div>
            <div><p className="text-[11px] text-white/70 font-bold">Reports</p><p className="text-sm font-bold">{data.report_count}</p></div>
            <div className="ml-auto flex items-center gap-3">
              <div className="flex gap-1 bg-white/10 p-1 rounded-xl">
                <button onClick={()=>setSubView('statement')} className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${subView==='statement'?'bg-[#168B57] text-white':'text-white/70 hover:text-white'}`}>Statement List</button>
                <button onClick={()=>setSubView('parameters')} className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${subView==='parameters'?'bg-[#168B57] text-white':'text-white/70 hover:text-white'}`}>Parameter Edit</button>
              </div>
              {dirtyCount>0 && <button onClick={()=>setEdits({})} className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white text-[11px] font-bold border border-white/30">Reset {dirtyCount}</button>}
              <button onClick={exportPdf} disabled={exporting} className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 transition-colors text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-60"><FileType className="w-3.5 h-3.5"/>{exporting?'Exporting...':'Export Statement PDF'}</button>
              <button onClick={shareWhatsapp} title="Share statement via WhatsApp" className="px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] transition-colors text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"><MessageCircle className="w-3.5 h-3.5"/> WhatsApp</button>
              <div className="text-right"><p className="text-[11px] text-white/70 font-bold">Balance</p><p className="text-xl font-black text-emerald-400">₹{(data.totals?.balance ?? data.balance ?? grand).toFixed(2)}</p></div>
            </div>
          </div>

          {subView === 'statement' ? (
            <div className="bg-white border border-[#D1D5DB] rounded-2xl overflow-hidden">
              <div className="px-4 py-3 bg-[#F9FAFB] border-b border-[#D1D5DB] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-[#1E40AF] uppercase tracking-wider">Customer - Account Statement</h3>
                  <p className="text-[11px] text-[#6B7280]">{data.customer_name} {data.customer_address ? `• ${data.customer_address}` : ''}</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="text-[#6B7280]">Total Debit: <b className="text-[#1F2937]">₹{(data.totals?.total_debit || 0).toFixed(2)}</b></span>
                  <span className="text-[#6B7280]">Total Credit: <b className="text-[#168B57]">₹{(data.totals?.total_credit || 0).toFixed(2)}</b></span>
                  <span className="px-3 py-1 bg-fuchsia-50 border border-fuchsia-300 text-fuchsia-700 rounded-lg font-black text-xs">
                    Balance Rs: ₹{(data.totals?.balance || 0).toFixed(2)}/-
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#EAF7F0] text-[11px] uppercase font-bold text-[#6B7280] border-b border-[#D1D5DB]">
                      <th className="py-2.5 px-3 w-12">S.No</th>
                      <th className="py-2.5 px-3">Date &amp; Test Parameters / Description</th>
                      <th className="py-2.5 px-3">Report / Vehicle</th>
                      <th className="py-2.5 px-3 text-right">Debit (Charges ₹)</th>
                      <th className="py-2.5 px-3 text-right">Credit (Paid ₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D1D5DB]/60">
                    {(data.statement_rows || []).map((row, idx) => (
                      <tr key={idx} className={`hover:bg-[#EAF7F0]/30 ${row.type === 'ob' ? 'bg-[#F9FAFB] font-bold text-[#4B5563]' : ''}`}>
                        <td className="py-2 px-3 text-[#6B7280]">{row.sno}.</td>
                        <td className="py-2 px-3">
                          {row.type === 'ob' ? (
                            <span className="font-bold text-[#1F2937]">Opening Balance (O/B)</span>
                          ) : (
                            <div className="font-mono text-[11.5px] text-[#1F2937]">
                              <span className="font-bold text-[#0B6B43] mr-2">{row.date}</span>
                              <span>{row.params_text || '—'}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-3 text-[#6B7280]">
                          {row.report_no ? (
                            <div>
                              <span className="font-bold text-[#1F2937]">{row.report_no}</span>
                              {row.vehicle_no && <span className="ml-1.5 text-[11px]">({row.vehicle_no})</span>}
                            </div>
                          ) : '—'}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-[#1F2937]">
                          ₹{Number(row.debit || 0).toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-[#168B57]">
                          ₹{Number(row.credit || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#F3F4F6] font-bold border-t-2 border-[#1F2937] text-xs">
                      <td colSpan={3} className="py-3 px-3 text-right text-[#1F2937]">Net Total</td>
                      <td className="py-3 px-3 text-right font-black text-[#1F2937]">₹{(data.totals?.total_debit || 0).toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-black text-[#168B57]">₹{(data.totals?.total_credit || 0).toFixed(2)}</td>
                    </tr>
                    <tr className="bg-[#EAF7F0] font-bold text-xs text-[#0B6B43]">
                      <td colSpan={3} className="py-2.5 px-3 text-right">Balance Outstanding</td>
                      <td className="py-2.5 px-3 text-right font-black text-sm text-[#0B6B43]" colSpan={2}>
                        ₹{(data.totals?.balance || 0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            data.types.map((ty,ti)=>(
              <div key={ty.report_type_id} className="bg-white border border-[#D1D5DB] rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[#D1D5DB] flex items-center justify-between">
                  <p className="text-xs font-bold text-[#0B6B43]">{ty.name} <span className="text-[#6B7280] font-normal">({ty.reports} report{ty.reports===1?'':'s'})</span></p>
                  <p className="text-xs font-bold">Subtotal ₹{typeTotal(ty, ti).toFixed(2)}</p>
                </div>
                <table className="w-full text-left text-xs">
                  <thead><tr className="bg-[#EAF7F0] text-[11px] uppercase font-bold text-[#6B7280] border-b border-[#D1D5DB]">
                    <th className="py-2 px-3">Parameter</th><th className="py-2 px-3">Unit</th>
                    <th className="py-2 px-3 text-right">Times</th><th className="py-2 px-3 text-right">Rate ₹</th>
                    <th className="py-2 px-3 text-right">Qty</th><th className="py-2 px-3 text-right">Amount ₹</th>
                  </tr></thead>
                  <tbody className="divide-y divide-[#D1D5DB]/60">
                    {ty.rows.map((row,ri)=>(
                      <tr key={row.parameter_id} className="hover:bg-[#EAF7F0]/30">
                        <td className="py-2 px-3 font-bold">{row.name}</td>
                        <td className="py-2 px-3 text-[#6B7280]">{row.unit||'-'}</td>
                        <td className="py-2 px-3 text-right"><span className="px-2 py-0.5 rounded-full bg-sky-500 text-white text-[11px] font-bold">×{row.times}</span></td>
                        <td className="py-2 px-3 text-right">
                          <input type="number" min="0" step="0.01" value={val(ti,ri,row,'rate')} onChange={e=>setVal(ti, ri, row, 'rate', e.target.value)} className="w-24 px-2 py-1 border border-[#D1D5DB] rounded-lg text-right text-xs focus:border-[#168B57] outline-none" />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input type="number" min="0" step="1" value={val(ti,ri,row,'qty')} onChange={e=>setVal(ti, ri, row, 'qty', e.target.value)} className="w-20 px-2 py-1 border border-[#D1D5DB] rounded-lg text-right text-xs focus:border-[#168B57] outline-none" />
                        </td>
                        <td className="py-2 px-3 text-right font-bold">₹{rowAmount(ti, ri, row).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </>
      )}

      {/* WhatsApp Share Modal for Bulk Settlement */}
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

export default Invoices;
