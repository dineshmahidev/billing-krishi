import React, { useEffect, useState } from 'react';
import api, { openPdf } from '../services/api';
import { useToast } from '../components/common/Toast';
import { CustomerAutocomplete } from '../components/common/CustomerAutocomplete';
import { Calendar, Building2, FlaskConical, Truck, Package, User, FileText, Layers } from 'lucide-react';

export const NewReport = ({ setActiveTab, setSelectedReportId }) => {
  const { addToast } = useToast();
  const [types, setTypes] = useState([]);
  const [params, setParams] = useState([]);
  const [loadingParams, setLoadingParams] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    report_type_id: '',
    sample_date: new Date().toISOString().split('T')[0],
    coa_date: new Date().toISOString().split('T')[0],
    company_name: '',
    party_name: '',
    customer_name: '',
    sample_name: '',
    vehicle_no: '',
    report_no: '',
    bill_no: '',
    bags_tons: '',
    buyer: '',
    seller: '',
    remarks: '',
  });
  const [results, setResults] = useState([]);

  useEffect(()=>{ api.get('/report-types').then(r=>setTypes(r.data)).catch(()=>{}); }, []);

  const loadParams = async (typeId) => {
    if (!typeId) { setParams([]); setResults([]); return; }
    setLoadingParams(true);
    try {
      const res = await api.get(`/report-types/${typeId}/parameters`);
      setParams(res.data);
      setResults(res.data.map(p=>({ parameter_id:p.id, result:'', specification:p.specification||'', name:p.name, unit:p.unit, enabled:true })));
    } catch { setParams([]); setResults([]);} finally { setLoadingParams(false); }
  };

  const onTypeChange = (e) => {
    const v = e.target.value;
    setForm(f=>({...f, report_type_id:v}));
    loadParams(v);
  };

  const updateResult = (idx, val) => {
    setResults(r=>{
      const copy=[...r];
      copy[idx] = {...copy[idx], result:val};
      return copy;
    });
  };
  const updateSpec = (idx, val) => {
    setResults(r=>{
      const copy=[...r];
      copy[idx] = {...copy[idx], specification:val};
      return copy;
    });
  };
  const toggleEnabled = (idx) => {
    setResults(r=>{
      const copy=[...r];
      copy[idx] = {...copy[idx], enabled: !(copy[idx].enabled !== false)};
      return copy;
    });
  };

  const validate = () => {
    if (!form.report_type_id) { addToast('Report Type required','error'); return false; }
    if (!form.sample_date) { addToast('Sample Date required','error'); return false; }
    if (!form.company_name && !form.sample_name) { addToast('Company or Sample name required','error'); return false; }
    return true;
  };

  const save = async (andPdf=false) => {
    if (!validate()) return;
    setSaving(true);
    try {
      // company_name is kept for UI, but backend expects party/customer - map for backward compat
      const payload = { ...form, party_name: form.company_name || form.party_name, customer_name: form.company_name || form.customer_name, results: results.map(r=>({ parameter_id:r.parameter_id, result:r.result||'-', specification:r.specification, enabled:r.enabled !== false })) };
      delete payload.company_name;
      if (!payload.report_no) delete payload.report_no;   // blank = auto generate
      if (!payload.bill_no) delete payload.bill_no;
      const res = await api.post('/reports', payload);
      addToast(`Report ${res.data.report_no} saved`);
      if (andPdf) {
        await openPdf(res.data.id);
      }
      setSelectedReportId(res.data.id);
      setActiveTab('view-report');
    } catch (e) {
      addToast(e.response?.data?.message || 'Save failed','error');
    } finally { setSaving(false); }
  };

  const selectedType = types.find(t=>String(t.id)===String(form.report_type_id));
  const showSpec = selectedType ? (selectedType.show_specification ?? true) : true;
  const customCols = selectedType?.custom_columns || [];

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-[#1F2937]">New Report</h1>
        <p className="text-xs text-[#6B7280]">Select report type to load template</p>
      </div>

      <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-5 space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
        <div>
          <label className="text-xs font-bold text-[#1F2937] flex items-center gap-1"><Layers className="w-3 h-3 text-[#168B57]" /> Report Type *</label>
          <div className="relative mt-1">
            <Layers className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
            <select value={form.report_type_id} onChange={onTypeChange} className="w-full pl-9 pr-3 py-2.5 border border-[#D1D5DB] rounded-xl text-xs bg-white/80 backdrop-blur">
              <option value="">-- Select Report Type --</option>
              {types.map(t=><option key={t.id} value={t.id}>{t.name} — {t.title}</option>)}
            </select>
          </div>
        </div>

        {selectedType && (
          <>
            <div className="pt-3 border-t border-[#D1D5DB]/60">
              <h3 className="text-xs font-bold text-[#0B6B43] uppercase">Report Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-xs font-semibold text-[#1F2937] flex items-center gap-1"><Calendar className="w-3 h-3 text-[#168B57]" /> Sample Date *</label>
                  <div className="relative mt-1">
                    <Calendar className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="date" value={form.sample_date} onChange={e=>setForm({...form, sample_date:e.target.value})} className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1F2937] flex items-center gap-1"><Calendar className="w-3 h-3 text-[#168B57]" /> COA Date</label>
                  <div className="relative mt-1">
                    <Calendar className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="date" value={form.coa_date} onChange={e=>setForm({...form, coa_date:e.target.value})} className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
                  </div>
                </div>
                <div>
                  <CustomerAutocomplete
                    label="Company Name"
                    placeholder="Type company - selectable, new enterable"
                    value={form.company_name || form.party_name || form.customer_name}
                    onChange={v=>setForm(f=>({...f, company_name:v, party_name:v, customer_name:v}))}
                    onSelect={c=> setForm(f=>({...f, company_name:c.name, party_name:c.name, customer_name:c.name }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1F2937] flex items-center gap-1"><FlaskConical className="w-3 h-3 text-[#168B57]" /> Sample Name</label>
                  <div className="relative mt-1">
                    <FlaskConical className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input value={form.sample_name} onChange={e=>setForm({...form, sample_name:e.target.value})} placeholder="e.g. GHEE, WATER" className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1F2937] flex items-center gap-1"><Truck className="w-3 h-3 text-[#168B57]" /> Vehicle No</label>
                  <div className="relative mt-1">
                    <Truck className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input value={form.vehicle_no} onChange={e=>setForm({...form, vehicle_no:e.target.value})} placeholder="TN 00 AB 0000" className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1F2937]">Report No <span className="text-[11px] text-[#168B57] font-normal">(auto / editable)</span></label>
                  <input value={form.report_no} onChange={e=>setForm({...form, report_no:e.target.value})} placeholder="Auto — leave blank" className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1F2937]">Bill No <span className="text-[11px] text-[#168B57] font-normal">(auto / editable)</span></label>
                  <input value={form.bill_no} onChange={e=>setForm({...form, bill_no:e.target.value})} placeholder="Auto — leave blank" className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1F2937] flex items-center gap-1"><Package className="w-3 h-3 text-[#168B57]" /> Bags / Tons</label>
                  <div className="relative mt-1">
                    <Package className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input value={form.bags_tons} onChange={e=>setForm({...form, bags_tons:e.target.value})} placeholder="e.g. 40 Bags" className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1F2937] flex items-center gap-1"><User className="w-3 h-3 text-[#168B57]" /> Buyer</label>
                  <div className="relative mt-1">
                    <User className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input value={form.buyer} onChange={e=>setForm({...form, buyer:e.target.value})} placeholder="Buyer" className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-[#1F2937] flex items-center gap-1"><User className="w-3 h-3 text-[#168B57]" /> Seller</label>
                  <div className="relative mt-1">
                    <User className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input value={form.seller} onChange={e=>setForm({...form, seller:e.target.value})} placeholder="Seller" className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#D1D5DB]/60">
              <h3 className="text-xs font-bold text-[#0B6B43] uppercase">Test Results {showSpec ? '' : '(Specification hidden)'} {customCols.length>0 && `+ ${customCols.join(', ')}`}</h3>
              {loadingParams ? <p className="text-xs text-[#6B7280] py-4">Loading parameters...</p> : (
                <div className="mt-3 overflow-x-auto border border-[#D1D5DB] rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead><tr className="bg-[#EAF7F0] text-[11px] uppercase font-bold text-[#6B7280] border-b border-[#D1D5DB]">
                      <th className="py-2 px-3 w-10">S.No</th><th className="py-2 px-3">Parameter</th><th className="py-2 px-3 w-28">Result</th>{showSpec && <th className="py-2 px-3">Specification</th>}{customCols.map(c=> <th key={c} className="py-2 px-3 bg-[#EAF7F0] border-l border-[#D1D5DB]">{c}</th>)}<th className="py-2 px-3 w-14 text-center">Use</th>
                    </tr></thead>
                    <tbody className="divide-y divide-[#D1D5DB]/60">
                      {results.map((r,i)=>{
                        const on = r.enabled !== false;
                        const sno = results.slice(0,i).filter(x=>x.enabled!==false).length + (on ? 1 : 0);
                        return (
                        <tr key={r.parameter_id} className={on ? '' : 'bg-[#F3F4F6] opacity-60'}>
                          <td className="py-2 px-3 text-center">{on ? sno : '—'}</td>
                          <td className="py-2 px-3 font-bold text-[#1F2937]">{r.name}</td>
                          <td className="py-2 px-3">
                            <div className="relative">
                              <input value={r.result} disabled={!on} onChange={e=>updateResult(i, e.target.value.replace('%',''))} placeholder="-" className={`w-full px-2 py-1.5 border border-[#D1D5DB] rounded-lg text-xs disabled:bg-[#F3F4F6] ${r.unit === '%' ? 'pr-7' : ''}`} />
                              {r.unit === '%' && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-[#168B57]">%</span>}
                              {r.unit && r.unit !== '%' && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#6B7280]">{r.unit}</span>}
                            </div>
                          </td>
                          {showSpec && <td className="py-2 px-3"><input value={r.specification} disabled={!on} onChange={e=>updateSpec(i, e.target.value)} className="w-full px-2 py-1.5 border border-[#D1D5DB] rounded-lg text-xs bg-[#F9FAFB] disabled:bg-[#F3F4F6]" /></td>}
                          {customCols.map(c=> <td key={c} className="py-2 px-3"><input placeholder="-" disabled={!on} className="w-full px-2 py-1.5 border border-[#D1D5DB] rounded-lg text-xs bg-white disabled:bg-[#F3F4F6]" /></td>)}
                          <td className="py-2 px-3 text-center">
                            <input type="checkbox" checked={on} onChange={()=>toggleEnabled(i)} title={on ? 'Included in report & PDF' : 'Excluded from report & PDF'} className="w-4 h-4 accent-[#168B57] cursor-pointer" />
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {!showSpec && <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1 mt-2">Specification column hidden for {selectedType?.name} — enable in Report Types → Show Specification</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-[#1F2937]">Remarks</label>
              <textarea rows="2" value={form.remarks} onChange={e=>setForm({...form, remarks:e.target.value})} placeholder="Remarks / Opinion" className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-[#D1D5DB]/60">
              <button disabled={saving} onClick={()=>save(false)} className="px-5 py-2.5 rounded-xl bg-[#168B57] text-white font-bold text-xs hover:bg-[#0B6B43] transition-colors disabled:opacity-60">{saving?'Saving...':'Save Report'}</button>
              <button disabled={saving} onClick={()=>save(true)} className="px-5 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition-colors shadow-[0_4px_12px_rgba(245,158,11,0.3)] disabled:opacity-60">Save & Generate PDF</button>
              <button disabled={saving} onClick={()=>save(true)} className="px-5 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors disabled:opacity-60">Save & Print</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
