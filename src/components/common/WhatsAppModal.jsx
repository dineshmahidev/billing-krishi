import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Check, Smartphone, FileText, Copy, Globe, Sparkles } from 'lucide-react';

export const WhatsAppModal = ({
  isOpen,
  onClose,
  phone = '',
  recipientName = '',
  docTitle = 'Document',
  summaryLines = [],
  pdfUrl = '',
}) => {
  const [targetPhone, setTargetPhone] = useState('');
  const [mode, setMode] = useState('pdf_only'); // 'pdf_only' | 'detailed'
  const [customText, setCustomText] = useState('');
  const [copiedText, setCopiedText] = useState(false);
  const [copiedPdf, setCopiedPdf] = useState(false);
  const [isSharingFile, setIsSharingFile] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cleanPhone = String(phone || '').replace(/[^0-9]/g, '');
      setTargetPhone(cleanPhone.length >= 10 ? cleanPhone.slice(-10) : '9361229641');
      setMode('pdf_only');
      setCustomText('');
      setCopiedText(false);
      setCopiedPdf(false);
    }
  }, [isOpen, phone, recipientName, docTitle, pdfUrl]);

  if (!isOpen) return null;

  // Build the complete WhatsApp message text
  const buildFullMessage = () => {
    try {
      if (customText.trim()) {
        return customText.trim();
      }

      const titleStr = String(docTitle || 'TEST REPORT').toUpperCase();
      const partyStr = recipientName ? ` - ${recipientName}` : '';

      if (mode === 'pdf_only') {
        // Direct PDF Only - clean and fast
        return `📄 *${titleStr}*${partyStr}\n🔗 *Direct PDF Link:*\n${pdfUrl || ''}`;
      }

      // Detailed mode
      const lines = [];
      lines.push(`Dear ${recipientName || 'Sir/Madam'}, Greetings from Krishi Analytical Laboratory!`);
      lines.push('');
      lines.push(`📄 *${titleStr}*`);
      lines.push('----------------------------------------');

      if (Array.isArray(summaryLines) && summaryLines.length > 0) {
        summaryLines.forEach(l => {
          if (l && typeof l === 'string') lines.push(l);
        });
        lines.push('----------------------------------------');
      }

      if (pdfUrl && typeof pdfUrl === 'string') {
        lines.push('🔗 *Direct PDF Link:*');
        lines.push(pdfUrl);
        lines.push('----------------------------------------');
      }

      lines.push('*Krishi Analytical Laboratory*');
      lines.push('Kangeyam - 638701 | Ph: +91 63793 12357');

      return lines.join('\n');
    } catch (e) {
      return `${docTitle}\n${pdfUrl || ''}`;
    }
  };

  const getCleanPhone = () => {
    let clean = String(targetPhone || '').replace(/[^0-9]/g, '');
    if (!clean) {
      const promptPhone = window.prompt('Please enter the 10-digit WhatsApp number:', '9361229641');
      if (!promptPhone) return null;
      clean = promptPhone.replace(/[^0-9]/g, '');
    }
    if (clean.length === 10) clean = '91' + clean;
    return clean;
  };

  const sendWhatsAppApi = () => {
    const clean = getCleanPhone();
    if (!clean) return;
    const message = buildFullMessage();
    const url = `https://api.whatsapp.com/send?phone=${clean}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const sendWhatsAppWeb = () => {
    const clean = getCleanPhone();
    if (!clean) return;
    const message = buildFullMessage();
    const url = `https://web.whatsapp.com/send?phone=${clean}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const copyMessageToClipboard = async () => {
    try {
      const text = buildFullMessage();
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const copyPdfLinkToClipboard = async () => {
    if (!pdfUrl) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(pdfUrl);
      } else {
        const ta = document.createElement('textarea');
        ta.value = pdfUrl;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedPdf(true);
      setTimeout(() => setCopiedPdf(false), 2500);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const canShareFiles = typeof navigator !== 'undefined' && !!navigator.canShare;

  const handleNativeShare = async () => {
    if (!pdfUrl) return;
    try {
      setIsSharingFile(true);
      const res = await fetch(pdfUrl);
      const blob = await res.blob();
      const filename = `${String(docTitle || 'document').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
      const file = new File([blob], filename, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: docTitle,
          text: buildFullMessage(),
          files: [file]
        });
        onClose();
      } else {
        sendWhatsAppApi();
      }
    } catch (err) {
      console.warn('Native share error or cancelled:', err);
      sendWhatsAppApi();
    } finally {
      setIsSharingFile(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl border border-[#D1D5DB] w-full max-w-lg overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.3)] flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#1F2937] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#25D366] flex items-center justify-center text-white shadow-sm">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Share via WhatsApp</h3>
              <p className="text-[11px] text-white/70">Send direct PDF link to client or test mobile</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs flex-1">
          
          {/* Party & Phone Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px] font-bold text-[#374151]">
              <span className="flex items-center gap-1"><Smartphone className="w-3.5 h-3.5 text-[#168B57]"/> WhatsApp Mobile Number:</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setTargetPhone('9361229641')}
                  className="px-2 py-0.5 rounded-md bg-[#EAF7F0] text-[#0B6B43] hover:bg-[#D1EEE0] text-[10px] font-bold"
                  title="Click to set test number 9361229641"
                >
                  Test: 9361229641
                </button>
                {phone && String(phone).trim() !== '9361229641' && (
                  <button
                    type="button"
                    onClick={() => setTargetPhone(String(phone).replace(/[^0-9]/g, ''))}
                    className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 text-[10px] font-bold"
                  >
                    Party: {phone}
                  </button>
                )}
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#6B7280] font-mono text-xs">+91</span>
              <input
                type="tel"
                value={targetPhone}
                onChange={e => setTargetPhone(e.target.value)}
                placeholder="Enter 10-digit mobile number"
                className="w-full pl-12 pr-3 py-2 border border-[#D1D5DB] rounded-xl text-xs font-mono font-bold focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] outline-none"
              />
            </div>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center justify-between bg-[#F9FAFB] p-2.5 rounded-xl border border-[#E5E7EB]">
            <span className="text-[11px] font-bold text-[#374151]">Message Type:</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => { setMode('pdf_only'); setCustomText(''); }}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 ${
                  mode === 'pdf_only'
                    ? 'bg-[#168B57] text-white shadow-sm'
                    : 'bg-white border border-[#D1D5DB] text-[#4B5563] hover:bg-gray-100'
                }`}
              >
                <FileText className="w-3 h-3"/> Direct PDF Only
              </button>
              <button
                type="button"
                onClick={() => { setMode('detailed'); setCustomText(''); }}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 ${
                  mode === 'detailed'
                    ? 'bg-[#168B57] text-white shadow-sm'
                    : 'bg-white border border-[#D1D5DB] text-[#4B5563] hover:bg-gray-100'
                }`}
              >
                <Sparkles className="w-3 h-3"/> Full Summary
              </button>
            </div>
          </div>

          {/* Live Message Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide">WhatsApp Message Preview:</span>
              <div className="flex items-center gap-2">
                {pdfUrl && (
                  <button
                    type="button"
                    onClick={copyPdfLinkToClipboard}
                    className="text-[10.5px] text-[#0B6B43] font-bold hover:underline flex items-center gap-1"
                  >
                    {copiedPdf ? <Check className="w-3 h-3 text-emerald-600"/> : <Copy className="w-3 h-3"/>}
                    {copiedPdf ? 'PDF Link Copied' : 'Copy PDF Link'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={copyMessageToClipboard}
                  className="text-[10.5px] text-[#168B57] font-bold hover:underline flex items-center gap-1"
                >
                  {copiedText ? <Check className="w-3 h-3 text-emerald-600"/> : <Copy className="w-3 h-3"/>}
                  {copiedText ? 'Message Copied!' : 'Copy Text'}
                </button>
              </div>
            </div>

            <div className="bg-[#ECE5DD]/40 border border-[#D1D5DB] rounded-xl p-3.5 font-sans text-xs text-[#1F2937] whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto shadow-inner">
              {buildFullMessage()}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F9FAFB] border-t border-[#D1D5DB] flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl border border-[#D1D5DB] hover:bg-gray-100 font-bold text-xs text-[#4B5563] transition-colors"
          >
            Cancel
          </button>
          
          <div className="flex flex-wrap items-center gap-2">
            {canShareFiles && pdfUrl && (
              <button
                type="button"
                onClick={handleNativeShare}
                disabled={isSharingFile}
                className="px-3 py-2 rounded-xl bg-[#0B6B43] hover:bg-[#084D30] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                title="Directly attach and share PDF file via native device share"
              >
                <FileText className="w-3.5 h-3.5" />
                {isSharingFile ? 'Preparing...' : 'Direct PDF File'}
              </button>
            )}

            <button
              type="button"
              onClick={sendWhatsAppWeb}
              className="px-3.5 py-2 rounded-xl bg-[#1F2937] hover:bg-[#111827] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              title="Open directly in WhatsApp Web browser tab"
            >
              <Globe className="w-3.5 h-3.5 text-[#25D366]" /> WhatsApp Web
            </button>

            <button
              type="button"
              onClick={sendWhatsAppApi}
              className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_4px_14px_rgba(37,211,102,0.35)] transition-all hover:scale-[1.02]"
            >
              <Send className="w-3.5 h-3.5" /> Send WhatsApp
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WhatsAppModal;

