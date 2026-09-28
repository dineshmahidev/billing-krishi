import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Bookmark, Check, Smartphone, FileText } from 'lucide-react';

const PRESET_GREETINGS = [
  { id: 'formal', label: 'Formal (English)', get: (name) => `Dear ${name || 'Sir/Madam'}, Greetings from Krishi Analytical Laboratory!` },
  { id: 'friendly', label: 'Brief & Crisp', get: (name) => `Hello ${name || 'Sir/Madam'}, here is your document from Krishi Analytical Laboratory.` },
  { id: 'tamil', label: 'Tamil / தமிழ்', get: (name) => `வணக்கம் ${name || ''}! Krishi Analytical Lab-ல் இருந்து உங்கள் அறிக்கை / பில் விவரங்கள் கீழே தரப்பட்டுள்ளது.` },
  { id: 'custom', label: 'Custom...', get: () => '' }
];

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
  const [greetingPreset, setGreetingPreset] = useState('formal');
  const [greetingText, setGreetingText] = useState('');
  const [customSaved, setCustomSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTargetPhone(phone && phone.trim() ? phone.trim() : '9361229641');
      const savedCustom = localStorage.getItem('krishi_wa_custom_greeting');
      if (savedCustom) {
        setGreetingPreset('custom');
        setGreetingText(savedCustom.replace('{name}', recipientName || 'Sir/Madam'));
      } else {
        setGreetingPreset('formal');
        setGreetingText(PRESET_GREETINGS[0].get(recipientName));
      }
      setCustomSaved(false);
    }
  }, [isOpen, phone, recipientName]);

  if (!isOpen) return null;

  const handlePresetChange = (presetId) => {
    setGreetingPreset(presetId);
    if (presetId === 'custom') {
      const saved = localStorage.getItem('krishi_wa_custom_greeting');
      setGreetingText(saved ? saved.replace('{name}', recipientName || 'Sir/Madam') : `Dear ${recipientName || 'Sir/Madam'}, `);
    } else {
      const found = PRESET_GREETINGS.find(p => p.id === presetId);
      if (found) setGreetingText(found.get(recipientName));
    }
  };

  const saveAsDefault = () => {
    localStorage.setItem('krishi_wa_custom_greeting', greetingText);
    setCustomSaved(true);
    setTimeout(() => setCustomSaved(false), 3000);
  };

  // Build the complete WhatsApp message text
  const buildFullMessage = () => {
    const lines = [];
    if (greetingText.trim()) {
      lines.push(greetingText.trim());
      lines.push('');
    }

    lines.push(`📄 *${docTitle.toUpperCase()}*`);
    lines.push('----------------------------------------');

    if (summaryLines && summaryLines.length > 0) {
      summaryLines.forEach(l => {
        if (l) lines.push(l);
      });
      lines.push('----------------------------------------');
    }

    if (pdfUrl) {
      lines.push('🔗 *Direct PDF Download / View Link:*');
      lines.push(pdfUrl);
      lines.push('----------------------------------------');
    }

    lines.push('*Krishi Analytical Laboratory*');
    lines.push('182-B, Tiruppur Road, Kangeyam - 638701');
    lines.push('Ph: +91 63793 12357, +91 88838 64756');

    return lines.join('\n');
  };

  const [isSharingFile, setIsSharingFile] = useState(false);
  const canShareFiles = typeof navigator !== 'undefined' && !!navigator.canShare;

  const handleNativeShare = async () => {
    if (!pdfUrl) return;
    try {
      setIsSharingFile(true);
      const res = await fetch(pdfUrl);
      const blob = await res.blob();
      const filename = `${docTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
      const file = new File([blob], filename, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: docTitle,
          text: buildFullMessage(),
          files: [file]
        });
        onClose();
      } else {
        // Fallback to wa.me URL
        handleSend();
      }
    } catch (err) {
      console.warn('Native share error or cancelled:', err);
      // If user cancelled or not supported, fallback to WhatsApp web link
      handleSend();
    } finally {
      setIsSharingFile(false);
    }
  };

  const handleSend = () => {
    let clean = (targetPhone || '').replace(/[^0-9]/g, '');
    if (!clean) {
      const promptPhone = window.prompt('Please enter the 10-digit WhatsApp number:', '9361229641');
      if (!promptPhone) return;
      clean = promptPhone.replace(/[^0-9]/g, '');
    }
    if (clean.length === 10) clean = '91' + clean;

    const message = buildFullMessage();
    const waUrl = `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    onClose();
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
              <p className="text-[11px] text-white/70">Send to client or test directly on your mobile</p>
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
                {phone && phone !== '9361229641' && (
                  <button
                    type="button"
                    onClick={() => setTargetPhone(phone)}
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

          {/* Greeting Customization */}
          <div className="space-y-1.5 bg-[#F9FAFB] p-3 rounded-xl border border-[#E5E7EB]">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-[#374151]">Customize Greeting Line:</label>
              <button
                type="button"
                onClick={saveAsDefault}
                className="text-[10.5px] font-bold text-[#168B57] hover:text-[#0B6B43] flex items-center gap-1"
                title="Save this text as default for future messages"
              >
                {customSaved ? <><Check className="w-3 h-3 text-emerald-600"/> Saved!</> : <><Bookmark className="w-3 h-3"/> Save as Default</>}
              </button>
            </div>

            {/* Greeting Presets */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {PRESET_GREETINGS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePresetChange(p.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                    greetingPreset === p.id
                      ? 'bg-[#168B57] text-white'
                      : 'bg-white border border-[#D1D5DB] text-[#4B5563] hover:bg-gray-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Editable Greeting text */}
            <textarea
              rows={2}
              value={greetingText}
              onChange={e => setGreetingText(e.target.value)}
              placeholder="Type your greeting message here..."
              className="w-full p-2.5 bg-white border border-[#D1D5DB] rounded-lg text-xs text-[#1F2937] focus:border-[#25D366] outline-none resize-none mt-1"
            />
          </div>

          {/* Live Message Preview */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide">WhatsApp Message Preview:</span>
            <div className="bg-[#ECE5DD]/40 border border-[#D1D5DB] rounded-xl p-3 font-sans text-xs text-[#1F2937] whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto shadow-inner">
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
          <div className="flex items-center gap-2">
            {canShareFiles && pdfUrl && (
              <button
                type="button"
                onClick={handleNativeShare}
                disabled={isSharingFile}
                className="px-3.5 py-2.5 rounded-xl bg-[#0B6B43] hover:bg-[#084D30] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                title="Directly attach and share PDF file via native device share"
              >
                <FileText className="w-3.5 h-3.5" />
                {isSharingFile ? 'Preparing...' : 'Direct PDF Share'}
              </button>
            )}
            <button
              type="button"
              onClick={handleSend}
              className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center gap-2 shadow-[0_4px_14px_rgba(37,211,102,0.35)] transition-all hover:scale-[1.02]"
            >
              <Send className="w-3.5 h-3.5" /> Send on WhatsApp
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WhatsAppModal;
