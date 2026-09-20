import React, { useEffect, useState } from 'react';
import api, { openPdf } from '../services/api';
import { useToast } from '../components/common/Toast';

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
    party_name: '',
    customer_name: '',
    sample_name: '',
    nature_of_sample: '',
    vehicle_no: '',
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
      setResults(res.data.map(p=>({ parameter_id:p.id, result:'', specification:p.specification||'', name:p.name, unit:p.unit })));
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

  const validate = () => {
    if (!form.report_type_id) { addToast('Report Type required','error'); return false; }
    if (!form.sample_date) { addToast('Sample Date required','error'); return false; }
    if (!form.party_name && !form.customer_name && !form.sample_name) { addToast('Party/Customer or Sample name required','error'); return false; }
    return true;
  };

  const save = async (andPdf=false) => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form, results: results.map(r=>({ parameter_id:r.parameter_id, result:r.result||'-', specification:r.specification })) };
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

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-[#1F2937]">New Report</h1>
        <p className="text-xs text-[#6B7280]">Select report type to load template</p>
      </div>

      <div className="bg-white border border-[#D1D5DB] rounded-2xl p-5 space-y-4">
        <div>
          <label className="text-xs font-bold text-[#1F2937]">Report Type *</label>
          <select value={form.report_type_id} onChange={onTypeChange} className="mt-1 w-full px-3 py-2.5 border border-[#D1D5DB] rounded-xl text-xs bg-white">
            <option value="">-- Select Report Type --</option>
            {types.map(t=><option key={t.id} value={t.id}>{t.name} — {t.title}</option>)}
          </select>
        </div>

        {selectedType && (
          <>
            <div className="pt-3 border-t border-[#D1D5DB]/60">
              <h3 className="text-xs font-bold text-[#0B6B43] uppercase">Report Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-xs font-semibold text-[#1F2937]">Sample Date *</label>
                  <input type="date" value={form.sample_date} onChange={e=>setForm({...form, sample_date:e.target.value})} className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1F2937]">COA Date</label>
                  <input type="date" value={form.coa_date} onChange={e=>setForm({...form, coa_date:e.target.value})} className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1F2937]">Party Name</label>
                  <input value={form.party_name} onChange={e=>setForm({...form, party_name:e.target.value})} placeholder="Party / Company" className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1F2937]">Customer Name</label>
                  <input value={form.customer_name} onChange={e=>setForm({...form, customer_name:e.target.value})} placeholder="Customer Name" className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1F2937]">Sample Name</label>
                  <input value={form.sample_name} onChange={e=>setForm({...form, sample_name:e.target.value})} placeholder="e.g. GHEE, WATER" className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1F2937]">Nature of Sample</label>
                  <input value={form.nature_of_sample} onChange={e=>setForm({...form, nature_of_sample:e.target.value})} placeholder="Nature of Sample" className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1F2937]">Vehicle No</label>
                  <input value={form.vehicle_no} onChange={e=>setForm({...form, vehicle_no:e.target.value})} placeholder="TN 00 AB 0000" className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1F2937]">Bill No</label>
                  <input value={form.bill_no} onChange={e=>setForm({...form, bill_no:e.target.value})} placeholder="Bill No" className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1F2937]">Bags / Tons</label>
                  <input value={form.bags_tons} onChange={e=>setForm({...form, bags_tons:e.target.value})} placeholder="e.g. 40 Bags" className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1F2937]">Buyer</label>
                  <input value={form.buyer} onChange={e=>setForm({...form, buyer:e.target.value})} placeholder="Buyer" className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-[#1F2937]">Seller</label>
                  <input value={form.seller} onChange={e=>setForm({...form, seller:e.target.value})} placeholder="Seller" className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#D1D5DB]/60">
              <h3 className="text-xs font-bold text-[#0B6B43] uppercase">Test Results</h3>
              {loadingParams ? <p className="text-xs text-[#6B7280] py-4">Loading parameters...</p> : (
                <div className="mt-3 overflow-x-auto border border-[#D1D5DB] rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead><tr className="bg-[#EAF7F0] text-[11px] uppercase font-bold text-[#6B7280] border-b border-[#D1D5DB]">
                      <th className="py-2 px-3 w-10">S.No</th><th className="py-2 px-3">Parameter</th><th className="py-2 px-3 w-28">Result</th><th className="py-2 px-3">Specification</th>
                    </tr></thead>
                    <tbody className="divide-y divide-[#D1D5DB]/60">
                      {results.map((r,i)=>(
                        <tr key={r.parameter_id}>
                          <td className="py-2 px-3 text-center">{i+1}</td>
                          <td className="py-2 px-3 font-bold text-[#1F2937]">{r.name}{r.unit && <span className="text-[#6B7280]"> ({r.unit})</span>}</td>
                          <td className="py-2 px-3"><input value={r.result} onChange={e=>updateResult(i, e.target.value)} placeholder="-" className="w-full px-2 py-1.5 border border-[#D1D5DB] rounded-lg text-xs" /></td>
                          <td className="py-2 px-3"><input value={r.specification} onChange={e=>updateSpec(i, e.target.value)} className="w-full px-2 py-1.5 border border-[#D1D5DB] rounded-lg text-xs bg-[#F9FAFB]" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-[#1F2937]">Remarks</label>
              <textarea rows="2" value={form.remarks} onChange={e=>setForm({...form, remarks:e.target.value})} placeholder="Remarks / Opinion" className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-[#D1D5DB]/60">
              <button disabled={saving} onClick={()=>save(false)} className="px-5 py-2.5 rounded-xl bg-[#168B57] text-white font-bold text-xs disabled:opacity-60">{saving?'Saving...':'Save Report'}</button>
              <button disabled={saving} onClick={()=>save(true)} className="px-5 py-2.5 rounded-xl bg-white border border-[#168B57] text-[#168B57] font-bold text-xs disabled:opacity-60">Save & Generate PDF</button>
              <button disabled={saving} onClick={()=>save(true)} className="px-5 py-2.5 rounded-xl bg-[#0B6B43] text-white font-bold text-xs disabled:opacity-60">Save & Print</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
