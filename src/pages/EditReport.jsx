import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../components/common/Toast';

export const EditReport = ({ reportId, setActiveTab, setSelectedReportId }) => {
  const { addToast } = useToast();
  const [form, setForm] = useState(null);
  const [results, setResults] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(()=>{
    if (!reportId) return;
    api.get(`/reports/${reportId}`).then(r=>{
      const d=r.data;
      setForm({
        sample_date: d.sample_date ? d.sample_date.split('T')[0] : '',
        coa_date: d.coa_date ? d.coa_date.split('T')[0] : '',
        party_name: d.party_name || '',
        customer_name: d.customer_name || '',
        sample_name: d.sample_name || '',
        nature_of_sample: d.nature_of_sample || '',
        vehicle_no: d.vehicle_no || '',
        bill_no: d.bill_no || '',
        bags_tons: d.bags_tons || '',
        buyer: d.buyer || '',
        seller: d.seller || '',
        remarks: d.remarks || '',
        report_type: d.report_type,
        report_no: d.report_no,
      });
      setResults(d.results.map(x=>({ parameter_id:x.parameter_id, result:x.result, specification:x.specification, name:x.parameter?.name, unit:x.parameter?.unit })));
    });
  }, [reportId]);

  if (!reportId) return <div className="p-8 text-center text-xs text-[#6B7280]">No report selected</div>;
  if (!form) return <div className="p-8 text-center text-xs text-[#6B7280]">Loading...</div>;

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form, results: results.map(r=>({ parameter_id:r.parameter_id, result:r.result, specification:r.specification })) };
      delete payload.report_type; delete payload.report_no;
      await api.put(`/reports/${reportId}`, payload);
      addToast('Report updated');
      setActiveTab('view-report');
    } catch(e){ addToast(e.response?.data?.message||'Update failed','error'); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-[#1F2937]">Edit Report — {form.report_no}</h1>
        <p className="text-xs text-[#6B7280]">{form.report_type?.name} • {form.report_type?.title}</p>
      </div>
      <div className="bg-white border border-[#D1D5DB] rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label className="text-xs font-bold">Sample Date</label><input type="date" value={form.sample_date} onChange={e=>setForm({...form, sample_date:e.target.value})} className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" /></div>
          <div><label className="text-xs font-bold">COA Date</label><input type="date" value={form.coa_date} onChange={e=>setForm({...form, coa_date:e.target.value})} className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" /></div>
          <div><label className="text-xs font-bold">Party Name</label><input value={form.party_name} onChange={e=>setForm({...form, party_name:e.target.value})} className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" /></div>
          <div><label className="text-xs font-bold">Customer Name</label><input value={form.customer_name} onChange={e=>setForm({...form, customer_name:e.target.value})} className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" /></div>
          <div><label className="text-xs font-bold">Sample Name</label><input value={form.sample_name} onChange={e=>setForm({...form, sample_name:e.target.value})} className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" /></div>
          <div><label className="text-xs font-bold">Nature of Sample</label><input value={form.nature_of_sample} onChange={e=>setForm({...form, nature_of_sample:e.target.value})} className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" /></div>
          <div><label className="text-xs font-bold">Vehicle No</label><input value={form.vehicle_no} onChange={e=>setForm({...form, vehicle_no:e.target.value})} className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" /></div>
          <div><label className="text-xs font-bold">Bill No</label><input value={form.bill_no} onChange={e=>setForm({...form, bill_no:e.target.value})} className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" /></div>
          <div><label className="text-xs font-bold">Bags / Tons</label><input value={form.bags_tons} onChange={e=>setForm({...form, bags_tons:e.target.value})} className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" /></div>
          <div><label className="text-xs font-bold">Buyer</label><input value={form.buyer} onChange={e=>setForm({...form, buyer:e.target.value})} className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" /></div>
          <div className="sm:col-span-2"><label className="text-xs font-bold">Seller</label><input value={form.seller} onChange={e=>setForm({...form, seller:e.target.value})} className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" /></div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-[#0B6B43] uppercase">Test Results</h3>
          <div className="mt-2 overflow-x-auto border border-[#D1D5DB] rounded-xl">
            <table className="w-full text-left text-xs">
              <thead><tr className="bg-[#EAF7F0] text-[11px] uppercase font-bold text-[#6B7280] border-b border-[#D1D5DB]"><th className="py-2 px-3 w-10">S.No</th><th className="py-2 px-3">Parameter</th><th className="py-2 px-3 w-28">Result</th><th className="py-2 px-3">Specification</th></tr></thead>
              <tbody className="divide-y divide-[#D1D5DB]/60">
                {results.map((r,i)=>(
                  <tr key={r.parameter_id}>
                    <td className="py-2 px-3 text-center">{i+1}</td>
                    <td className="py-2 px-3 font-bold">{r.name}</td>
                    <td className="py-2 px-3"><input value={r.result} onChange={e=>{ const c=[...results]; c[i].result=e.target.value; setResults(c); }} className="w-full px-2 py-1.5 border border-[#D1D5DB] rounded-lg text-xs" /></td>
                    <td className="py-2 px-3"><input value={r.specification} onChange={e=>{ const c=[...results]; c[i].specification=e.target.value; setResults(c); }} className="w-full px-2 py-1.5 border border-[#D1D5DB] rounded-lg text-xs bg-[#F9FAFB]" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div><label className="text-xs font-bold">Remarks</label><textarea rows="2" value={form.remarks} onChange={e=>setForm({...form, remarks:e.target.value})} className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" /></div>

        <div className="flex gap-2">
          <button disabled={saving} onClick={save} className="px-5 py-2.5 rounded-xl bg-[#168B57] text-white font-bold text-xs disabled:opacity-60">{saving?'Saving...':'Update Report'}</button>
          <button onClick={()=>setActiveTab('view-report')} className="px-5 py-2.5 rounded-xl bg-white border border-[#D1D5DB] font-bold text-xs">Cancel</button>
        </div>
      </div>
    </div>
  );
};
