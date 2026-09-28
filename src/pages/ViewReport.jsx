import React, { useEffect, useState } from 'react';
import api, { openPdf, downloadPdf, openWord, downloadWord, openInvoiceWord, downloadInvoiceWord, printReport } from '../services/api';
import { Printer, FileText, Pencil, ArrowLeft, FileDown, FileType, MessageCircle } from 'lucide-react';
import { useToast } from '../components/common/Toast';
import { WhatsAppModal } from '../components/common/WhatsAppModal';

export const ViewReport = ({ reportId, setActiveTab, setSelectedReportId }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);
  const [waModal, setWaModal] = useState({ isOpen: false, phone: '', recipientName: '', docTitle: '', summaryLines: [], pdfUrl: '' });
  const { addToast } = useToast();

  useEffect(()=>{
    if (!reportId) return;
    setLoading(true);
    api.get(`/reports/${reportId}`).then(r=>setReport(r.data)).catch(()=> addToast('Failed to load report','error')).finally(()=>setLoading(false));
    api.get(`/reports/${reportId}/invoice`).then(r=>setInvoice(r.data)).catch(()=> setInvoice(null));
  }, [reportId]);

  const handleReportWhatsapp = () => {
    if (!report) return;
    const partyName = report.party_name || report.customer_name || 'Customer';
    const phone = report.customer?.phone || '';
    const repNo = report.report_no || '-';
    const repType = report.report_type?.name || 'Report';
    const sample = report.sample_name || '-';
    const date = report.sample_date ? report.sample_date.split('T')[0] : (report.created_at?.split('T')[0] || '-');
    const veh = report.vehicle_no || '-';
    const token = localStorage.getItem('auth_token');
    const base = window.location.origin + '/api';
    const pdfUrl = `${base}/reports/${report.id}/pdf${token ? `?token=${token}` : ''}`;

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

  const handleInvoiceWhatsapp = () => {
    if (!invoice || !report) return;
    const partyName = invoice.party_name || invoice.customer_name || report.party_name || 'Customer';
    const phone = invoice.customer_phone || report.customer?.phone || '';
    const invNo = invoice.invoice_no;
    const repNo = report.report_no || '-';
    const invDate = invoice.created_at?.split('T')[0] || new Date().toISOString().split('T')[0];
    const subtotal = Number(invoice.subtotal || 0).toFixed(2);
    const total = Number(invoice.total_amount || 0).toFixed(2);
    const gst = invoice.gst_enabled ? `₹${Number(invoice.gst_amount||0).toFixed(2)} (${invoice.gst_percent}%)` : '—';
    const status = (invoice.status || 'unpaid').toUpperCase();
    const token = localStorage.getItem('auth_token');
    const base = window.location.origin + '/api';
    const pdfUrl = `${base}/reports/${report.id}/invoice/pdf${token ? `?token=${token}` : ''}`;

    setWaModal({
      isOpen: true,
      phone,
      recipientName: partyName,
      docTitle: `INVOICE: ${invNo}`,
      summaryLines: [
        `*Customer:* ${partyName}`,
        `*Report No:* ${repNo}`,
        `*Invoice Date:* ${invDate}`,
        `*Subtotal:* ₹${subtotal}`,
        `*GST:* ${gst}`,
        `*Total Amount:* ₹${total}`,
        `*Status:* ${status}`,
      ],
      pdfUrl,
    });
  };

  const handlePdf = () => { try { openPdf(report.id); } catch { addToast('PDF opening failed','error'); } };
  const handlePrint = () => { try { printReport(report.id); } catch { addToast('Print failed','error'); } };
  const handleWord = () => { try { openWord(report.id); } catch { addToast('Word open failed','error'); } };
  const handleWordDownload = () => { try { downloadWord(report.id, `${report.report_type?.name || 'REPORT'} (${report.report_no}).doc`); addToast('Word downloading'); } catch { addToast('Word download failed','error'); } };
  const handleInvoiceWord = () => { try { openInvoiceWord(report.id); addToast('Invoice Word opening'); } catch { addToast('Invoice Word failed','error'); } };
  const handleInvoiceWordDownload = () => { try { downloadInvoiceWord(report.id, `${invoice?.invoice_no || 'invoice'}.doc`); addToast('Invoice Word downloading'); } catch { addToast('Invoice Word download failed','error'); } };
  const handleInvoicePdf = () => {
    const token = localStorage.getItem('auth_token');
    const base = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    window.open(`${base}/reports/${report.id}/invoice/pdf${token ? `?token=${token}` : ''}`, '_blank');
  };
  const handleInvoiceDownload = () => {
    const token = localStorage.getItem('auth_token');
    const base = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const a = document.createElement('a');
    a.href = `${base}/reports/${report.id}/invoice/pdf/download${token ? `?token=${token}` : ''}`;
    a.download = `${invoice?.invoice_no || 'invoice'}.pdf`;
    document.body.appendChild(a); a.click(); a.remove();
  };
  const toggleGst = async () => {
    try {
      const res = await api.put(`/reports/${report.id}/invoice/gst`, { gst_enabled: !invoice.gst_enabled });
      setInvoice(res.data);
      addToast(`GST ${res.data.gst_enabled ? 'enabled' : 'disabled'}`);
    } catch { addToast('GST toggle failed','error'); }
  };

  if (!reportId) return <div className="p-8 text-center text-xs text-[#6B7280]">No report selected</div>;
  if (loading) return <div className="p-8 text-center text-xs text-[#6B7280]">Loading...</div>;
  if (!report) return <div className="p-8 text-center text-xs text-red-600">Report not found</div>;

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-2 no-print">
        <button onClick={()=>setActiveTab('reports')} className="px-3 py-2 rounded-xl bg-white border border-[#D1D5DB] text-xs font-bold flex items-center gap-1"><ArrowLeft className="w-4 h-4"/> Back to Reports</button>
        <div className="flex flex-wrap gap-1 ml-auto">
          <button onClick={()=>{setSelectedReportId(report.id); setActiveTab('edit-report');}} className="px-3 py-2 rounded-xl bg-white border border-[#D1D5DB] text-xs font-bold flex items-center gap-1 hover:bg-[#F9FAFB]"><Pencil className="w-4 h-4"/> Edit</button>
          <button onClick={handleReportWhatsapp} className="px-3 py-2 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center gap-1 hover:bg-[#1EBE5D] shadow-sm"><MessageCircle className="w-4 h-4"/> WhatsApp</button>
          <button onClick={handlePdf} className="px-3 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs flex items-center gap-1 hover:bg-amber-600 shadow-[0_4px_12px_rgba(245,158,11,0.3)]"><FileText className="w-4 h-4"/> Report PDF</button>
          <button onClick={handleWord} className="px-3 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs flex items-center gap-1 hover:bg-sky-700"><FileType className="w-4 h-4"/> Report Word</button>
          <button onClick={handleWordDownload} className="px-3 py-2 rounded-xl bg-white border border-sky-300 text-sky-700 font-bold text-xs flex items-center gap-1 hover:bg-sky-50"><FileDown className="w-4 h-4"/> Word ↓</button>
          <button onClick={handlePrint} className="px-3 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs flex items-center gap-1 hover:bg-amber-700"><Printer className="w-4 h-4"/> Print</button>
        </div>
      </div>

      <div className="bg-white border border-[#D1D5DB] rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="text-center border-b-2 border-[#0B6B43] pb-4">
          <div className="flex flex-col items-center justify-center">
            <img src="/krishi-transparent.png" alt="logo" className="h-12 mx-auto" />
            <span className="text-[11px] font-black text-[#0B6B43] tracking-[2.5px] mt-0.5">KLA</span>
          </div>
          <p className="text-[11px] text-[#6B7280] mt-2">182-B, Reliance Trends Near, Tiruppur Road, Kangeyam - 638701 &bull; Ph: +91 63793 12357 &bull; info@krishianalyticallab.com</p>
          <div className="mt-2 inline-block px-4 py-1 bg-[#0B6B43] text-white text-xs font-bold tracking-widest uppercase">{report.report_type?.title || 'REPORT'}</div>
          <p className="text-xs font-mono font-bold mt-1">{report.report_no}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border border-[#111827] rounded-xl p-4 bg-[#F9FAFB]">
          <div className="space-y-1.5">
            <p><span className="font-bold text-[#111827]">Report No:</span> <span className="font-mono font-bold text-[#0B6B43]">{report.report_no}</span></p>
            <p><span className="font-bold text-[#111827]">Report Type:</span> {report.report_type?.name}</p>
            <p><span className="font-bold text-[#111827]">Date:</span> {report.sample_date ? report.sample_date.split('T')[0] : (report.created_at?.split('T')[0] || '-')}</p>
            {report.bags_tons && <p><span className="font-bold text-[#111827]">{report.report_type?.quantity_label || 'Tons / Bags'}:</span> {report.bags_tons}</p>}
            {report.buyer && <p><span className="font-bold text-[#111827]">Buyer:</span> {report.buyer}</p>}
            {report.seller && <p><span className="font-bold text-[#111827]">Seller:</span> {report.seller}</p>}
          </div>
          <div className="space-y-1.5">
            <p><span className="font-bold text-[#111827]">Customer:</span> <strong className="text-[#111827]">{report.party_name || report.customer_name || '-'}</strong></p>
            {(report.address || report.customer?.address) && <p><span className="font-bold text-[#111827]">Address:</span> {report.address || report.customer?.address}</p>}
            <p><span className="font-bold text-[#111827]">Nature of Sample:</span> {report.nature_of_sample || report.sample_name || '-'}</p>
            {report.vehicle_no && <p><span className="font-bold text-[#111827]">Vehicle No:</span> {report.vehicle_no}</p>}
            {report.bill_no && <p><span className="font-bold text-[#111827]">Bill No:</span> {report.bill_no}</p>}
          </div>
        </div>

        <div className="border border-[#000000] py-1 text-center font-black text-xs tracking-widest text-[#000000] uppercase bg-white">
          TEST RESULTS
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-[#000000]">
            <thead><tr className="bg-white text-[#000000] text-[11px] uppercase font-black border-b border-[#000000]"><th className="py-2 px-3 w-10 text-center">S.No</th><th className="py-2 px-3">Parameter</th><th className="py-2 px-3 w-28 text-center">Result</th>{(report.report_type?.show_specification??true) && <th className="py-2 px-3">Specification</th>}{(report.report_type?.custom_columns||[]).map(c=> <th key={c} className="py-2 px-3">{c}</th>)}</tr></thead>
            <tbody className="divide-y divide-[#000000]/20">
              {(report.results||[]).filter(r=>r.enabled !== false).map((r,i)=>(
                <tr key={r.id} className="bg-white">
                  <td className="py-2 px-3 text-center font-bold">{i+1}</td>
                  <td className="py-2 px-3 font-bold text-[#000000]">{r.parameter?.name}</td>
                  <td className="py-2 px-3 text-center font-bold text-[#000000]">{r.result}{r.parameter?.unit === '%' && !String(r.result).includes('%') ? ' %' : ''}</td>
                  {(report.report_type?.show_specification??true) && <td className="py-2 px-3 text-[#000000]">{r.specification}</td>}
                  {(report.report_type?.custom_columns||[]).map(c=> <td key={c} className="py-2 px-3 text-[#000000]">{r.custom_values?.[c] || '—'}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {report.remarks && (
          <div className="border-l-4 border-[#0B6B43] bg-[#F9FAFB] p-3 rounded-r-xl text-xs">
            <strong className="text-[#0B6B43]">Remarks / Notes: </strong>
            <span className="font-semibold text-[#111827]">{report.remarks}</span>
          </div>
        )}

        <div className="text-center font-extrabold text-[11px] tracking-widest text-[#000000] py-1">*** END OF REPORT ***</div>

        <div className="flex justify-end pt-2 pb-2">
          <div className="text-center w-48 space-y-1">
            <p className="text-xs font-bold text-[#000000]">For KRISHI ANALYTICAL LAB</p>
            <div className="h-10 flex items-center justify-center text-xs text-[#6B7280] italic">Authorized Signatory</div>
            <p className="text-[11px] font-bold text-[#000000] border-t border-[#000000] pt-1">Authorized Signatory</p>
          </div>
        </div>

        <div className="border-t border-[#D1D5DB] pt-3 text-center space-y-1 text-[#6B7280] text-[10px]">
          <p className="font-semibold text-[#111827]">182-B, Reliance Trends Near, Tiruppur Road, Kangeyam - 638701 &bull; Ph: +91 63793 12357, +91 88838 64756 &bull; krishianalyticallab@gmail.com &bull; krishilab25.in</p>
          <p className="text-[9.5px]"><strong>Note:</strong> 1. The results relate only to the sample tested. &bull; 2. This report shall not be reproduced, except in full, without written approval of the laboratory. &bull; 3. Tested samples retained for 15 days from report date.</p>
        </div>

        {/* Separate Invoice - not in analysis report */}
        {invoice && (
          <div className="border-2 border-[#168B57]/30 rounded-2xl p-4 bg-gradient-to-br from-[#EAF7F0]/40 to-white space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0B6B43] flex items-center gap-2"><FileText className="w-4 h-4" /> Separate Invoice <span className="text-xs font-mono bg-white border border-[#D1D5DB] px-2 py-0.5 rounded">{invoice.invoice_no}</span></h3>
              <label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={!!invoice.gst_enabled} onChange={toggleGst} /> GST {invoice.gst_enabled ? 'ON' : 'OFF'} ({invoice.gst_percent}%)</label>
            </div>
            <div className={`grid gap-3 text-xs ${invoice.gst_enabled ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <div className="bg-white border border-[#D1D5DB] rounded-xl p-3 text-center"><p className="text-[#6B7280]">Subtotal</p><p className="font-bold text-sm">₹{Number(invoice.subtotal).toFixed(2)}</p></div>
              {invoice.gst_enabled && <div className="bg-white border border-[#D1D5DB] rounded-xl p-3 text-center"><p className="text-[#6B7280]">GST ({invoice.gst_percent}%)</p><p className="font-bold text-sm">₹{Number(invoice.gst_amount).toFixed(2)}</p></div>}
              <div className="bg-[#0B6B43] text-white rounded-xl p-3 text-center"><p className="opacity-80 text-xs">Total</p><p className="font-bold text-sm">₹{Number(invoice.total_amount).toFixed(2)}</p></div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleInvoicePdf} className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1 hover:bg-amber-600"><FileText className="w-4 h-4"/> Invoice PDF</button>
              <button onClick={handleInvoiceDownload} className="flex-1 py-2.5 rounded-xl bg-white border-2 border-[#168B57] text-[#0B6B43] font-bold text-xs flex items-center justify-center gap-1 hover:bg-[#EAF7F0]"><FileDown className="w-4 h-4"/> Invoice ↓</button>
            </div>
            <div className="flex gap-2">
              <button onClick={handleInvoiceWord} className="flex-1 py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-1 hover:bg-sky-700"><FileType className="w-4 h-4"/> Invoice Word</button>
              <button onClick={handleInvoiceWordDownload} className="flex-1 py-2.5 rounded-xl bg-white border-2 border-sky-400 text-sky-700 font-bold text-xs flex items-center justify-center gap-1 hover:bg-sky-50"><FileDown className="w-4 h-4"/> Word ↓</button>
            </div>
            <button onClick={handleInvoiceWhatsapp} className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"><MessageCircle className="w-4 h-4"/> Share Invoice on WhatsApp</button>
            <p className="text-[11px] text-[#6B7280] text-center">Invoice is separate from Analysis Report — PDF, Word &amp; WhatsApp sharing. Toggle GST on/off here.</p>
          </div>
        )}

        <div className="text-[11px] text-[#6B7280] pt-4 border-t border-[#D1D5DB] flex justify-between">
          <span>Created by {report.creator?.name} on {report.created_at?.split('T')[0]}</span>
          <span>Status: {report.status}</span>
        </div>
      </div>

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
