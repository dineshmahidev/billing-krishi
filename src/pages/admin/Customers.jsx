import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { Building2, Search, Plus, Pencil, Trash2, Phone, Mail, MapPin, X, CalendarDays, FileText, Receipt, FlaskConical, Wallet, Layers, Check } from 'lucide-react';

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
      <div className="bg-white border border-[#D1D5DB] rounded-2xl p-4 space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <select value={customerId} onChange={e=>setCustomerId(e.target.value)} className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white min-w-[220px]">
            <option value="">Select party / company...</option>
            {customers.map(c=> <option key={c.id} value={c.id}>{c.company_name || c.name}</option>)}
          </select>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-[#6B7280] flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5 text-[#168B57]"/> From</span>
            <input type="date" value={from} onChange={e=>setFrom(e.target.value)} onBlur={()=>customerId && load(customerId, from, to)} className="px-2 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
            <span className="text-[11px] font-bold text-[#6B7280]">To</span>
            <input type="date" value={to} onChange={e=>setTo(e.target.value)} onBlur={()=>customerId && load(customerId, from, to)} className="px-2 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
          </div>
          <div className="flex gap-2 lg:ml-auto">
            <button onClick={()=>setRange('this')} className="px-3 py-1.5 rounded-lg bg-[#EAF7F0] text-[#0B6B43] text-[11px] font-bold hover:bg-[#D1EEE0] transition-colors">This Week</button>
            <button onClick={()=>setRange('last')} className="px-3 py-1.5 rounded-lg bg-[#EAF7F0] text-[#0B6B43] text-[11px] font-bold hover:bg-[#D1EEE0] transition-colors">Last Week</button>
            <button onClick={()=>setRange('month')} className="px-3 py-1.5 rounded-lg bg-[#EAF7F0] text-[#0B6B43] text-[11px] font-bold hover:bg-[#D1EEE0] transition-colors">This Month</button>
          </div>
        </div>
        <p className="text-[11px] text-[#6B7280]">Party-wise weekly summary — how many times each parameter was tested × rate = amount</p>
      </div>

      {!customerId ? (
        <div className="bg-white border border-[#D1D5DB] rounded-2xl p-8 text-center text-xs text-[#6B7280]">Select a party above to view the weekly parameter summary</div>
      ) : loading ? (
        <div className="bg-white border border-[#D1D5DB] rounded-2xl p-8 text-center text-xs text-[#6B7280]">Loading summary...</div>
      ) : !data ? (
        <div className="bg-white border border-[#D1D5DB] rounded-2xl p-8 text-center text-xs text-[#6B7280]">No data</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-[#168B57] border border-[#168B57] rounded-2xl p-4 text-white shadow-[0_8px_20px_rgba(22,139,87,0.25)]">
              <p className="text-[11px] font-bold text-white/80 flex items-center gap-1"><FileText className="w-3 h-3"/> Reports</p>
              <p className="text-lg font-bold text-white">{data.report_count}</p>
              <p className="text-[11px] text-white/70">{from} → {to}</p>
            </div>
            <div className="bg-sky-500 border border-sky-600 rounded-2xl p-4 text-white shadow-[0_8px_20px_rgba(14,165,233,0.25)]">
              <p className="text-[11px] font-bold text-white/80 flex items-center gap-1"><FlaskConical className="w-3 h-3"/> Tests Taken</p>
              <p className="text-lg font-bold text-white">{data.test_count}</p>
              <p className="text-[11px] text-white/70">total parameter tests</p>
            </div>
            <div className="bg-amber-500 border border-amber-600 rounded-2xl p-4 text-white shadow-[0_8px_20px_rgba(245,158,11,0.25)]">
              <p className="text-[11px] font-bold text-white/80 flex items-center gap-1"><Receipt className="w-3 h-3"/> Invoices</p>
              <p className="text-lg font-bold text-white">{invoices.length}</p>
              <p className="text-[11px] text-white/70">in selected range</p>
            </div>
            <div className="bg-[#1F2937] border border-[#1F2937] rounded-2xl p-4 text-white shadow-[0_8px_20px_rgba(31,41,55,0.25)]">
              <p className="text-[11px] font-bold text-white/80 flex items-center gap-1"><Wallet className="w-3 h-3"/> Estimated Amount</p>
              <p className="text-lg font-bold text-white">₹{Number(data.total||0).toFixed(2)}</p>
              <p className="text-[11px] text-white/70">{rows.length} parameters</p>
            </div>
          </div>

          <div className="bg-white border border-[#D1D5DB] rounded-2xl overflow-hidden overflow-x-auto">
            <div className="px-4 py-3 border-b border-[#D1D5DB] text-xs font-bold text-[#0B6B43]">{data.customer?.name} — parameter wise count</div>
            {rows.length===0 ? <div className="p-8 text-center text-xs text-[#6B7280]">No tests in this date range</div> : (
              <table className="w-full text-left text-xs">
                <thead><tr className="bg-[#EAF7F0] text-[11px] uppercase font-bold text-[#6B7280] border-b border-[#D1D5DB]">
                  <th className="py-2 px-3">S.No</th><th className="py-2 px-3">Parameter</th><th className="py-2 px-3">Unit</th>
                  <th className="py-2 px-3 text-right">Times Tested</th><th className="py-2 px-3 text-right">Rate (₹)</th><th className="py-2 px-3 text-right">Amount (₹)</th>
                </tr></thead>
                <tbody className="divide-y divide-[#D1D5DB]/60">
                  {rows.map((r,i)=>(
                    <tr key={r.parameter_id} className="hover:bg-[#EAF7F0]/30">
                      <td className="py-2.5 px-3 text-[#6B7280]">{i+1}</td>
                      <td className="py-2.5 px-3 font-bold">{r.name}</td>
                      <td className="py-2.5 px-3 text-[#6B7280]">{r.unit||'-'}</td>
                      <td className="py-2.5 px-3 text-right"><span className="px-2 py-0.5 rounded-full bg-sky-500 text-white font-bold text-[11px]">×{r.times}</span></td>
                      <td className="py-2.5 px-3 text-right">₹{Number(r.rate||0).toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-bold">₹{Number(r.amount||0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr className="bg-[#0B6B43] text-white text-xs font-bold">
                  <td className="py-2.5 px-3" colSpan={3}>Total ({rows.length} parameters × {data.test_count} tests)</td>
                  <td className="py-2.5 px-3 text-right">{data.test_count}</td>
                  <td className="py-2.5 px-3 text-right">—</td>
                  <td className="py-2.5 px-3 text-right">₹{Number(data.total||0).toFixed(2)}</td>
                </tr></tfoot>
              </table>
            )}
            {Number(data.total||0)===0 && rows.length>0 && <div className="px-4 py-2 text-[11px] text-amber-700 bg-amber-50 border-t border-amber-200">Rates are ₹0 — set prices in Parameters screen to see amounts</div>}
          </div>

          <div className="bg-white border border-[#D1D5DB] rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#D1D5DB] text-xs font-bold text-[#0B6B43]">Invoices of this party ({invoices.length})</div>
            {invoices.length===0 ? <div className="p-6 text-center text-xs text-[#6B7280]">No invoices in this range</div> : (
              <table className="w-full text-left text-xs">
                <thead><tr className="bg-[#EAF7F0] text-[11px] uppercase font-bold text-[#6B7280] border-b border-[#D1D5DB]">
                  <th className="py-2 px-3">Invoice No</th><th className="py-2 px-3">Report</th><th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3 text-right">Total</th><th className="py-2 px-3">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-[#D1D5DB]/60">
                  {invoices.map(iv=>(
                    <tr key={iv.id} className="hover:bg-[#EAF7F0]/30">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#0B6B43]">{iv.invoice_no}</td>
                      <td className="py-2.5 px-3 font-mono">{iv.report?.report_no||'-'}</td>
                      <td className="py-2.5 px-3">{iv.created_at?.split('T')[0]}</td>
                      <td className="py-2.5 px-3 text-right font-bold">₹{Number(iv.total_amount||0).toFixed(2)}</td>
                      <td className="py-2.5 px-3"><span className={`px-2 py-1 rounded-full text-[11px] font-bold text-white ${iv.status==='paid'?'bg-emerald-500':iv.status==='partial'?'bg-sky-500':'bg-amber-500'}`}>{iv.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const GroupsTab = ({ customers, onMembersChanged }) => {
  const { addToast } = useToast();
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
    if (!newName.trim()) { addToast('Group name required','error'); return; }
    try {
      const r = await api.post('/customer-groups', { name:newName.trim() });
      addToast('Group created');
      setNewName(''); setSelId(r.data.id); setPicked([]);
      loadGroups();
    } catch(err){ addToast(err.response?.data?.message||'Create failed','error'); }
  };

  const renameGroup = async (g) => {
    const name = prompt('Rename group', g.name);
    if (!name || name.trim()==='' || name.trim()===g.name) return;
    try { await api.put(`/customer-groups/${g.id}`, { name:name.trim() }); addToast('Group renamed'); loadGroups(); }
    catch(err){ addToast(err.response?.data?.message||'Rename failed','error'); }
  };

  const deleteGroup = async (g) => {
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
      <form onSubmit={createGroup} className="bg-white border border-[#D1D5DB] rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="w-9 h-9 rounded-xl bg-[#EAF7F0] flex items-center justify-center text-[#168B57]"><Layers className="w-5 h-5"/></div>
        <div className="flex-1 w-full sm:w-auto">
          <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="New group name (e.g. AMC Clients, Weekly Parties)" className="w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
        </div>
        <button type="submit" className="px-4 py-2 rounded-xl bg-[#168B57] hover:bg-[#0B6B43] transition-colors text-white font-bold text-xs flex items-center gap-1"><Plus className="w-4 h-4"/> Create Group</button>
      </form>

      {loading ? <div className="bg-white border border-[#D1D5DB] rounded-2xl p-6 text-center text-xs text-[#6B7280]">Loading groups...</div>
       : groups.length===0 ? <div className="bg-white border border-[#D1D5DB] rounded-2xl p-6 text-center text-xs text-[#6B7280]">No groups yet — create one above</div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {groups.map(g=>(
            <div key={g.id} onClick={()=>selectGroup(g)} className={`bg-white rounded-2xl overflow-hidden cursor-pointer border transition-shadow ${selId===g.id ? 'border-[#168B57] shadow-[0_0_0_3px_rgba(22,139,87,0.15)]' : 'border-[#D1D5DB] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]'}`}>
              <div className={`h-1.5 ${selId===g.id ? 'bg-[#168B57]' : 'bg-[#D1D5DB]'}`} />
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#1F2937] truncate flex items-center gap-1.5">
                      {selId===g.id && <Check className="w-4 h-4 text-[#168B57]"/>} {g.name}
                    </p>
                    <p className="text-[11px] text-[#6B7280]">{g.customers_count} compan{g.customers_count===1?'y':'ies'}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={e=>{e.stopPropagation(); renameGroup(g);}} className="p-1.5 rounded-lg hover:bg-[#EAF7F0]" title="Rename"><Pencil className="w-3.5 h-3.5 text-[#1F2937]"/></button>
                    <button onClick={e=>{e.stopPropagation(); deleteGroup(g);}} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Delete"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[24px]">
                  {(g.customers||[]).length===0 ? <span className="text-[11px] text-[#9CA3AF]">No companies — click to add</span> :
                    (g.customers||[]).map(c=> <span key={c.id} className="px-2 py-0.5 rounded-full bg-[#EAF7F0] text-[#0B6B43] text-[10px] font-bold">{c.company_name || c.name}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white border border-[#D1D5DB] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#D1D5DB] flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-bold text-[#0B6B43]">{selectedGroup ? `Select companies → add to "${selectedGroup.name}"` : 'Select a group above to add companies'}</p>
          {selectedGroup && (
            <div className="flex gap-2">
              <button onClick={()=>setPicked(customers.map(c=>c.id))} className="px-3 py-1.5 rounded-lg border border-[#D1D5DB] text-[11px] font-bold">Select all</button>
              <button onClick={()=>setPicked([])} className="px-3 py-1.5 rounded-lg border border-[#D1D5DB] text-[11px] font-bold">None</button>
              <button onClick={assign} disabled={saving} className="px-4 py-1.5 rounded-lg bg-[#168B57] hover:bg-[#0B6B43] transition-colors text-white text-[11px] font-bold disabled:opacity-60">{saving?'Saving...':`Save (${picked.length})`}</button>
            </div>
          )}
        </div>
        {!selectedGroup ? (
          <div className="p-6 text-center text-xs text-[#6B7280]">Click a group card (or create one) first</div>
        ) : customers.length===0 ? (
          <div className="p-6 text-center text-xs text-[#6B7280]">No companies — add from Companies tab</div>
        ) : (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {customers.map(c=>{
              const checked = picked.includes(c.id);
              const inThis = c.group_id === selectedGroup.id;
              return (
                <label key={c.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${checked ? 'border-[#168B57] bg-[#EAF7F0]' : 'border-[#D1D5DB] hover:bg-[#F9FAFB]'}`}>
                  <input type="checkbox" checked={checked} onChange={()=>togglePick(c.id)} className="accent-[#168B57] w-4 h-4" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-[#1F2937] truncate">{c.company_name || c.name}</span>
                    <span className="block text-[11px] text-[#6B7280] truncate">
                      {c.phone || c.email || 'No contact'}
                      {inThis && <span className="text-[#168B57] font-bold"> • in this group</span>}
                      {!inThis && c.group && <span className="text-[#6B7280]"> • group: {c.group.name}</span>}
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
    if (!form.name) { addToast('Name required','error'); return; }
    try {
      if (editing) await api.put(`/customers/${editing}`, form);
      else await api.post('/customers', form);
      addToast(editing?'Company updated':'Company added');
      closeForm(); loadCustomers(search);
    } catch(err){ addToast(err.response?.data?.message||'Save failed','error'); }
  };

  const del = async (id) => {
    if (!confirm('Delete customer?')) return;
    try { await api.delete(`/customers/${id}`); addToast('Deleted'); loadCustomers(search); } catch { addToast('Delete failed','error'); }
  };

  const Tab = ({ id, label, icon:Icon, count }) => (
    <button onClick={()=>setTab(id)} className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${tab===id ? 'bg-[#168B57] text-white shadow-[0_4px_12px_rgba(22,139,87,0.3)]' : 'bg-white border border-[#D1D5DB] text-[#6B7280] hover:bg-[#EAF7F0]'}`}>
      <Icon className="w-3.5 h-3.5"/> {label}
      {count!==undefined && <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${tab===id?'bg-white/25 text-white':'bg-[#EAF7F0] text-[#0B6B43]'}`}>{count}</span>}
    </button>
  );

  return (
    <div className="space-y-4 max-w-6xl">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#EAF7F0] flex items-center justify-center text-[#168B57]"><Building2 className="w-5 h-5"/></div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold">Customers / Companies</h1>
          <p className="text-xs text-[#6B7280]">Manage frequent parties — selectable in New Report with auto-fetch</p>
        </div>
        <button onClick={openCreate} className="ml-auto px-4 py-2 rounded-xl bg-[#168B57] hover:bg-[#0B6B43] transition-colors text-white font-bold text-xs flex items-center gap-1"><Plus className="w-4 h-4"/> Add Company</button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Tab id="companies" label="Companies" icon={Building2} count={list.length}/>
        <Tab id="summary" label="Party Summary (Week)" icon={CalendarDays}/>
        <Tab id="groups" label="Groups" icon={Layers}/>
      </div>

      {tab==='companies' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#D1D5DB] rounded-2xl p-4">
            <div className="relative">
              <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, company, phone, email..." className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
            </div>
          </div>

          {loading ? (
            <div className="bg-white border border-[#D1D5DB] rounded-2xl p-8 text-center text-xs text-[#6B7280]">Loading...</div>
          ) : list.length===0 ? (
            <div className="bg-white border border-[#D1D5DB] rounded-2xl p-8 text-center text-xs text-[#6B7280]">No companies yet — click <b>+ Add Company</b></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {list.map(c=>(
                <div key={c.id} className="bg-white border border-[#D1D5DB] rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow">
                  <div className="h-1.5 bg-[#168B57]" />
                  <div className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#168B57] flex items-center justify-center text-white font-black text-sm shrink-0">
                        {(c.company_name || c.name || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#1F2937] truncate">{c.company_name || c.name}</p>
                        <p className="text-[11px] text-[#6B7280] truncate">{c.contact_person || c.name}</p>
                      </div>
                      {c.gstin && <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-[#1F2937] text-white shrink-0">GST</span>}
                    </div>

                    {c.group && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EAF7F0] text-[#0B6B43] text-[10px] font-bold w-fit"><Layers className="w-3 h-3"/>{c.group.name}</span>}

                    <div className="space-y-1 text-[11px] text-[#6B7280]">
                      {c.phone && <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-[#168B57]"/> {c.phone}</p>}
                      {c.email && <p className="flex items-center gap-1.5 truncate"><Mail className="w-3 h-3 text-[#168B57]"/> {c.email}</p>}
                      {(c.city || c.state) && <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-[#168B57]"/> {[c.city, c.state].filter(Boolean).join(', ')}</p>}
                      {!c.phone && !c.email && !c.city && !c.state && <p className="text-[#9CA3AF]">No contact details</p>}
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-[#D1D5DB]/60">
                      <button onClick={()=>openEdit(c)} className="flex-1 px-3 py-1.5 rounded-lg bg-[#168B57] hover:bg-[#0B6B43] transition-colors text-white text-xs font-bold flex items-center justify-center gap-1"><Pencil className="w-3.5 h-3.5"/> Edit</button>
                      <button onClick={()=>del(c.id)} className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 transition-colors text-white text-xs font-bold flex items-center justify-center gap-1"><Trash2 className="w-3.5 h-3.5"/></button>
                    </div>
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
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={closeForm}>
          <form onSubmit={submit} onClick={e=>e.stopPropagation()} className="bg-white rounded-2xl border border-[#D1D5DB] p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-3 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1F2937] flex items-center gap-2"><Plus className="w-4 h-4 text-[#168B57]"/>{editing?'Edit Company / Customer':'Add New Company / Customer'}</h3>
              <button type="button" onClick={closeForm} className="p-1.5 rounded-lg hover:bg-[#EAF7F0] text-[#6B7280]"><X className="w-4 h-4"/></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input required placeholder="Name * (party name)" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
              <input placeholder="Company Name" value={form.company_name} onChange={e=>setForm({...form, company_name:e.target.value})} className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
              <input placeholder="Contact Person" value={form.contact_person} onChange={e=>setForm({...form, contact_person:e.target.value})} className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
              <input placeholder="Phone" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
              <input type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
              <input placeholder="GSTIN" value={form.gstin} onChange={e=>setForm({...form, gstin:e.target.value})} className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs font-mono" />
              <input placeholder="City" value={form.city} onChange={e=>setForm({...form, city:e.target.value})} className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
              <input placeholder="State" value={form.state} onChange={e=>setForm({...form, state:e.target.value})} className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
              <textarea placeholder="Address" rows={2} value={form.address} onChange={e=>setForm({...form, address:e.target.value})} className="sm:col-span-2 px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
              <textarea placeholder="Notes" rows={2} value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} className="sm:col-span-2 px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={closeForm} className="px-4 py-2.5 rounded-xl border border-[#D1D5DB] text-xs font-bold">Cancel</button>
              <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#168B57] hover:bg-[#0B6B43] transition-colors text-white font-bold text-xs">{editing?'Update':'Add Company'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
export default Customers;
