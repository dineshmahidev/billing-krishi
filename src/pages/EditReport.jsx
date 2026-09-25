import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../components/common/Toast';
import { CustomerAutocomplete } from '../components/common/CustomerAutocomplete';

export const EditReport = ({ reportId, setActiveTab, setSelectedReportId }) => {
  const { addToast } = useToast();
  const [form, setForm] = useState(null);
  const [results, setResults] = useState([]);
  const [saving, setSaving] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(()=>{
    if (!reportId) return;
    setLoadError('');
    setForm(null);
    api.get(`/reports/${reportId}`).then(r=>{
      const d=r.data;
      const company = d.party_name || d.customer_name || '';
      setForm({
        sample_date: d.sample_date ? d.sample_date.split('T')[0] : '',
        coa_date: d.coa_date ? d.coa_date.split('T')[0] : '',
        company_name: company,
        party_name: company,
        customer_name: company,
        sample_name: d.sample_name || '',
        vehicle_no: d.vehicle_no || '',
        bill_no: d.bill_no || '',
        bags_tons: d.bags_tons || '',
        buyer: d.buyer || '',
        seller: d.seller || '',
        remarks: d.remarks || '',
        report_type: d.report_type,
        report_no: d.report_no,
      });
      setResults((d.results||[]).map(x=>({ parameter_id:x.parameter_id, result:x.result, specification:x.specification, name:x.parameter?.name, unit:x.parameter?.unit, enabled:x.enabled !== false })));
    }).catch(()=> setLoadError('Failed to load report'));
    api.get(`/reports/${reportId}/invoice`).then(r=> setInvoice(r.data)).catch(()=> setInvoice(null));
  }, [reportId]);

  if (!reportId) return <div className="p-8 text-center text-xs text-[#6B7280]">No report selected</div>;
  if (loadError) return <div className="p-8 text-center text-xs text-red-600">{loadError}</div>;
  if (!form) return <div className="p-8 text-center text-xs text-[#6B7280]">Loading...</div>;
  const showSpecEdit = form.report_type ? (form.report_type.show_specification ?? true) : true;
  const customColsEdit = form.report_type?.custom_columns || [];

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form, party_name: form.company_name || form.party_name, customer_name: form.company_name || form.customer_name, results: results.map(r=>({ parameter_id:r.parameter_id, result:r.result, specification:r.specification, enabled:r.enabled !== false })) };
      delete payload.company_name; delete payload.report_type;
      if (!payload.report_no) delete payload.report_no;   // blank = keep current number
      if (!payload.bill_no) delete payload.bill_no;
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
      <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-5 space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label className="text-xs font-bold">Sample Date</label><input type="date" value={form.sample_date} onChange={e=>setForm({...form, sample_date:e.target.value})} className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" /></div>
          <div><label className="text-xs font-bold">COA Date</label><input type="date" value={form.coa_date} onChange={e=>setForm({...form, coa_date:e.target.value})} className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" /></div>
          <div><CustomerAutocomplete label="Company Name" value={form.company_name} onChange={v=>setForm(f=>({...f, company_name:v, party_name:v, customer_name:v}))} onSelect={c=> setForm(f=>({...f, company_name:c.name, party_name:c.name, customer_name:c.name}))} placeholder="Selectable - new manually enterable" /></div>
          <div><label className="text-xs font-bold">Sample Name</label><input value={form.sample_name} onChange={e=>setForm({...form, sample_name:e.target.value})} className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" /></div>
          <div><label className="text-xs font-bold">Vehicle No</label><input value={form.vehicle_no} onChange={e=>setForm({...form, vehicle_no:e.target.value})} className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" /></div>
          <div><label className="text-xs font-bold">Report No <span className="text-[11px] text-[#168B57] font-normal">(editable)</span></label><input value={form.report_no || ''} onChange={e=>setForm({...form, report_no:e.target.value})} placeholder="Blank = keep current" className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" /></div>
          <div><label className="text-xs font-bold">Bill No <span className="text-[11px] text-[#168B57] font-normal">(editable)</span></label><input value={form.bill_no || ''} onChange={e=>setForm({...form, bill_no:e.target.value})} placeholder="Auto — leave blank" className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" /></div>
          <div><label className="text-xs font-bold">Bags / Tons</label><input value={form.bags_tons} onChange={e=>setForm({...form, bags_tons:e.target.value})} className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" /></div>
          <div><label className="text-xs font-bold">Buyer</label><input value={form.buyer} onChange={e=>setForm({...form, buyer:e.target.value})} className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" /></div>
          <div className="sm:col-span-2"><label className="text-xs font-bold">Seller</label><input value={form.seller} onChange={e=>setForm({...form, seller:e.target.value})} className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" /></div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-[#0B6B43] uppercase">Test Results {showSpecEdit ? '' : '(Specification hidden)'} {customColsEdit.length>0 && `+ ${customColsEdit.join(', ')}`}</h3>
          <div className="mt-2 overflow-x-auto border border-[#D1D5DB] rounded-xl">
            <table className="w-full text-left text-xs">
              <thead><tr className="bg-[#EAF7F0] text-[11px] uppercase font-bold text-[#6B7280] border-b border-[#D1D5DB]"><th className="py-2 px-3 w-10">S.No</th><th className="py-2 px-3">Parameter</th><th className="py-2 px-3 w-28">Result</th>{showSpecEdit && <th className="py-2 px-3">Specification</th>}{customColsEdit.map(c=> <th key={c} className="py-2 px-3 bg-[#EAF7F0] border-l border-[#D1D5DB]">{c}</th>)}<th className="py-2 px-3 w-14 text-center">Use</th></tr></thead>
              <tbody className="divide-y divide-[#D1D5DB]/60">
                {results.map((r,i)=>{
                  const on = r.enabled !== false;
                  const sno = results.slice(0,i).filter(x=>x.enabled!==false).length + (on ? 1 : 0);
                  return (
                  <tr key={r.parameter_id} className={on ? '' : 'bg-[#F3F4F6] opacity-60'}>
                    <td className="py-2 px-3 text-center">{on ? sno : '—'}</td>
                    <td className="py-2 px-3 font-bold">{r.name}</td>
                    <td className="py-2 px-3">
                      <div className="relative">
                        <input value={r.result} disabled={!on} onChange={e=>{ const c=[...results]; c[i].result=e.target.value.replace('%',''); setResults(c); }} className={`w-full px-2 py-1.5 border border-[#D1D5DB] rounded-lg text-xs disabled:bg-[#F3F4F6] ${r.unit === '%' ? 'pr-7' : ''}`} />
                        {r.unit === '%' && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-[#168B57]">%</span>}
                      </div>
                    </td>
                    {showSpecEdit && <td className="py-2 px-3"><input value={r.specification} disabled={!on} onChange={e=>{ const c=[...results]; c[i].specification=e.target.value; setResults(c); }} className="w-full px-2 py-1.5 border border-[#D1D5DB] rounded-lg text-xs bg-[#F9FAFB] disabled:bg-[#F3F4F6]" /></td>}
                    {customColsEdit.map(c=> <td key={c} className="py-2 px-3"><input placeholder="-" disabled={!on} className="w-full px-2 py-1.5 border border-[#D1D5DB] rounded-lg text-xs bg-white disabled:bg-[#F3F4F6]" /></td>)}
                    <td className="py-2 px-3 text-center">
                      <input type="checkbox" checked={on} onChange={()=>{ const c=[...results]; c[i]={...c[i], enabled:!on}; setResults(c); }} title={on ? 'Included in report & PDF' : 'Excluded from report & PDF'} className="w-4 h-4 accent-[#168B57] cursor-pointer" />
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div><label className="text-xs font-bold">Remarks</label><textarea rows="2" value={form.remarks} onChange={e=>setForm({...form, remarks:e.target.value})} className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" placeholder="Remarks - empty selectable" /></div>

        {invoice && (
          <div className="border-2 border-[#168B57]/30 rounded-2xl p-4 bg-[#EAF7F0]/30 space-y-3">
            <h3 className="text-xs font-bold text-[#0B6B43]">Invoice — {invoice.invoice_no} (editable, empty selectable)</h3>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-white border border-[#D1D5DB] rounded-xl p-3 text-center"><p className="text-[#6B7280]">Subtotal</p><p className="font-bold">₹{Number(invoice.subtotal).toFixed(2)}</p></div>
              <div className="bg-white border border-[#D1D5DB] rounded-xl p-3 text-center"><p className="text-[#6B7280]">GST {invoice.gst_enabled?`(${invoice.gst_percent}%)`:'(off)'}</p><p className="font-bold">₹{Number(invoice.gst_amount).toFixed(2)}</p></div>
              <div className="bg-[#0B6B43] text-white rounded-xl p-3 text-center"><p className="opacity-80">Total</p><p className="font-bold">₹{Number(invoice.total_amount).toFixed(2)}</p></div>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={!!invoice.gst_enabled} onChange={async e=>{ try{ const r=await api.put(`/reports/${reportId}/invoice/gst`, {gst_enabled:e.target.checked}); setInvoice(r.data); }catch{}}} /> GST Enabled — toggle on/off, empty field again selectable</label>
          </div>
        )}

        <div className="flex gap-2">
          <button disabled={saving} onClick={save} className="px-5 py-2.5 rounded-xl bg-[#168B57] hover:bg-[#0B6B43] transition-colors text-white font-bold text-xs disabled:opacity-60">{saving?'Saving...':'Update Report'}</button>
          <button onClick={()=>setActiveTab('view-report')} className="px-5 py-2.5 rounded-xl bg-white border border-[#D1D5DB] font-bold text-xs">Cancel</button>
        </div>
      </div>
    </div>
  );
};
