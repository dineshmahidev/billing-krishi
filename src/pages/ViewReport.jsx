import React, { useEffect, useState } from 'react';
import api, { openPdf } from '../services/api';
import { Printer, FileText, Pencil, ArrowLeft } from 'lucide-react';

export const ViewReport = ({ reportId, setActiveTab, setSelectedReportId }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    if (!reportId) return;
    setLoading(true);
    api.get(`/reports/${reportId}`).then(r=>setReport(r.data)).finally(()=>setLoading(false));
  }, [reportId]);

  if (!reportId) return <div className="p-8 text-center text-xs text-[#6B7280]">No report selected</div>;
  if (loading) return <div className="p-8 text-center text-xs text-[#6B7280]">Loading...</div>;
  if (!report) return <div className="p-8 text-center text-xs text-red-600">Report not found</div>;

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-2 no-print">
        <button onClick={()=>setActiveTab('reports')} className="px-3 py-2 rounded-xl bg-white border border-[#D1D5DB] text-xs font-bold flex items-center gap-1"><ArrowLeft className="w-4 h-4"/> Back to Reports</button>
        <div className="flex gap-1 ml-auto">
          <button onClick={()=>{setSelectedReportId(report.id); setActiveTab('edit-report');}} className="px-3 py-2 rounded-xl bg-white border border-[#D1D5DB] text-xs font-bold flex items-center gap-1"><Pencil className="w-4 h-4"/> Edit</button>
          <button onClick={()=>openPdf(report.id)} className="px-3 py-2 rounded-xl bg-[#168B57] text-white font-bold text-xs flex items-center gap-1"><FileText className="w-4 h-4"/> PDF</button>
          <button onClick={()=>openPdf(report.id)} className="px-3 py-2 rounded-xl bg-[#0B6B43] text-white font-bold text-xs flex items-center gap-1"><Printer className="w-4 h-4"/> Print</button>
        </div>
      </div>

      <div className="bg-white border border-[#D1D5DB] rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="text-center border-b-2 border-[#0B6B43] pb-4">
          <img src="/logo-krishi.png" alt="logo" className="h-12 mx-auto" />
          <p className="text-[11px] text-[#6B7280] mt-2">182-B, Reliance Trends Near, Tiruppur Road, Kangeyam - 638701 &bull; Ph: +91 63793 12357 &bull; info@krishianalyticallab.com</p>
          <div className="mt-2 inline-block px-4 py-1 bg-[#0B6B43] text-white text-xs font-bold tracking-widest uppercase">{report.report_type?.title || 'REPORT'}</div>
          <p className="text-xs font-mono font-bold mt-1">{report.report_no}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs border border-[#D1D5DB] rounded-xl p-4 bg-[#EAF7F0]/30">
          <div className="space-y-1">
            <p><span className="font-bold text-[#6B7280]">Report No:</span> <span className="font-mono font-bold">{report.report_no}</span></p>
            <p><span className="font-bold text-[#6B7280]">Type:</span> {report.report_type?.name}</p>
            <p><span className="font-bold text-[#6B7280]">Sample Date:</span> {report.sample_date ? report.sample_date.split('T')[0] : '-'}</p>
            <p><span className="font-bold text-[#6B7280]">COA Date:</span> {report.coa_date ? report.coa_date.split('T')[0] : '-'}</p>
            {report.nature_of_sample && <p><span className="font-bold text-[#6B7280]">Nature:</span> {report.nature_of_sample}</p>}
          </div>
          <div className="space-y-1">
            <p><span className="font-bold text-[#6B7280]">Party:</span> {report.party_name || '-'}</p>
            <p><span className="font-bold text-[#6B7280]">Customer:</span> {report.customer_name || '-'}</p>
            <p><span className="font-bold text-[#6B7280]">Sample:</span> {report.sample_name || '-'}</p>
            <p><span className="font-bold text-[#6B7280]">Vehicle/Bill:</span> {report.vehicle_no || '-'} / {report.bill_no || '-'}</p>
            <p><span className="font-bold text-[#6B7280]">Bags/Buyer/Seller:</span> {report.bags_tons || '-'} / {report.buyer || '-'} / {report.seller || '-'}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-[#D1D5DB]">
            <thead><tr className="bg-[#168B57] text-white text-[11px] uppercase font-bold"><th className="py-2 px-3 w-10 text-center">S.No</th><th className="py-2 px-3">Parameter</th><th className="py-2 px-3 w-28 text-center">Result</th><th className="py-2 px-3">Specification</th></tr></thead>
            <tbody className="divide-y divide-[#D1D5DB]/60">
              {report.results?.map((r,i)=>(
                <tr key={r.id} className="even:bg-[#F9FAFB]">
                  <td className="py-2 px-3 text-center">{i+1}</td>
                  <td className="py-2 px-3 font-bold">{r.parameter?.name}</td>
                  <td className="py-2 px-3 text-center font-bold">{r.result}</td>
                  <td className="py-2 px-3">{r.specification}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {report.remarks && <div className="p-3 bg-[#EAF7F0] border border-[#D1D5DB] rounded-xl text-xs"><strong>Remarks:</strong> {report.remarks}</div>}

        <div className="text-[11px] text-[#6B7280] pt-4 border-t border-[#D1D5DB] flex justify-between">
          <span>Created by {report.creator?.name} on {report.created_at?.split('T')[0]}</span>
          <span>Status: {report.status}</span>
        </div>
      </div>
    </div>
  );
};
