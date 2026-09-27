import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { Save, Image, Type } from 'lucide-react';

export const Cms = () => {
  const { addToast } = useToast();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroFile, setHeroFile] = useState(null);
  const [aboutFile, setAboutFile] = useState(null);

  useEffect(() => {
    api.get('/cms/landing').then(r => setForm(r.data)).catch(()=> addToast('Failed to load CMS','error')).finally(()=> setLoading(false));
  }, []);

  const update = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      ['hero_badge','hero_title','hero_desc','stat1_value','stat1_label','stat2_value','stat2_label','stat3_value','stat3_label','stat4_value','stat4_label','about_title','about_desc','contact_phone','contact_email','contact_address','contact_hours','map_embed_url'].forEach(k => {
        if (form[k] != null) fd.append(k, form[k]);
      });
      if (heroFile) fd.append('hero_image', heroFile);
      if (aboutFile) fd.append('about_image', aboutFile);
      const res = await api.post('/cms/landing', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(res.data);
      addToast('Landing CMS updated');
    } catch (err) {
      addToast(err.response?.data?.message || 'Save failed','error');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="p-6 text-xs">Loading CMS...</div>;
  if (!form) return <div className="p-6 text-xs text-red-600">No data</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-lg font-bold">Website CMS — Landing Page</h2>
        <p className="text-xs text-[#6B7280]">Admin only. Changes appear on <span className="font-bold">/</span> immediately.</p>
      </div>

      <form onSubmit={save} className="space-y-6 bg-white border border-[#D1D5DB] rounded-2xl p-6">
        {/* Hero */}
        <div className="space-y-3">
          <p className="text-xs font-bold flex items-center gap-2"><Type className="w-4 h-4 text-[#168B57]" /> Hero Section</p>
          <input value={form.hero_badge||''} onChange={e=>update('hero_badge',e.target.value)} placeholder="Badge" className="w-full border border-[#D1D5DB] rounded-xl px-3 py-2 text-xs" />
          <input value={form.hero_title||''} onChange={e=>update('hero_title',e.target.value)} placeholder="Hero Title" className="w-full border border-[#D1D5DB] rounded-xl px-3 py-2 text-xs font-bold" />
          <textarea value={form.hero_desc||''} onChange={e=>update('hero_desc',e.target.value)} rows={3} placeholder="Hero Description" className="w-full border border-[#D1D5DB] rounded-xl px-3 py-2 text-xs" />
          <div>
            <label className="text-xs font-bold">Hero Image (public/hero-lab.jpg)</label>
            <input type="file" accept="image/*" onChange={e=>setHeroFile(e.target.files[0])} className="w-full text-xs mt-1" />
            {form.hero_image && <p className="text-[11px] text-[#6B7280] mt-1">Current: {form.hero_image}</p>}
          </div>
        </div>

        <div className="h-px bg-[#D1D5DB]/60" />

        {/* Stats Strip */}
        <div className="space-y-3">
          <p className="text-xs font-bold flex items-center gap-2 text-[#0B6B43]">
            <span className="w-2 h-2 rounded-full bg-[#168B57]"></span>
            Landing Page Key Statistics (Numbers &amp; Labels)
          </p>
          <p className="text-[11px] text-[#6B7280]">Edit the 4 stats displayed horizontally on the website homepage.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-[#F9FAFB] p-3 rounded-xl border border-[#D1D5DB] space-y-1.5">
              <span className="text-[10px] font-bold text-[#6B7280] uppercase">Stat 1</span>
              <input value={form.stat1_value||''} onChange={e=>update('stat1_value',e.target.value)} placeholder="Value (e.g. 5)" className="w-full border border-[#D1D5DB] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#0B6B43]" />
              <input value={form.stat1_label||''} onChange={e=>update('stat1_label',e.target.value)} placeholder="Label (e.g. Report Types)" className="w-full border border-[#D1D5DB] rounded-lg px-2.5 py-1.5 text-xs" />
            </div>
            <div className="bg-[#F9FAFB] p-3 rounded-xl border border-[#D1D5DB] space-y-1.5">
              <span className="text-[10px] font-bold text-[#6B7280] uppercase">Stat 2</span>
              <input value={form.stat2_value||''} onChange={e=>update('stat2_value',e.target.value)} placeholder="Value (e.g. 38+)" className="w-full border border-[#D1D5DB] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#0B6B43]" />
              <input value={form.stat2_label||''} onChange={e=>update('stat2_label',e.target.value)} placeholder="Label (e.g. Test Parameters)" className="w-full border border-[#D1D5DB] rounded-lg px-2.5 py-1.5 text-xs" />
            </div>
            <div className="bg-[#F9FAFB] p-3 rounded-xl border border-[#D1D5DB] space-y-1.5">
              <span className="text-[10px] font-bold text-[#6B7280] uppercase">Stat 3</span>
              <input value={form.stat3_value||''} onChange={e=>update('stat3_value',e.target.value)} placeholder="Value (e.g. 1000+)" className="w-full border border-[#D1D5DB] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#0B6B43]" />
              <input value={form.stat3_label||''} onChange={e=>update('stat3_label',e.target.value)} placeholder="Label (e.g. Reports Generated)" className="w-full border border-[#D1D5DB] rounded-lg px-2.5 py-1.5 text-xs" />
            </div>
            <div className="bg-[#F9FAFB] p-3 rounded-xl border border-[#D1D5DB] space-y-1.5">
              <span className="text-[10px] font-bold text-[#6B7280] uppercase">Stat 4</span>
              <input value={form.stat4_value||''} onChange={e=>update('stat4_value',e.target.value)} placeholder="Value (e.g. 24/7)" className="w-full border border-[#D1D5DB] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#0B6B43]" />
              <input value={form.stat4_label||''} onChange={e=>update('stat4_label',e.target.value)} placeholder="Label (e.g. Support)" className="w-full border border-[#D1D5DB] rounded-lg px-2.5 py-1.5 text-xs" />
            </div>
          </div>
        </div>

        <div className="h-px bg-[#D1D5DB]/60" />

        {/* About */}
        <div className="space-y-3">
          <p className="text-xs font-bold">About Section</p>
          <input value={form.about_title||''} onChange={e=>update('about_title',e.target.value)} placeholder="About Title" className="w-full border border-[#D1D5DB] rounded-xl px-3 py-2 text-xs" />
          <textarea value={form.about_desc||''} onChange={e=>update('about_desc',e.target.value)} rows={4} placeholder="About Description" className="w-full border border-[#D1D5DB] rounded-xl px-3 py-2 text-xs" />
          <div>
            <label className="text-xs font-bold">About Image</label>
            <input type="file" accept="image/*" onChange={e=>setAboutFile(e.target.files[0])} className="w-full text-xs mt-1" />
            {form.about_image && <p className="text-[11px] text-[#6B7280] mt-1">Current: {form.about_image}</p>}
          </div>
        </div>

        <div className="h-px bg-[#D1D5DB]/60" />

        {/* Contact */}
        <div className="space-y-3">
          <p className="text-xs font-bold">Contact Section &amp; Map Location</p>
          <input value={form.contact_phone||''} onChange={e=>update('contact_phone',e.target.value)} placeholder="Phone" className="w-full border border-[#D1D5DB] rounded-xl px-3 py-2 text-xs" />
          <input value={form.contact_email||''} onChange={e=>update('contact_email',e.target.value)} placeholder="Email" className="w-full border border-[#D1D5DB] rounded-xl px-3 py-2 text-xs" />
          <textarea value={form.contact_address||''} onChange={e=>update('contact_address',e.target.value)} rows={2} placeholder="Address" className="w-full border border-[#D1D5DB] rounded-xl px-3 py-2 text-xs" />
          <input value={form.contact_hours||''} onChange={e=>update('contact_hours',e.target.value)} placeholder="Hours e.g. Mon - Sat: 9am - 6pm" className="w-full border border-[#D1D5DB] rounded-xl px-3 py-2 text-xs" />
          <div>
            <label className="text-xs font-bold text-[#0B6B43]">Google Maps Embed URL / iFrame src</label>
            <input value={form.map_embed_url||''} onChange={e=>update('map_embed_url',e.target.value)} placeholder="https://www.google.com/maps/embed?..." className="w-full border border-[#D1D5DB] rounded-xl px-3 py-2 text-xs mt-1 font-mono text-[11px]" />
          </div>
        </div>

        <button disabled={saving} className="w-full bg-[#168B57] hover:bg-[#0B6B43] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save CMS'}
        </button>
        <p className="text-[11px] text-[#6B7280] text-center">Public page <span className="font-mono">/</span> fetches from <span className="font-mono">GET /api/cms/landing</span> — no login needed. Update is admin-only.</p>
      </form>
    </div>
  );
};
export default Cms;
