import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';

export const Settings = () => {
  const { addToast } = useToast();
  const [form, setForm] = useState({ lab_name:'', tagline:'', address:'', phone:'', email:'', website:'', default_gst_percent:'18', gst_enabled:true, gstin:'', invoice_prefix:'KAL-INV-' });
  const [files, setFiles] = useState({ logo:null, seal:null, signature:null });
  const [preview, setPreview] = useState({ logo:'', seal:'', signature:'' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const apiOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');

  useEffect(()=>{
    api.get('/settings').then(r=>{
      setForm({ lab_name:r.data.lab_name||'', tagline:r.data.tagline||'', address:r.data.address||'', phone:r.data.phone||'', email:r.data.email||'', website:r.data.website||'', default_gst_percent: r.data.default_gst_percent ?? '18', gst_enabled: r.data.gst_enabled ?? true, gstin: r.data.gstin || '', invoice_prefix: r.data.invoice_prefix || 'KAL-INV-' });
      setPreview({ logo: r.data.logo_path ? `${apiOrigin}/${r.data.logo_path.replace(/^\//,'')}` : '/krishi-logo.png', seal: r.data.seal_path ? `${apiOrigin}/${r.data.seal_path.replace(/^\//,'')}` : '', signature: r.data.signature_path ? `${apiOrigin}/${r.data.signature_path.replace(/^\//,'')}` : '' });
    }).finally(()=>setLoading(false));
  }, []);

  const onFile = (key, e) => {
    const f = e.target.files[0];
    if (f) { setFiles(prev=>({...prev, [key]:f})); setPreview(prev=>({...prev, [key]: URL.createObjectURL(f)})); }
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
