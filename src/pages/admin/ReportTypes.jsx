import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { CheckSquare, Square, Sliders, Layers } from 'lucide-react';

export const REPORT_FIELD_DEFINITIONS = [
  { key: 'sample_date', label: 'Sample Date', desc: 'Sample collection / testing date', isCore: true },
  { key: 'party_name', label: 'Customer Name', desc: 'Customer name', isCore: true },
  { key: 'sample_name', label: 'Sample Name', desc: 'e.g. CATTLE FEED, GHEE, WATER' },
  { key: 'vehicle_no', label: 'Vehicle No', desc: 'Vehicle registration / transport no' },
  { key: 'bill_no', label: 'Bill No / Ref No', desc: 'Invoice / DC / Delivery Challan number' },
  { key: 'bags_tons', label: 'Quantity (Bags / Tons / Unit)', desc: 'Batch / load quantity' },
  { key: 'buyer', label: 'Buyer (வாங்குபவர்)', desc: 'Buyer / Consignee name' },
  { key: 'seller', label: 'Seller (விற்பனையாளர்)', desc: 'Seller / Supplier name' },
  { key: 'nature_of_sample', label: 'Nature of Sample', desc: 'Condition / appearance / packaging' },
  { key: 'remarks', label: 'Remarks / Notes', desc: 'Special remarks or notes' },
];

export const DEFAULT_VISIBLE_FIELDS = [
  'sample_date',
  'party_name',
  'sample_name',
  'vehicle_no',
  'bill_no',
  'bags_tons',
];

export const ReportTypes = () => {
  const { addToast } = useToast();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    name: '',
    title: '',
    quantity_label: 'Quantity',
    active: true,
    show_specification: true,
    visible_fields: [...DEFAULT_VISIBLE_FIELDS],
    custom_columns: []
  });
  const [editing, setEditing] = useState(null);
  const [newCol, setNewCol] = useState('');
  const [isCustomQty, setIsCustomQty] = useState(false);

  const loadTypes = async () => {
    try {
      const r = await api.get('/report-types');
      setList(r.data);
    } catch {
      addToast('Failed to load report types', 'error');
    }
  };

  useEffect(() => {
    loadTypes();
  }, []);

  const standardQtyOptions = ['Tons / Bags', 'Tons', 'Bags / Tons', 'Unit', 'Quantity'];

  const handleQtyRadioChange = (opt) => {
    if (opt === 'Custom') {
      setIsCustomQty(true);
      if (standardQtyOptions.includes(form.quantity_label)) {
        setForm(f => ({ ...f, quantity_label: '' }));
      }
    } else {
      setIsCustomQty(false);
      setForm(f => ({ ...f, quantity_label: opt }));
    }
  };

  const toggleField = (fieldKey) => {
    setForm(f => {
      const current = f.visible_fields || [...DEFAULT_VISIBLE_FIELDS];
      const exists = current.includes(fieldKey);
      const updated = exists ? current.filter(k => k !== fieldKey) : [...current, fieldKey];
      return { ...f, visible_fields: updated };
    });
  };

  const selectAllFields = () => {
    setForm(f => ({
      ...f,
      visible_fields: REPORT_FIELD_DEFINITIONS.map(d => d.key)
    }));
  };

  const resetDefaultFields = () => {
    setForm(f => ({
      ...f,
      visible_fields: [...DEFAULT_VISIBLE_FIELDS]
    }));
  };

  const startEdit = (t) => {
    setEditing(t.id);
    const qLabel = t.quantity_label || 'Tons / Bags';
    setForm({
      name: t.name,
      title: t.title,
      quantity_label: qLabel,
      active: t.active,
      show_specification: t.show_specification ?? true,
      visible_fields: t.visible_fields && t.visible_fields.length > 0 ? t.visible_fields : [...DEFAULT_VISIBLE_FIELDS],
      custom_columns: t.custom_columns || []
    });
    setIsCustomQty(!standardQtyOptions.includes(qLabel));
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      name: '',
      title: '',
      quantity_label: 'Tons / Bags',
      active: true,
      show_specification: true,
      visible_fields: [...DEFAULT_VISIBLE_FIELDS],
      custom_columns: []
    });
    setNewCol('');
    setIsCustomQty(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const qLabel = form.quantity_label?.trim() || 'Tons / Bags';
      const payload = {
        ...form,
        quantity_label: qLabel,
        visible_fields: form.visible_fields || [...DEFAULT_VISIBLE_FIELDS],
        custom_columns: form.custom_columns || []
      };
      if (editing) await api.put(`/report-types/${editing}`, payload);
      else await api.post('/report-types', payload);
      addToast(editing ? 'Updated successfully' : 'Created successfully');
      resetForm();
      loadTypes();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  const remove = async (t) => {
    if (!window.confirm(`Delete report type "${t.name}"?\n\nIts parameters are removed with it. Types with existing reports cannot be deleted.`)) return;
    try {
      const r = await api.delete(`/report-types/${t.id}`);
      addToast(r.data?.message || 'Deleted');
      if (editing === t.id) resetForm();
      loadTypes();
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const toggleActive = async (t) => {
    try {
      await api.put(`/report-types/${t.id}`, { active: !t.active });
      addToast(`"${t.name}" is now ${!t.active ? 'Active' : 'Disabled'}`);
      loadTypes();
    } catch {
      addToast('Failed to update status', 'error');
    }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-[#1F2937]">Report Types & Field Customization</h1>
        <p className="text-xs text-[#6B7280]">
          Configure report formats, active parameters, and choose which fields (Buyer, Seller, Vehicle No, etc.) appear during report creation.
        </p>
      </div>

      <form onSubmit={submit} className="bg-white border border-[#D1D5DB] rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs font-bold text-[#1F2937]">Report Type Name *</label>
            <input
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Animal Feed, Water, Oil"
              className="mt-1 w-44 px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white"
            />
          </div>
          <div className="flex-1 min-w-[220px]">
            <label className="text-xs font-bold text-[#1F2937]">PDF Title / Header *</label>
            <input
              required
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="CERTIFICATE OF ANALYSIS"
              className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white"
            />
          </div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-[#1F2937] pb-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={e => setForm({ ...form, active: e.target.checked })}
              className="rounded text-[#168B57]"
            /> Active
          </label>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-[#0B6B43] border border-[#D1EEE0] bg-[#EAF7F0] px-3 py-2 rounded-xl pb-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.show_specification}
              onChange={e => setForm({ ...form, show_specification: e.target.checked })}
              className="rounded text-[#168B57]"
            /> Show Specification
          </label>
        </div>

        {/* Configurable Report Fields (Check/Uncheck to show in New Report & PDF) */}
        <div className="border border-[#D1EEE0] bg-[#F9FAFB] rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <label className="text-xs font-bold text-[#0B6B43] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#168B57]" /> Configurable Report Fields (Check / Uncheck to Show in New Report):
              </label>
              <p className="text-[11px] text-[#6B7280] mt-0.5">
                Only checked fields will appear when creating/editing a report of this type (e.g. Buyer, Seller, Vehicle No, etc.).
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAllFields}
                className="text-[11px] font-semibold text-[#168B57] bg-white hover:bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={resetDefaultFields}
                className="text-[11px] font-semibold text-[#6B7280] bg-white hover:bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-lg transition-colors"
              >
                Reset Default
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
            {REPORT_FIELD_DEFINITIONS.map(field => {
              const isChecked = (form.visible_fields || []).includes(field.key);
              return (
                <div
                  key={field.key}
                  onClick={() => toggleField(field.key)}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                    isChecked
                      ? 'bg-emerald-50/70 border-emerald-300 text-[#0B6B43] shadow-xs'
                      : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // handled by parent div
                    className="mt-0.5 rounded text-[#168B57] focus:ring-[#168B57]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold flex items-center gap-1">
                      <span>{field.label}</span>
                      {field.isCore && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-gray-200 text-gray-700">Core</span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#6B7280] truncate mt-0.5">{field.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quantity / Unit Radio Options */}
        <div className="border border-[#D1EEE0] bg-[#F9FAFB] rounded-xl p-3.5 space-y-2">
          <label className="text-xs font-bold text-[#0B6B43] block">
            Quantity / Unit / Tons Field Label in Report & PDF:
          </label>
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#1F2937]">
            <label className="inline-flex items-center gap-1.5 cursor-pointer font-bold text-[#0B6B43]">
              <input
                type="radio"
                name="qty_option"
                checked={!isCustomQty && (form.quantity_label === 'Tons / Bags' || form.quantity_label === 'Bags / Tons')}
                onChange={() => handleQtyRadioChange('Tons / Bags')}
                className="text-[#168B57] focus:ring-[#168B57]"
              />
              Tons / Bags
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer font-bold text-[#0B6B43]">
              <input
                type="radio"
                name="qty_option"
                checked={!isCustomQty && form.quantity_label === 'Tons'}
                onChange={() => handleQtyRadioChange('Tons')}
                className="text-[#168B57] focus:ring-[#168B57]"
              />
              Tons
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer font-bold text-[#0B6B43]">
              <input
                type="radio"
                name="qty_option"
                checked={!isCustomQty && form.quantity_label === 'Unit'}
                onChange={() => handleQtyRadioChange('Unit')}
                className="text-[#168B57] focus:ring-[#168B57]"
              />
              Unit
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium">
              <input
                type="radio"
                name="qty_option"
                checked={!isCustomQty && form.quantity_label === 'Quantity'}
                onChange={() => handleQtyRadioChange('Quantity')}
                className="text-[#168B57] focus:ring-[#168B57]"
              />
              Quantity
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium">
              <input
                type="radio"
                name="qty_option"
                checked={isCustomQty}
                onChange={() => handleQtyRadioChange('Custom')}
                className="text-[#168B57] focus:ring-[#168B57]"
              />
              Custom Label
            </label>

            {isCustomQty && (
              <input
                type="text"
                value={form.quantity_label}
                onChange={e => setForm({ ...form, quantity_label: e.target.value })}
                placeholder="e.g. Litres, MT, Containers"
                className="px-3 py-1.5 border border-[#168B57] rounded-lg text-xs bg-white w-48 font-semibold text-[#0B6B43]"
                autoFocus
              />
            )}
          </div>
          <p className="text-[11px] text-[#6B7280]">
            Field name shown in Report Entry & PDF: <strong className="text-[#0B6B43]">{form.quantity_label || 'Tons / Bags'}</strong>
          </p>
        </div>

        {/* Custom Columns */}
        <div className="border border-[#D1EEE0] bg-[#F9FAFB] rounded-xl p-3 space-y-2">
          <p className="text-xs font-bold text-[#0B6B43]">Custom Columns (report-wise show/hide)</p>
          <div className="flex gap-2">
            <input
              value={newCol}
              onChange={e => setNewCol(e.target.value)}
              placeholder="e.g. Colour, Texture"
              className="flex-1 px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white"
            />
            <button
              type="button"
              onClick={() => {
                if (newCol.trim()) {
                  setForm({ ...form, custom_columns: [...(form.custom_columns || []), newCol.trim()] });
                  setNewCol('');
                }
              }}
              className="px-3 py-2 rounded-xl bg-white border border-[#168B57] text-[#168B57] font-bold text-xs hover:bg-[#EAF7F0]"
            >
              Add Column
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {(form.custom_columns || []).map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1 bg-white border border-[#D1D5DB] px-2 py-1 rounded-full text-xs">
                {c}{' '}
                <button
                  type="button"
                  onClick={() => setForm({ ...form, custom_columns: form.custom_columns.filter((_, idx) => idx !== i) })}
                  className="text-red-500 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
            {(!form.custom_columns || form.custom_columns.length === 0) && (
              <span className="text-[11px] text-[#6B7280]">No custom columns — enable Specification toggle above</span>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-[#168B57] hover:bg-[#0B6B43] transition-colors text-white font-bold text-xs shadow-sm"
          >
            {editing ? 'Update Report Type' : 'Add Report Type'}
          </button>
          {editing && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl border border-[#D1D5DB] text-xs font-semibold text-[#4B5563] hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="bg-white border border-[#D1D5DB] rounded-2xl overflow-hidden overflow-x-auto shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#EAF7F0] text-[11px] uppercase font-bold text-[#6B7280] border-b border-[#D1D5DB]">
              <th className="py-2.5 px-4">Name</th>
              <th className="py-2.5 px-4">Title</th>
              <th className="py-2.5 px-4">Qty / Unit Label</th>
              <th className="py-2.5 px-4">Mapped Fields</th>
              <th className="py-2.5 px-4">Spec</th>
              <th className="py-2.5 px-4">Active / Status</th>
              <th className="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D1D5DB]/60">
            {list.map(t => {
              const activeFields = t.visible_fields && t.visible_fields.length > 0 ? t.visible_fields : DEFAULT_VISIBLE_FIELDS;
              return (
                <tr key={t.id} className={t.active ? '' : 'opacity-60 bg-gray-50'}>
                  <td className="py-2.5 px-4 font-bold text-[#111827]">{t.name}</td>
                  <td className="py-2.5 px-4 text-[#4B5563]">{t.title}</td>
                  <td className="py-2.5 px-4">
                    <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[#0B6B43] font-semibold text-[11px]">
                      {t.quantity_label || 'Quantity'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {activeFields.map(fKey => {
                        const def = REPORT_FIELD_DEFINITIONS.find(d => d.key === fKey);
                        return (
                          <span key={fKey} className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 text-[10px] rounded text-gray-700 font-medium">
                            {def ? def.label.split(' ')[0] : fKey}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="py-2.5 px-4">{t.show_specification ? 'Shown' : 'Hidden'}</td>
                  <td className="py-2.5 px-4">
                    <button
                      type="button"
                      onClick={() => toggleActive(t)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                        t.active ? 'bg-[#EAF7F0] text-[#0B6B43] hover:bg-emerald-100' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      title="Click to toggle active/inactive"
                    >
                      {t.active ? '✓ Active (ON)' : '✗ Disabled (OFF)'}
                    </button>
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => startEdit(t)} className="px-3 py-1 rounded-lg border border-[#D1D5DB] text-xs font-bold hover:bg-[#F9FAFB]">Edit</button>
                      <button onClick={() => remove(t)} className="px-3 py-1 rounded-lg border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50">Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

