import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';

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
      Object.entries(form).forEach(([k,v])=>fd.append(k, v));
      if (files.logo) fd.append('logo', files.logo);
      if (files.seal) fd.append('seal', files.seal);
      if (files.signature) fd.append('signature', files.signature);
      await api.post('/settings', fd, { headers:{ 'Content-Type':'multipart/form-data' }});
      addToast('Settings saved');
    } catch(err){ addToast(err.response?.data?.message||'Save failed','error'); } finally { setSaving(false); }
  };

  if (loading) return <div className="p-8 text-center text-xs text-[#6B7280]">Loading...</div>;

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-xl font-bold text-[#1F2937]">Lab Settings</h1>
      <form onSubmit={save} className="bg-white border border-[#D1D5DB] rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-xs font-bold">Lab Name</label>
          <input value={form.lab_name} onChange={e=>setForm({...form, lab_name:e.target.value})} className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
        </div>
        <div>
          <label className="text-xs font-bold">Tagline</label>
          <input value={form.tagline} onChange={e=>setForm({...form, tagline:e.target.value})} className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
        </div>
        <div>
          <label className="text-xs font-bold">Address</label>
          <textarea rows="2" value={form.address} onChange={e=>setForm({...form, address:e.target.value})} className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div><label className="text-xs font-bold">Phone</label><input value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" /></div>
          <div><label className="text-xs font-bold">Email</label><input type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" /></div>
          <div><label className="text-xs font-bold">Website</label><input value={form.website} onChange={e=>setForm({...form, website:e.target.value})} placeholder="https://krishianalyticallab.com" className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" /></div>
        </div>

        <div className="bg-[#EAF7F0] border border-[#D1EEE0] rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-bold text-[#0B6B43]">Invoice & GST Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="text-xs font-bold">Default GST %</label><input type="number" step="0.01" value={form.default_gst_percent} onChange={e=>setForm({...form, default_gst_percent:e.target.value})} className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" /></div>
            <div><label className="text-xs font-bold">Invoice Prefix</label><input value={form.invoice_prefix} onChange={e=>setForm({...form, invoice_prefix:e.target.value})} className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" /></div>
            <div><label className="text-xs font-bold">GSTIN</label><input value={form.gstin} onChange={e=>setForm({...form, gstin:e.target.value})} placeholder="33AAAFK8921B1Z2" className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs" /></div>
            <label className="flex items-center gap-2 text-xs font-bold mt-6"><input type="checkbox" checked={!!form.gst_enabled} onChange={e=>setForm({...form, gst_enabled:e.target.checked})} /> GST Enabled (on/off per invoice)</label>
          </div>
          <p className="text-[11px] text-[#6B7280]">When disabled, invoices will be generated without GST. You can also toggle per invoice in Reports.</p>
        </div>

        <div className="bg-[#F3F4F6] border border-[#D1D5DB] rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#1F2937]">Email / SMTP (used for enquiry & auto-reply mails)</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF7F0] text-[#168B57] border border-[#D1EEE0]">Configured</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><label className="text-xs font-bold">SMTP Host</label><input value={form.smtp_host} onChange={e=>setForm({...form, smtp_host:e.target.value})} placeholder="smtp.gmail.com" className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white" /></div>
            <div><label className="text-xs font-bold">Port</label><input type="number" value={form.smtp_port} onChange={e=>setForm({...form, smtp_port:e.target.value})} placeholder="587" className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white" /></div>
            <div><label className="text-xs font-bold">Encryption</label>
              <select value={form.smtp_encryption} onChange={e=>setForm({...form, smtp_encryption:e.target.value})} className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white">
                <option value="">— default (587=tls, 465=ssl) —</option>
                <option value="tls">TLS</option>
                <option value="ssl">SSL</option>
                <option value="none">None</option>
              </select>
            </div>
            <div><label className="text-xs font-bold">SMTP Username</label><input value={form.smtp_username} onChange={e=>setForm({...form, smtp_username:e.target.value})} autoComplete="off" placeholder="yourlab@gmail.com" className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white" /></div>
            <div><label className="text-xs font-bold">SMTP Password / App Password</label><input type="password" value={form.smtp_password} onChange={e=>setForm({...form, smtp_password:e.target.value})} placeholder="•••••••• (blank = keep saved)" autoComplete="new-password" className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white" /></div>
            <div><label className="text-xs font-bold">From Name</label><input value={form.mail_from_name} onChange={e=>setForm({...form, mail_from_name:e.target.value})} placeholder="defaults to Lab Name" className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white" /></div>
            <div className="sm:col-span-3"><label className="text-xs font-bold">From Email</label><input type="email" value={form.mail_from_address} onChange={e=>setForm({...form, mail_from_address:e.target.value})} placeholder="defaults to lab Email above" className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white" /></div>
          </div>
          
          {/* Test Email Section */}
          <div className="pt-3 border-t border-[#D1D5DB]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border">
            <div>
              <p className="text-xs font-bold text-[#1F2937]">Send Test Email</p>
              <p className="text-[11px] text-[#6B7280]">Verify your SMTP connection by sending a real test email.</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input 
                type="email" 
                value={testEmail} 
                onChange={e=>setTestEmail(e.target.value)} 
                placeholder="recipient@gmail.com" 
                className="px-3 py-1.5 border border-[#D1D5DB] rounded-xl text-xs flex-1 sm:w-64"
              />
              <button 
                type="button" 
                onClick={sendTestMail} 
                disabled={sendingTest} 
                className="px-4 py-1.5 rounded-xl bg-[#0B6B43] hover:bg-[#168B57] text-white text-xs font-bold transition-all disabled:opacity-50 whitespace-nowrap shadow-sm"
              >
                {sendingTest ? 'Sending...' : 'Send Test Mail'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {['logo','seal','signature'].map(key=>(
            <div key={key} className="border border-[#D1D5DB] rounded-xl p-3 text-center space-y-2">
              <p className="text-xs font-bold capitalize">{key}</p>
              {preview[key] ? <img src={preview[key]} alt={key} className="h-16 w-auto mx-auto border border-[#D1D5DB] rounded bg-white p-1" /> : <div className="h-16 flex items-center justify-center text-[11px] text-[#6B7280]">No file</div>}
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>onFile(key, e)} className="w-full text-xs" />
            </div>
          ))}
        </div>

        <button disabled={saving} className="px-6 py-2.5 rounded-xl bg-[#168B57] hover:bg-[#0B6B43] transition-colors text-white font-bold text-xs disabled:opacity-60">{saving?'Saving...':'Save Settings'}</button>
      </form>
    </div>
  );
};
