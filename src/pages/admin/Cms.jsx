import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { Save, Image, Type, Star, FileText } from 'lucide-react';
import Testimonials from './Testimonials';

export const Cms = () => {
  const { addToast } = useToast();
  const [tab, setTab] = useState('landing');
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

  if (loading && tab === 'landing') return <div className="p-6 text-xs">Loading CMS...</div>;
  if (!form && tab === 'landing') return <div className="p-6 text-xs text-red-600">No data</div>;

  const tabCls = (active) => `px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors ${
    active ? 'bg-[#168B57] border-[#168B57] text-white' : 'bg-white border-[#D1D5DB] text-[#6B7280] hover:border-[#168B57]/50'
  }`;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-lg font-bold">Website CMS</h2>
        <p className="text-xs text-[#6B7280]">Admin only. Changes appear on <span className="font-bold">/</span> immediately.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setTab('landing')} className={tabCls(tab === 'landing')}>
          <FileText className="w-3.5 h-3.5" /> Landing Page
        </button>
        <button type="button" onClick={() => setTab('testimonials')} className={tabCls(tab === 'testimonials')}>
          <Star className="w-3.5 h-3.5" /> Testimonials
        </button>
      </div>

      {tab === 'testimonials' ? (
        <Testimonials />
      ) : (
      <form onSubmit={save} className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-white/80 space-y-6">
        {/* Hero */}
        <div className="space-y-3">
          <p className="text-xs font-black text-[#0B6B43] uppercase tracking-wider flex items-center gap-2">
            <Type className="w-4 h-4 text-[#168B57]" /> Hero Section
          </p>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Badge Text</label>
            <input value={form.hero_badge||''} onChange={e=>update('hero_badge',e.target.value)} placeholder="Badge" className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Hero Title</label>
            <input value={form.hero_title||''} onChange={e=>update('hero_title',e.target.value)} placeholder="Hero Title" className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-black text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Hero Description</label>
            <textarea value={form.hero_desc||''} onChange={e=>update('hero_desc',e.target.value)} rows={3} placeholder="Hero Description" className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs resize-y" />
          </div>
          <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block">Hero Image (public/hero-lab.jpg)</label>
            <input type="file" accept="image/*" onChange={e=>setHeroFile(e.target.files[0])} className="w-full text-xs text-gray-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-[#0B6B43] hover:file:bg-emerald-100" />
            {form.hero_image && <p className="text-[11px] text-gray-500 font-medium mt-1">Current: {form.hero_image}</p>}
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Stats Strip */}
        <div className="space-y-3">
          <p className="text-xs font-black text-[#0B6B43] uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#168B57]"></span>
            Landing Page Key Statistics (Numbers &amp; Labels)
          </p>
          <p className="text-[11px] text-gray-500 font-medium">Edit the 4 stats displayed horizontally on the website homepage.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-gray-50/60 p-4 rounded-2xl border border-gray-100 space-y-2 shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Stat 1</span>
              <input value={form.stat1_value||''} onChange={e=>update('stat1_value',e.target.value)} placeholder="Value (e.g. 5)" className="w-full bg-white border border-gray-200/90 rounded-xl px-3 py-2 text-xs font-bold text-[#0B6B43] focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57]" />
              <input value={form.stat1_label||''} onChange={e=>update('stat1_label',e.target.value)} placeholder="Label (e.g. Report Types)" className="w-full bg-white border border-gray-200/90 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57]" />
            </div>
            <div className="bg-gray-50/60 p-4 rounded-2xl border border-gray-100 space-y-2 shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Stat 2</span>
              <input value={form.stat2_value||''} onChange={e=>update('stat2_value',e.target.value)} placeholder="Value (e.g. 38+)" className="w-full bg-white border border-gray-200/90 rounded-xl px-3 py-2 text-xs font-bold text-[#0B6B43] focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57]" />
              <input value={form.stat2_label||''} onChange={e=>update('stat2_label',e.target.value)} placeholder="Label (e.g. Test Parameters)" className="w-full bg-white border border-gray-200/90 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57]" />
            </div>
            <div className="bg-gray-50/60 p-4 rounded-2xl border border-gray-100 space-y-2 shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Stat 3</span>
              <input value={form.stat3_value||''} onChange={e=>update('stat3_value',e.target.value)} placeholder="Value (e.g. 1000+)" className="w-full bg-white border border-gray-200/90 rounded-xl px-3 py-2 text-xs font-bold text-[#0B6B43] focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57]" />
              <input value={form.stat3_label||''} onChange={e=>update('stat3_label',e.target.value)} placeholder="Label (e.g. Reports Generated)" className="w-full bg-white border border-gray-200/90 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57]" />
            </div>
            <div className="bg-gray-50/60 p-4 rounded-2xl border border-gray-100 space-y-2 shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Stat 4</span>
              <input value={form.stat4_value||''} onChange={e=>update('stat4_value',e.target.value)} placeholder="Value (e.g. 24/7)" className="w-full bg-white border border-gray-200/90 rounded-xl px-3 py-2 text-xs font-bold text-[#0B6B43] focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57]" />
              <input value={form.stat4_label||''} onChange={e=>update('stat4_label',e.target.value)} placeholder="Label (e.g. Support)" className="w-full bg-white border border-gray-200/90 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57]" />
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        {/* About */}
        <div className="space-y-3">
          <p className="text-xs font-black text-[#0B6B43] uppercase tracking-wider">About Section</p>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">About Title</label>
            <input value={form.about_title||''} onChange={e=>update('about_title',e.target.value)} placeholder="About Title" className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">About Description</label>
            <textarea value={form.about_desc||''} onChange={e=>update('about_desc',e.target.value)} rows={4} placeholder="About Description" className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs resize-y" />
          </div>
          <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block">About Image</label>
            <input type="file" accept="image/*" onChange={e=>setAboutFile(e.target.files[0])} className="w-full text-xs text-gray-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-[#0B6B43] hover:file:bg-emerald-100" />
            {form.about_image && <p className="text-[11px] text-gray-500 font-medium mt-1">Current: {form.about_image}</p>}
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Contact */}
        <div className="space-y-3">
          <p className="text-xs font-black text-[#0B6B43] uppercase tracking-wider">Contact Section &amp; Map Location</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Phone</label>
              <input value={form.contact_phone||''} onChange={e=>update('contact_phone',e.target.value)} placeholder="Phone" className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Email</label>
              <input value={form.contact_email||''} onChange={e=>update('contact_email',e.target.value)} placeholder="Email" className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Address</label>
            <textarea value={form.contact_address||''} onChange={e=>update('contact_address',e.target.value)} rows={2} placeholder="Address" className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs resize-y" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Working Hours</label>
            <input value={form.contact_hours||''} onChange={e=>update('contact_hours',e.target.value)} placeholder="Hours e.g. Mon - Sat: 9am - 6pm" className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs" />
          </div>
          <div>
            <label className="text-xs font-bold text-[#0B6B43] block mb-1">Google Maps Embed URL / iFrame src</label>
            <input value={form.map_embed_url||''} onChange={e=>update('map_embed_url',e.target.value)} placeholder="https://www.google.com/maps/embed?..." className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-mono text-[11px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs" />
          </div>
        </div>

        <div className="pt-2">
          <button disabled={saving} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#168B57] to-[#0B6B43] hover:from-[#0B6B43] hover:to-[#168B57] text-white font-bold text-xs shadow-[0_4px_14px_rgba(22,139,87,0.25)] hover:scale-[1.005] active:scale-[0.995] transition-all flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save CMS'}
          </button>
        </div>
        <p className="text-[11px] text-gray-400 text-center font-medium">Public page <span className="font-mono text-gray-600">/</span> fetches from <span className="font-mono text-gray-600">GET /api/cms/landing</span> — no login needed. Update is admin-only.</p>
      </form>
      )}
    </div>
  );
};
export default Cms;
