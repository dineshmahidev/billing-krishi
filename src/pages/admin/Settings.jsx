import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { Building2, Receipt, Mail, Send, ShieldCheck, Image as ImageIcon, Save, CheckCircle2 } from 'lucide-react';

export const Settings = () => {
  const { addToast } = useToast();
  const [form, setForm] = useState({ lab_name:'', tagline:'', address:'', phone:'', email:'', website:'', default_gst_percent:'18', gst_enabled:true, gstin:'', invoice_prefix:'KAL-INV-', smtp_host:'', smtp_port:'587', smtp_username:'', smtp_password:'', smtp_encryption:'', mail_from_address:'', mail_from_name:'' });
  const [files, setFiles] = useState({ logo:null, seal:null, signature:null });
  const [preview, setPreview] = useState({ logo:'', seal:'', signature:'' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  const apiOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');

  useEffect(()=>{
    api.get('/settings').then(r=>{
      setForm({ lab_name:r.data.lab_name||'', tagline:r.data.tagline||'', address:r.data.address||'', phone:r.data.phone||'', email:r.data.email||'', website:r.data.website||'', default_gst_percent: r.data.default_gst_percent ?? '18', gst_enabled: r.data.gst_enabled ?? true, gstin: r.data.gstin || '', invoice_prefix: r.data.invoice_prefix || 'KAL-INV-', smtp_host: r.data.smtp_host||'', smtp_port: r.data.smtp_port||'587', smtp_username: r.data.smtp_username||'', smtp_password:'', smtp_encryption: r.data.smtp_encryption||'', mail_from_address: r.data.mail_from_address||'', mail_from_name: r.data.mail_from_name||'' });
      setTestEmail(r.data.mail_from_address || r.data.email || '');
      setPreview({ logo: r.data.logo_path ? `${apiOrigin}/${r.data.logo_path.replace(/^\//,'')}` : '/krishi-logo.png', seal: r.data.seal_path ? `${apiOrigin}/${r.data.seal_path.replace(/^\//,'')}` : '', signature: r.data.signature_path ? `${apiOrigin}/${r.data.signature_path.replace(/^\//,'')}` : '' });
    }).finally(()=>setLoading(false));
  }, []);

  const onFile = (key, e) => {
    const f = e.target.files[0];
    if (f) { setFiles(prev=>({...prev, [key]:f})); setPreview(prev=>({...prev, [key]: URL.createObjectURL(f)})); }
  };

  const sendTestMail = async () => {
    if (!testEmail) {
      addToast('Please enter an email address to send test mail', 'error');
      return;
    }
    setSendingTest(true);
    try {
      const res = await api.post('/settings/test-mail', { email: testEmail });
      addToast(res.data?.message || 'Test email sent successfully!');
    } catch(err) {
      addToast(err.response?.data?.message || 'Failed to send test mail', 'error');
    } finally {
      setSendingTest(false);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v])=>{
        if (k === 'gst_enabled') {
          fd.append('gst_enabled', v ? '1' : '0');
        } else {
          fd.append(k, v ?? '');
        }
      });
      if (files.logo) fd.append('logo', files.logo);
      if (files.seal) fd.append('seal', files.seal);
      if (files.signature) fd.append('signature', files.signature);
      const res = await api.post('/settings', fd, { headers:{ 'Content-Type':'multipart/form-data' }});
      if (res.data) {
        setForm(prev => ({
          ...prev,
          ...res.data,
          gst_enabled: Boolean(res.data.gst_enabled),
          smtp_password: ''
        }));
      }
      addToast('Settings saved successfully');
    } catch(err){ addToast(err.response?.data?.message||'Save failed','error'); } finally { setSaving(false); }
  };

  if (loading) return <div className="p-8 text-center text-xs text-[#6B7280]">Loading...</div>;

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-xl font-bold text-[#1F2937]">Lab Settings</h1>
      <form onSubmit={save} className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-white/80 space-y-6">
        <div className="space-y-4">
          <h3 className="text-xs font-black text-[#0B6B43] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-gray-100">
            <Building2 className="w-4 h-4 text-[#168B57]" /> General Information
          </h3>
          <div>
            <label className="text-xs font-bold text-gray-700">Lab Name</label>
            <input value={form.lab_name} onChange={e=>setForm({...form, lab_name:e.target.value})} className="mt-1.5 w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700">Tagline</label>
            <input value={form.tagline} onChange={e=>setForm({...form, tagline:e.target.value})} className="mt-1.5 w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700">Address</label>
            <textarea rows="2" value={form.address} onChange={e=>setForm({...form, address:e.target.value})} className="mt-1.5 w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs resize-y" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div><label className="text-xs font-bold text-gray-700">Phone</label><input value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} className="mt-1.5 w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs" /></div>
            <div><label className="text-xs font-bold text-gray-700">Email</label><input type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} className="mt-1.5 w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs" /></div>
            <div><label className="text-xs font-bold text-gray-700">Website</label><input value={form.website} onChange={e=>setForm({...form, website:e.target.value})} placeholder="https://krishilab25.in" className="mt-1.5 w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs" /></div>
          </div>
        </div>

        <div className="bg-emerald-50/40 border border-emerald-100 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xs">
          <h3 className="text-xs font-black text-[#0B6B43] uppercase tracking-wider flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#168B57]" /> Invoice &amp; GST Settings
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div><label className="text-xs font-bold text-gray-700">Default GST %</label><input type="number" step="0.01" value={form.default_gst_percent} onChange={e=>setForm({...form, default_gst_percent:e.target.value})} className="mt-1.5 w-full px-3.5 py-2.5 bg-white border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] transition-all shadow-2xs" /></div>
            <div><label className="text-xs font-bold text-gray-700">Invoice Prefix</label><input value={form.invoice_prefix} onChange={e=>setForm({...form, invoice_prefix:e.target.value})} className="mt-1.5 w-full px-3.5 py-2.5 bg-white border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] transition-all shadow-2xs" /></div>
            <div><label className="text-xs font-bold text-gray-700">GSTIN</label><input value={form.gstin} onChange={e=>setForm({...form, gstin:e.target.value})} placeholder="33AAAFK8921B1Z2" className="mt-1.5 w-full px-3.5 py-2.5 bg-white border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] transition-all shadow-2xs" /></div>
            <div className="flex items-center">
              <label className="flex items-center gap-2.5 text-xs font-bold text-gray-800 cursor-pointer select-none mt-4 sm:mt-6">
                <input type="checkbox" checked={!!form.gst_enabled} onChange={e=>setForm({...form, gst_enabled:e.target.checked})} className="w-4 h-4 rounded text-[#168B57] focus:ring-[#168B57] accent-[#168B57]" />
                GST Enabled (on/off per invoice)
              </label>
            </div>
          </div>
          <p className="text-[11px] text-gray-500 font-medium">When disabled, invoices will be generated without GST. You can also toggle per invoice in Reports.</p>
        </div>

        <div className="bg-gray-50/70 border border-gray-200/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200/70">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#168B57]" /> Email / SMTP (enquiry &amp; auto-reply)
            </h3>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100/70 text-[#0B6B43] border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#168B57]" /> Configured
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div><label className="text-xs font-bold text-gray-700">SMTP Host</label><input value={form.smtp_host} onChange={e=>setForm({...form, smtp_host:e.target.value})} placeholder="smtp.gmail.com" className="mt-1.5 w-full px-3.5 py-2.5 bg-white border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] transition-all shadow-2xs" /></div>
            <div><label className="text-xs font-bold text-gray-700">Port</label><input type="number" value={form.smtp_port} onChange={e=>setForm({...form, smtp_port:e.target.value})} placeholder="587" className="mt-1.5 w-full px-3.5 py-2.5 bg-white border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] transition-all shadow-2xs" /></div>
            <div><label className="text-xs font-bold text-gray-700">Encryption</label>
              <select value={form.smtp_encryption} onChange={e=>setForm({...form, smtp_encryption:e.target.value})} className="mt-1.5 w-full px-3.5 py-2.5 bg-white border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] transition-all shadow-2xs cursor-pointer">
                <option value="">— default (587=tls, 465=ssl) —</option>
                <option value="tls">TLS</option>
                <option value="ssl">SSL</option>
                <option value="none">None</option>
              </select>
            </div>
            <div><label className="text-xs font-bold text-gray-700">SMTP Username</label><input value={form.smtp_username} onChange={e=>setForm({...form, smtp_username:e.target.value})} autoComplete="off" placeholder="yourlab@gmail.com" className="mt-1.5 w-full px-3.5 py-2.5 bg-white border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] transition-all shadow-2xs" /></div>
            <div><label className="text-xs font-bold text-gray-700">SMTP Password</label><input type="password" value={form.smtp_password} onChange={e=>setForm({...form, smtp_password:e.target.value})} placeholder="•••••••• (blank = keep saved)" autoComplete="new-password" className="mt-1.5 w-full px-3.5 py-2.5 bg-white border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] transition-all shadow-2xs" /></div>
            <div><label className="text-xs font-bold text-gray-700">From Name</label><input value={form.mail_from_name} onChange={e=>setForm({...form, mail_from_name:e.target.value})} placeholder="defaults to Lab Name" className="mt-1.5 w-full px-3.5 py-2.5 bg-white border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] transition-all shadow-2xs" /></div>
            <div className="sm:col-span-3"><label className="text-xs font-bold text-gray-700">From Email</label><input type="email" value={form.mail_from_address} onChange={e=>setForm({...form, mail_from_address:e.target.value})} placeholder="defaults to lab Email above" className="mt-1.5 w-full px-3.5 py-2.5 bg-white border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] transition-all shadow-2xs" /></div>
          </div>
          
          {/* Test Email Section */}
          <div className="pt-3 border-t border-gray-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
            <div>
              <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-[#168B57]" /> Send Test Email
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">Verify your SMTP connection by sending a real test email.</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input 
                type="email" 
                value={testEmail} 
                onChange={e=>setTestEmail(e.target.value)} 
                placeholder="recipient@gmail.com" 
                className="px-3.5 py-2 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] flex-1 sm:w-64"
              />
              <button 
                type="button" 
                onClick={sendTestMail} 
                disabled={sendingTest} 
                className="px-5 py-2 rounded-2xl bg-[#0B6B43] hover:bg-[#168B57] text-white text-xs font-bold transition-all disabled:opacity-50 whitespace-nowrap shadow-sm hover:scale-[1.01] active:scale-[0.99]"
              >
                {sendingTest ? 'Sending...' : 'Send Test Mail'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {['logo','seal','signature'].map(key=>(
            <div key={key} className="border border-gray-200/80 rounded-3xl p-4 text-center space-y-3 bg-gray-50/40 hover:bg-gray-50/80 transition-colors shadow-2xs">
              <p className="text-xs font-bold capitalize text-gray-800">{key}</p>
              {preview[key] ? (
                <img src={preview[key]} alt={key} className="h-16 w-auto mx-auto border border-gray-200 rounded-xl bg-white p-1.5 shadow-2xs" />
              ) : (
                <div className="h-16 flex items-center justify-center text-[11px] text-gray-400 font-medium">No file</div>
              )}
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>onFile(key, e)} className="w-full text-xs text-gray-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-[#0B6B43] hover:file:bg-emerald-100" />
            </div>
          ))}
        </div>

        <div className="pt-2">
          <button disabled={saving} className="px-7 py-3 rounded-2xl bg-gradient-to-r from-[#168B57] to-[#0B6B43] hover:from-[#0B6B43] hover:to-[#168B57] transition-all text-white font-bold text-xs shadow-[0_4px_14px_rgba(22,139,87,0.25)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 flex items-center gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
