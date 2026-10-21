import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { Building2, Search, Plus, Pencil, Trash2, Phone, Mail, MapPin, X, CalendarDays, FileText, Receipt, FlaskConical, Wallet, Layers, Check, ArrowUpRight } from 'lucide-react';

const emptyForm = { name:'', company_name:'', contact_person:'', phone:'', email:'', address:'', gstin:'', city:'', state:'', notes:'' };

const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const startOfWeek = (d) => { const day = (d.getDay()+6)%7; const s = new Date(d); s.setDate(d.getDate()-day); return s; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };

const PartySummary = ({ customers }) => {
  const { addToast } = useToast();
  const now = new Date();
  const ws = startOfWeek(now);
  const [customerId, setCustomerId] = useState('');
  const [from, setFrom] = useState(fmt(ws));
  const [to, setTo] = useState(fmt(addDays(ws, 6)));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async (id=customerId, f=from, t=to) => {
    if (!id) { setData(null); return; }
    setLoading(true);
    try {
      const r = await api.get(`/customers/${id}/summary`, { params:{ from:f, to:t } });
      setData(r.data);
    } catch(err) { addToast(err.response?.data?.message||'Failed to load summary','error'); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ if (customerId) load(customerId, from, to); }, [customerId]);

  const setRange = (kind) => {
    const t = new Date(); let f, tt;
    if (kind==='this') { const s = startOfWeek(t); f = fmt(s); tt = fmt(addDays(s,6)); }
    else if (kind==='last') { const s = addDays(startOfWeek(t), -7); f = fmt(s); tt = fmt(addDays(s,6)); }
    else { f = fmt(new Date(t.getFullYear(), t.getMonth(), 1)); tt = fmt(t); }
    setFrom(f); setTo(tt);
    if (customerId) load(customerId, f, tt);
  };

  const rows = data?.rows || [];
  const invoices = data?.invoices || [];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-white/80 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
          <select value={customerId} onChange={e=>setCustomerId(e.target.value)} className="px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs min-w-[220px]">
            <option value="">Select party / company...</option>
            {customers.map(c=> <option key={c.id} value={c.id}>{c.company_name || c.name}</option>)}
          </select>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-[#168B57]"/> From</span>
            <input type="date" value={from} onChange={e=>setFrom(e.target.value)} onBlur={()=>customerId && load(customerId, from, to)} className="px-3 py-2 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs" />
            <span className="text-[11px] font-bold text-gray-500">To</span>
            <input type="date" value={to} onChange={e=>setTo(e.target.value)} onBlur={()=>customerId && load(customerId, from, to)} className="px-3 py-2 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs" />
          </div>
          <div className="flex gap-2 lg:ml-auto flex-wrap">
            <button onClick={()=>setRange('this')} className="px-3.5 py-2 rounded-xl bg-[#EAF7F0] text-[#0B6B43] text-xs font-bold hover:bg-[#D1EEE0] transition-colors">This Week</button>
            <button onClick={()=>setRange('last')} className="px-3.5 py-2 rounded-xl bg-[#EAF7F0] text-[#0B6B43] text-xs font-bold hover:bg-[#D1EEE0] transition-colors">Last Week</button>
            <button onClick={()=>setRange('month')} className="px-3.5 py-2 rounded-xl bg-[#EAF7F0] text-[#0B6B43] text-xs font-bold hover:bg-[#D1EEE0] transition-colors">This Month</button>
          </div>
        </div>
        <p className="text-[11px] text-gray-400 font-medium">Party-wise weekly summary — how many times each parameter was tested × rate = amount</p>
      </div>

      {!customerId ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center text-xs text-gray-500 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">Select a party above to view the weekly parameter summary</div>
      ) : loading ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center text-xs text-gray-500 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">Loading summary...</div>
      ) : !data ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center text-xs text-gray-500 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">No data</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-3xl p-6 border border-emerald-100/70 shadow-[0_4px_25px_rgba(22,139,87,0.03)] flex flex-col justify-between hover:shadow-md transition-all min-h-[168px]">
              <div className="flex items-start justify-between">
                <span className="text-[#168B57] text-xs font-black tracking-wider flex items-center gap-1.5 uppercase">
                  REPORTS <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </span>
                <div className="w-10 h-10 rounded-2xl bg-[#EAF7F0] flex items-center justify-center text-[#168B57] shrink-0">
                  <FileText className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>
              <p className="text-4xl font-black text-gray-900 tracking-tight leading-none my-3">
                {data.report_count || 0}
              </p>
              <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                <span className="text-xs font-medium text-gray-400">
                  {from} → {to}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-sky-100/70 shadow-[0_4px_25px_rgba(14,165,233,0.03)] flex flex-col justify-between hover:shadow-md transition-all min-h-[168px]">
              <div className="flex items-start justify-between">
                <span className="text-[#0284C7] text-xs font-black tracking-wider flex items-center gap-1.5 uppercase">
                  TESTS TAKEN <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </span>
                <div className="w-10 h-10 rounded-2xl bg-[#E0F2FE] flex items-center justify-center text-[#0284C7] shrink-0">
                  <FlaskConical className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>
              <p className="text-4xl font-black text-gray-900 tracking-tight leading-none my-3">
                {data.test_count || 0}
              </p>
              <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                <span className="text-xs font-medium text-gray-400">
                  Total parameter tests
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-amber-100/70 shadow-[0_4px_25px_rgba(245,158,11,0.03)] flex flex-col justify-between hover:shadow-md transition-all min-h-[168px]">
              <div className="flex items-start justify-between">
                <span className="text-[#D97706] text-xs font-black tracking-wider flex items-center gap-1.5 uppercase">
                  INVOICES <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </span>
                <div className="w-10 h-10 rounded-2xl bg-[#FEF3C7] flex items-center justify-center text-[#D97706] shrink-0">
                  <Receipt className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>
              <p className="text-4xl font-black text-gray-900 tracking-tight leading-none my-3">
                {invoices.length || 0}
              </p>
              <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                <span className="text-xs font-medium text-gray-400">
                  In selected range
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-purple-100/70 shadow-[0_4px_25px_rgba(139,92,246,0.03)] flex flex-col justify-between hover:shadow-md transition-all min-h-[168px]">
              <div className="flex items-start justify-between">
                <span className="text-[#8B5CF6] text-xs font-black tracking-wider flex items-center gap-1.5 uppercase">
                  ESTIMATED AMOUNT <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </span>
                <div className="w-10 h-10 rounded-2xl bg-[#F3E8FF] flex items-center justify-center text-[#8B5CF6] shrink-0">
                  <Wallet className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>
              <p className="text-3xl font-black text-gray-900 tracking-tight leading-none my-3">
                ₹{Number(data.total||0).toFixed(2)}
              </p>
              <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                <span className="text-xs font-medium text-gray-400">
                  {rows.length} parameters
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-white/80 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 text-xs font-bold text-[#0B6B43]">{data.customer?.name} — parameter wise count</div>
            {rows.length===0 ? <div className="p-8 text-center text-xs text-[#6B7280]">No tests in this date range</div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead><tr className="bg-[#EFEAFD] text-[11px] uppercase font-bold text-[#7A709E] border-b border-purple-100/60">
                    <th className="py-3 px-4">S.No</th><th className="py-3 px-4">Parameter</th><th className="py-3 px-4">Unit</th>
                    <th className="py-3 px-4 text-right">Times Tested</th><th className="py-3 px-4 text-right">Rate (₹)</th><th className="py-3 px-4 text-right">Amount (₹)</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.map((r,i)=>(
                      <tr key={r.parameter_id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3 px-4 text-[#6B7280]">{i+1}</td>
                        <td className="py-3 px-4 font-bold text-gray-900">{r.name}</td>
                        <td className="py-3 px-4 text-[#6B7280]">{r.unit||'-'}</td>
                        <td className="py-3 px-4 text-right"><span className="px-2.5 py-0.5 rounded-full bg-sky-500 text-white font-bold text-[11px]">×{r.times}</span></td>
                        <td className="py-3 px-4 text-right text-gray-700">₹{Number(r.rate||0).toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-black text-gray-900">₹{Number(r.amount||0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot><tr className="bg-[#0B6B43] text-white text-xs font-bold">
                    <td className="py-3 px-4" colSpan={3}>Total ({rows.length} parameters × {data.test_count} tests)</td>
                    <td className="py-3 px-4 text-right">{data.test_count}</td>
                    <td className="py-3 px-4 text-right">—</td>
                    <td className="py-3 px-4 text-right">₹{Number(data.total||0).toFixed(2)}</td>
                  </tr></tfoot>
                </table>
              </div>
            )}
            {Number(data.total||0)===0 && rows.length>0 && <div className="px-5 py-2.5 text-[11px] text-amber-700 bg-amber-50 border-t border-amber-200">Rates are ₹0 — set prices in Parameters screen to see amounts</div>}
          </div>

          <div className="bg-white rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-white/80 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 text-xs font-bold text-[#0B6B43]">Invoices of this party ({invoices.length})</div>
            {invoices.length===0 ? <div className="p-8 text-center text-xs text-[#6B7280]">No invoices in this range</div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead><tr className="bg-[#EFEAFD] text-[11px] uppercase font-bold text-[#7A709E] border-b border-purple-100/60">
                    <th className="py-3 px-4">Invoice No</th><th className="py-3 px-4">Report</th><th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Total</th><th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoices.map(iv=>(
                      <tr key={iv.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#0B6B43]">{iv.invoice_no}</td>
                        <td className="py-3 px-4 font-mono text-gray-700">{iv.report?.report_no||'-'}</td>
                        <td className="py-3 px-4 text-gray-600">{iv.created_at?.split('T')[0]}</td>
                        <td className="py-3 px-4 text-right font-black text-gray-900">₹{Number(iv.total_amount||0).toFixed(2)}</td>
                        <td className="py-3 px-4"><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider ${iv.status==='paid'?'bg-emerald-500':iv.status==='partial'?'bg-sky-500':'bg-amber-500'}`}>{iv.status}</span></td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              const token = localStorage.getItem('auth_token');
                              const base = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
                              window.open(`${base}/reports/${iv.report_id}/invoice/pdf${token ? `?token=${token}` : ''}`, '_blank');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold shadow-xs hover:scale-105 transition-all"
                            title="View Invoice PDF"
                          >
                            PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const GroupsTab = ({ customers, onMembersChanged }) => {
  const { addToast } = useToast();
  const { isDemo } = useAuth();
  const [groups, setGroups] = useState([]);
  const [newName, setNewName] = useState('');
  const [selId, setSelId] = useState(null);
  const [picked, setPicked] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadGroups = async () => {
    setLoading(true);
    try { const r = await api.get('/customer-groups'); setGroups(r.data||[]); } catch {}
    finally { setLoading(false); }
  };
  useEffect(()=>{ loadGroups(); }, []);

  const selectedGroup = groups.find(g=>g.id===selId) || null;

  const createGroup = async (e) => {
    e.preventDefault();
    if (isDemo) { addToast('Demo mode: Action disabled','error'); return; }
    if (!newName.trim()) { addToast('Group name required','error'); return; }
    try {
      const r = await api.post('/customer-groups', { name:newName.trim() });
      addToast('Group created');
      setNewName(''); setSelId(r.data.id); setPicked([]);
      loadGroups();
    } catch(err){ addToast(err.response?.data?.message||'Create failed','error'); }
  };

  const renameGroup = async (g) => {
    if (isDemo) { addToast('Demo mode: Action disabled','error'); return; }
    const name = prompt('Rename group', g.name);
    if (!name || name.trim()==='' || name.trim()===g.name) return;
    try { await api.put(`/customer-groups/${g.id}`, { name:name.trim() }); addToast('Group renamed'); loadGroups(); }
    catch(err){ addToast(err.response?.data?.message||'Rename failed','error'); }
  };

  const deleteGroup = async (g) => {
    if (isDemo) { addToast('Demo mode: Action disabled','error'); return; }
    if (!confirm(`Delete group "${g.name}"? Companies stay, only ungrouped.`)) return;
    try { await api.delete(`/customer-groups/${g.id}`); addToast('Group deleted'); if (selId===g.id){ setSelId(null); setPicked([]);} loadGroups(); }
    catch(err){ addToast(err.response?.data?.message||'Delete failed','error'); }
  };

  const selectGroup = (g) => {
    if (selId===g.id) return;
    setSelId(g.id);
    setPicked((g.customers||[]).map(c=>c.id));
  };

  const togglePick = (id) => setPicked(arr => arr.includes(id) ? arr.filter(x=>x!==id) : [...arr, id]);

  const assign = async () => {
    if (isDemo) { addToast('Demo mode: Action disabled','error'); return; }
    if (!selectedGroup) return;
    setSaving(true);
    try {
      await api.post(`/customer-groups/${selectedGroup.id}/assign`, { customer_ids: picked });
      addToast(`${picked.length} compan${picked.length===1?'y':'ies'} in "${selectedGroup.name}"`);
      loadGroups(); onMembersChanged && onMembersChanged();
    } catch(err){ addToast(err.response?.data?.message||'Assign failed','error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      {!isDemo && (
        <form onSubmit={createGroup} className="bg-white rounded-3xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-white/80 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="w-10 h-10 rounded-2xl bg-[#EAF7F0] flex items-center justify-center text-[#168B57] shrink-0"><Layers className="w-5 h-5"/></div>
          <div className="flex-1 w-full sm:w-auto">
            <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="New group name (e.g. AMC Clients, Weekly Parties)" className="w-full px-4 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all" />
          </div>
          <button type="submit" className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#168B57] to-[#0B6B43] hover:from-[#0B6B43] hover:to-[#168B57] text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_4px_14px_rgba(22,139,87,0.25)] hover:scale-[1.01] active:scale-[0.99] transition-all"><Plus className="w-4 h-4"/> Create Group</button>
        </form>
      )}

      {loading ? <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center text-xs text-gray-500 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">Loading groups...</div>
       : groups.length===0 ? <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center text-xs text-gray-500 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">No groups yet</div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {groups.map(g=>(
            <div key={g.id} onClick={()=>selectGroup(g)} className={`bg-white rounded-3xl overflow-hidden cursor-pointer border transition-all ${selId===g.id ? 'border-[#168B57] shadow-[0_0_0_3px_rgba(22,139,87,0.15)]' : 'border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-md'}`}>
              <div className={`h-1.5 ${selId===g.id ? 'bg-[#168B57]' : 'bg-gray-200'}`} />
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate flex items-center gap-1.5">
                      {selId===g.id && <Check className="w-4 h-4 text-[#168B57]"/>} {g.name}
                    </p>
                    <p className="text-[11px] text-gray-500">{g.customers_count} compan{g.customers_count===1?'y':'ies'}</p>
                  </div>
                  {!isDemo && (
                    <div className="flex gap-1 shrink-0">
                      <button onClick={e=>{e.stopPropagation(); renameGroup(g);}} className="p-1.5 rounded-xl hover:bg-[#EAF7F0] text-gray-700 hover:text-[#168B57] transition-colors" title="Rename"><Pencil className="w-3.5 h-3.5"/></button>
                      <button onClick={e=>{e.stopPropagation(); deleteGroup(g);}} className="p-1.5 rounded-xl hover:bg-red-50 text-red-600 transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5"/></button>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[24px]">
                  {(g.customers||[]).length===0 ? <span className="text-[11px] text-gray-400">No companies</span> :
                    (g.customers||[]).map(c=> <span key={c.id} className="px-2.5 py-0.5 rounded-full bg-[#EAF7F0] text-[#0B6B43] text-[10px] font-bold">{c.company_name || c.name}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-white/80 shadow-[0_4px_25px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-bold text-[#0B6B43]">{selectedGroup ? `Viewing group "${selectedGroup.name}"` : 'Select a group above'}</p>
          {selectedGroup && !isDemo && (
            <div className="flex gap-2">
              <button onClick={()=>setPicked(customers.map(c=>c.id))} className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors">Select all</button>
              <button onClick={()=>setPicked([])} className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors">None</button>
              <button onClick={assign} disabled={saving} className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#168B57] to-[#0B6B43] hover:from-[#0B6B43] hover:to-[#168B57] text-white text-xs font-bold shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60">{saving?'Saving...':`Save (${picked.length})`}</button>
            </div>
          )}
        </div>
        {!selectedGroup ? (
          <div className="p-8 text-center text-xs text-gray-500">Click a group card (or create one) first</div>
        ) : customers.length===0 ? (
          <div className="p-8 text-center text-xs text-gray-500">No companies — add from Companies tab</div>
        ) : (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {customers.map(c=>{
              const checked = picked.includes(c.id);
              const inThis = c.group_id === selectedGroup.id;
              return (
                <label key={c.id} className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${checked ? 'border-[#168B57] bg-[#EAF7F0]/60' : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50'}`}>
                  <input type="checkbox" checked={checked} onChange={()=>togglePick(c.id)} className="accent-[#168B57] w-4 h-4 rounded-md" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-gray-900 truncate">{c.company_name || c.name}</span>
                    <span className="block text-[11px] text-gray-500 truncate">
                      {c.phone || c.email || 'No contact'}
                      {inThis && <span className="text-[#168B57] font-bold"> • in this group</span>}
                      {!inThis && c.group && <span className="text-gray-400"> • group: {c.group.name}</span>}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export const Customers = () => {
  const { addToast } = useToast();
  const { isDemo } = useAuth();
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('companies');

  const loadCustomers = async (q='') => {
    setLoading(true);
    try { const r = await api.get('/customers', { params:{ search: q||undefined, per_page:100 }}); setList(r.data.data || r.data); } catch {}
    finally { setLoading(false); }
  };
  useEffect(()=>{
    const t = setTimeout(()=> loadCustomers(search), 350);
    return ()=>clearTimeout(t);
  }, [search]);

  const openCreate = () => { setTab('companies'); setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (c) => {
    setTab('companies');
    setEditing(c.id);
    setForm({ name:c.name, company_name:c.company_name||'', contact_person:c.contact_person||'', phone:c.phone||'', email:c.email||'', address:c.address||'', gstin:c.gstin||'', city:c.city||'', state:c.state||'', notes:c.notes||'' });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(emptyForm); };

  const submit = async (e) => {
    e.preventDefault();
    if (isDemo) { addToast('Demo Mode: Action disabled','error'); return; }
    if (!form.name) { addToast('Name required','error'); return; }
    try {
      if (editing) await api.put(`/customers/${editing}`, form);
      else await api.post('/customers', form);
      addToast(editing?'Company updated':'Company added');
      closeForm(); loadCustomers(search);
    } catch(err){ addToast(err.response?.data?.message||'Save failed','error'); }
  };

  const del = async (id) => {
    if (isDemo) { addToast('Demo Mode: Action disabled','error'); return; }
    if (!confirm('Delete customer?')) return;
    try { await api.delete(`/customers/${id}`); addToast('Deleted'); loadCustomers(search); } catch { addToast('Delete failed','error'); }
  };

  const Tab = ({ id, label, icon:Icon, count }) => (
    <button onClick={()=>setTab(id)} className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${tab===id ? 'bg-gradient-to-r from-[#168B57] to-[#0B6B43] text-white shadow-[0_4px_14px_rgba(22,139,87,0.25)]' : 'bg-white border border-gray-200 text-gray-600 hover:bg-[#EAF7F0] hover:text-[#0B6B43]'}`}>
      <Icon className="w-3.5 h-3.5"/> {label}
      {count!==undefined && <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tab===id?'bg-white/25 text-white':'bg-[#EAF7F0] text-[#0B6B43]'}`}>{count}</span>}
    </button>
  );

  return (
    <div className="space-y-4 max-w-6xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#EAF7F0] flex items-center justify-center text-[#168B57] shrink-0"><Building2 className="w-5 h-5"/></div>
        <div className="min-w-0">
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Customers / Companies</h1>
          <p className="text-xs text-gray-400 font-medium">Manage frequent parties — selectable in New Report with auto-fetch</p>
        </div>
        {!isDemo && (
          <button onClick={openCreate} className="ml-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#168B57] to-[#0B6B43] hover:from-[#0B6B43] hover:to-[#168B57] text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_4px_14px_rgba(22,139,87,0.25)] hover:scale-[1.01] active:scale-[0.99] transition-all"><Plus className="w-4 h-4"/> Add Company</button>
        )}
      </div>

      <div className="flex gap-2.5 flex-wrap">
        <Tab id="companies" label="Companies" icon={Building2} count={list.length}/>
        <Tab id="summary" label="Party Summary (Week)" icon={CalendarDays}/>
        <Tab id="groups" label="Groups" icon={Layers}/>
      </div>

      {tab==='companies' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-white/80">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, company, phone, email..." className="w-full pl-11 pr-4 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs" />
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center text-xs text-gray-500 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">Loading...</div>
          ) : list.length===0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center text-xs text-gray-500 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">No companies found</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {list.map(c=>(
                <div key={c.id} className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
                  <div className="h-1.5 bg-[#168B57]" />
                  <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#168B57] to-[#0B6B43] flex items-center justify-center text-white font-black text-sm shrink-0 shadow-xs">
                          {(c.company_name || c.name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-gray-900 truncate">{c.company_name || c.name}</p>
                          {c.contact_person && c.contact_person !== (c.company_name || c.name) && (
                            <p className="text-[11px] text-gray-500 truncate">Contact: {c.contact_person}</p>
                          )}
                        </div>
                        {c.gstin && <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-gray-900 text-white shrink-0">GST</span>}
                      </div>

                      {c.group && <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EAF7F0] text-[#0B6B43] text-[10px] font-bold w-fit"><Layers className="w-3 h-3"/>{c.group.name}</span>}

                      <div className="space-y-1.5 text-[11px] text-gray-500">
                        {c.phone && <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-[#168B57]"/> {c.phone}</p>}
                        {c.email && <p className="flex items-center gap-1.5 truncate"><Mail className="w-3 h-3 text-[#168B57]"/> {c.email}</p>}
                        {(c.city || c.state) && <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-[#168B57]"/> {[c.city, c.state].filter(Boolean).join(', ')}</p>}
                        {!c.phone && !c.email && !c.city && !c.state && <p className="text-gray-400">No contact details</p>}
                      </div>
                    </div>

                    {!isDemo && (
                      <div className="flex gap-2 pt-3 border-t border-gray-100">
                        <button onClick={()=>openEdit(c)} className="flex-1 px-3 py-2 rounded-xl bg-gray-50 hover:bg-[#EAF7F0] text-gray-700 hover:text-[#0B6B43] border border-gray-200 transition-colors text-xs font-bold flex items-center justify-center gap-1.5"><Pencil className="w-3.5 h-3.5"/> Edit</button>
                        <button onClick={()=>del(c.id)} className="px-3 py-2 rounded-xl bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 border border-gray-200 hover:border-red-200 transition-colors text-xs font-bold flex items-center justify-center"><Trash2 className="w-3.5 h-3.5"/></button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab==='summary' && <PartySummary customers={list} />}
      {tab==='groups' && <GroupsTab customers={list} onMembersChanged={()=>loadCustomers(search)} />}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" onClick={closeForm}>
          <form onSubmit={submit} onClick={e=>e.stopPropagation()} className="bg-white rounded-3xl border border-white/80 p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4 shadow-[0_25px_60px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-2"><Plus className="w-4 h-4 text-[#168B57]"/>{editing?'Edit Company / Customer':'Add New Company / Customer'}</h3>
              <button type="button" onClick={closeForm} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"><X className="w-4 h-4"/></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <input required placeholder="Name * (party name)" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs" />
              <input placeholder="Company Name" value={form.company_name} onChange={e=>setForm({...form, company_name:e.target.value})} className="px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs" />
              <input placeholder="Contact Person" value={form.contact_person} onChange={e=>setForm({...form, contact_person:e.target.value})} className="px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs" />
              <input placeholder="Phone" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} className="px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs" />
              <input type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} className="px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs" />
              <input placeholder="GSTIN" value={form.gstin} onChange={e=>setForm({...form, gstin:e.target.value})} className="px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs" />
              <input placeholder="City" value={form.city} onChange={e=>setForm({...form, city:e.target.value})} className="px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs" />
              <input placeholder="State" value={form.state} onChange={e=>setForm({...form, state:e.target.value})} className="px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs" />
              <textarea placeholder="Address" rows={2} value={form.address} onChange={e=>setForm({...form, address:e.target.value})} className="sm:col-span-2 px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs" />
              <textarea placeholder="Notes" rows={2} value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} className="sm:col-span-2 px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs" />
            </div>
            <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button type="button" onClick={closeForm} className="px-4 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
              <button type="submit" className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#168B57] to-[#0B6B43] hover:from-[#0B6B43] hover:to-[#168B57] text-white font-bold text-xs shadow-[0_4px_14px_rgba(22,139,87,0.25)] hover:scale-[1.01] active:scale-[0.99] transition-all">{editing?'Update':'Add Company'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
export default Customers;
