import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { Plus, Save, Star, Trash2 } from 'lucide-react';

const empty = { company: '', type: '', loc: '', text: '', rating: 5, is_active: true, sort_order: '' };

export const Testimonials = () => {
  const { addToast } = useToast();
  const { isDemo } = useAuth();
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const r = await api.get('/testimonials/all');
      setList(r.data);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load testimonials', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (isDemo) { addToast('Demo Mode: Action disabled', 'error'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        rating: parseInt(form.rating, 10) || 5,
        sort_order: form.sort_order === '' ? 0 : parseInt(form.sort_order, 10),
      };
      if (editing) await api.put(`/testimonials/${editing}`, payload);
      else await api.post('/testimonials', payload);
      addToast(editing ? 'Testimonial updated' : 'Testimonial added');
      setForm(empty);
      setEditing(null);
      load();
    } catch (err) {
      addToast(err.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (t) => {
    if (isDemo) { addToast('Demo Mode: Action disabled', 'error'); return; }
    try {
      await api.put(`/testimonials/${t.id}`, { is_active: !t.is_active });
      load();
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  const remove = async (t) => {
    if (isDemo) { addToast('Demo Mode: Action disabled', 'error'); return; }
    if (!window.confirm(`Delete testimonial from "${t.company}"?\n\nIt will disappear from the website immediately.`)) return;
    try {
      const r = await api.delete(`/testimonials/${t.id}`);
      addToast(r.data?.message || 'Deleted');
      if (editing === t.id) { setEditing(null); setForm(empty); }
      load();
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const startEdit = (t) => {
    setEditing(t.id);
    setForm({
      company: t.company || '',
      type: t.type || '',
      loc: t.loc || '',
      text: t.text || '',
      rating: t.rating || 5,
      is_active: t.is_active !== false,
      sort_order: t.sort_order ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const inputCls = 'w-full bg-gray-50/70 border border-gray-200/90 rounded-2xl px-3.5 py-2.5 text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs';

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Website CMS — Testimonials</h2>
        <p className="text-xs text-[#6B7280]">Customer reviews shown in the <span className="font-bold text-gray-800">Client Reviews</span> section of <span className="font-bold text-gray-800">/</span>. Hidden rows stay in admin but will not appear on the website.</p>
      </div>

      {!isDemo && (
        <form onSubmit={submit} className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-white/80 space-y-4">
          <p className="text-xs font-black text-[#0B6B43] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-gray-100">
            <Plus className="w-4 h-4 text-[#168B57]" /> {editing ? 'Edit Testimonial' : 'Add Testimonial'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <input required placeholder="Company / Client Name *" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className={`${inputCls} font-bold`} />
            <input placeholder="Business Type (e.g. Feed Manufacturer)" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={inputCls} />
            <input placeholder="Location (e.g. Kangeyam)" value={form.loc} onChange={e => setForm({ ...form, loc: e.target.value })} className={inputCls} />
          </div>

          <textarea required rows={3} placeholder="Review text *" value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} className={`${inputCls} resize-y`} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-end">
            <div>
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Star Rating</label>
              <select value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} className={`${inputCls} cursor-pointer`}>
                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Display Order</label>
              <input type="number" min="0" placeholder="0" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: e.target.value })} className={inputCls} />
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-800 pb-3 cursor-pointer select-none">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded text-[#168B57] focus:ring-[#168B57] accent-[#168B57]" />
              Active on website
            </label>
          </div>

          <div className="flex gap-2.5 pt-2 border-t border-gray-100">
            <button disabled={saving} className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#168B57] to-[#0B6B43] hover:from-[#0B6B43] hover:to-[#168B57] text-white font-bold text-xs shadow-[0_4px_14px_rgba(22,139,87,0.25)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-2 disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : (editing ? 'Update Testimonial' : 'Add Testimonial')}
            </button>
            {editing && (
              <button type="button" onClick={() => { setEditing(null); setForm(empty); }} className="px-5 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-2xs">
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <div className="bg-white rounded-3xl border border-white/80 overflow-hidden overflow-x-auto shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#EFEAFD] text-[11px] uppercase font-bold text-[#7A709E] border-b border-purple-100/60">
              <th className="py-3 px-4">Order</th>
              <th className="py-3 px-4">Company</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Review</th>
              <th className="py-3 px-4">Rating</th>
              <th className="py-3 px-4">Active</th>
              {!isDemo && <th className="py-3 px-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td colSpan={8} className="py-8 px-4 text-center text-gray-500 font-medium">Loading testimonials...</td></tr>
            )}
            {!loading && list.length === 0 && (
              <tr><td colSpan={8} className="py-8 px-4 text-center text-gray-500 font-medium">No testimonials yet — add one above.</td></tr>
            )}
            {list.map(t => (
              <tr key={t.id} className={`hover:bg-emerald-50/20 transition-colors ${t.is_active ? '' : 'opacity-60 bg-gray-50/40'}`}>
                <td className="py-3 px-4 font-bold text-gray-400">{t.sort_order}</td>
                <td className="py-3 px-4 font-extrabold text-gray-900">{t.company}</td>
                <td className="py-3 px-4 text-gray-600">{t.type || '-'}</td>
                <td className="py-3 px-4 text-gray-600">{t.loc || '-'}</td>
                <td className="py-3 px-4 max-w-[320px] text-gray-600"><span className="line-clamp-2">{t.text}</span></td>
                <td className="py-3 px-4 text-amber-500 font-extrabold">{t.rating} ★</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.is_active ? 'bg-emerald-100 text-[#0B6B43]' : 'bg-gray-100 text-gray-500'}`}>
                    {t.is_active ? 'Active' : 'Hidden'}
                  </span>
                </td>
                {!isDemo && (
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => startEdit(t)} className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-2xs transition-colors">Edit</button>
                      <button onClick={() => toggle(t)} className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-2xs transition-colors">{t.is_active ? 'Hide' : 'Show'}</button>
                      <button onClick={() => remove(t)} className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 shadow-2xs flex items-center gap-1 transition-colors"><Trash2 className="w-3 h-3" /> Delete</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Testimonials;
