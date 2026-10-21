import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { CheckSquare, Square, Sliders, Layers, ArrowUp, ArrowDown, Trash2, Plus, MoveVertical } from 'lucide-react';

export const REPORT_FIELD_DEFINITIONS = [
  { key: 'report_no', label: 'Report No', desc: 'Manual or auto-generated report number (e.g. KAL-4412)' },
  { key: 'sample_date', label: 'Sample Date', desc: 'Sample collection / testing date', isCore: true },
  { key: 'party_name', label: 'Customer Name', desc: 'Customer name', isCore: true },
  { key: 'sample_name', label: 'Sample Name', desc: 'e.g. CATTLE FEED, GHEE, WATER' },
  { key: 'vehicle_no', label: 'Vehicle No', desc: 'Vehicle registration / transport no' },
  { key: 'bill_no', label: 'Bill No / Ref No', desc: 'Invoice / DC / Delivery Challan number' },
  { key: 'bags_tons', label: 'Quantity (Bags / Tons / Unit)', desc: 'Batch / load quantity' },
  { key: 'buyer', label: 'Buyer', desc: 'Buyer / Consignee name' },
  { key: 'seller', label: 'Seller', desc: 'Seller / Supplier name' },
  { key: 'depositor_name', label: 'Depositer Name', desc: 'Depositer / Sender name' },
  { key: 'cid_no', label: 'CID No', desc: 'Customer ID / CID Number' },
  { key: 'si_no', label: 'SI No', desc: 'Serial / Reference SI Number' },
  { key: 'lot_no', label: 'Lot No', desc: 'Batch / Lot Number' },
  { key: 'nature_of_sample', label: 'Nature of Sample', desc: 'Condition / appearance / packaging' },
  { key: 'remarks', label: 'Remarks', desc: 'Remarks section below test results (e.g. Pass/Fail test comparison)' },
  { key: 'notes', label: 'Notes', desc: 'Notes section below test results / above footer' },
];

export const DEFAULT_VISIBLE_FIELDS = [
  'report_no',
  'sample_date',
  'party_name',
  'sample_name',
  'vehicle_no',
  'bill_no',
  'bags_tons',
];

export const getDefaultTableColumns = (reportType = {}) => {
  if (Array.isArray(reportType.table_columns) && reportType.table_columns.length > 0) {
    const mapped = reportType.table_columns.map((c, i) => ({
      key: c.key || `col_${i}`,
      label: c.label || c.name || `Column ${i + 1}`,
      visible: c.visible !== false,
      type: c.type || (['s_no', 'parameter', 'specification', 'result'].includes(c.key) ? 'system' : 'custom'),
      width: c.width || (c.key === 's_no' ? '8%' : (c.key === 'result' ? '18%' : (c.key === 'specification' ? '24%' : (c.key === 'parameter' ? '50%' : '20%')))),
      affix_type: c.affix_type || 'none',
      affix_value: c.affix_value || '',
      align: c.align || (c.key === 'parameter' ? 'left' : 'center')
    }));

    let hasSpec = mapped.some(c => c.key === 'specification');
    return mapped.filter(c => {
      const isSpecLabel = String(c.label).trim().toUpperCase() === 'SPECIFICATION';
      if (c.type === 'custom' && isSpecLabel) {
        if (hasSpec) return false;
        hasSpec = true;
        c.key = 'specification';
        c.type = 'system';
        c.width = c.width || '24%';
      }
      return true;
    });
  }

  const cols = [
    { key: 's_no', label: 'S.No', visible: true, type: 'system', width: '8%', affix_type: 'none', affix_value: '', align: 'center' },
    { key: 'parameter', label: 'Parameter', visible: true, type: 'system', width: '50%', affix_type: 'none', affix_value: '', align: 'left' },
  ];

  if (reportType.show_specification !== false) {
    cols.push({ key: 'specification', label: 'Specification', visible: true, type: 'system', width: '24%', affix_type: 'none', affix_value: '', align: 'center' });
  } else {
    cols.push({ key: 'specification', label: 'Specification', visible: false, type: 'system', width: '24%', affix_type: 'none', affix_value: '', align: 'center' });
  }

  const customs = Array.isArray(reportType.custom_columns) ? reportType.custom_columns : [];
  customs.forEach((cName, idx) => {
    cols.push({ key: `custom_${idx + 1}`, label: cName, visible: true, type: 'custom', width: '20%', affix_type: 'none', affix_value: '', align: 'center' });
  });

  cols.push({ key: 'result', label: 'Result', visible: true, type: 'system', width: '18%', affix_type: 'none', affix_value: '', align: 'center' });
  return cols;
};

export const ReportTypes = () => {
  const { addToast } = useToast();
  const { isDemo } = useAuth();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    name: '',
    title: 'TEST REPORT',
    quantity_label: 'Quantity',
    default_nature_of_sample: '',
    active: true,
    show_specification: true,
    visible_fields: [...DEFAULT_VISIBLE_FIELDS],
    default_remarks: '',
    default_notes: '',
    custom_columns: [],
    table_columns: getDefaultTableColumns()
  });
  const [editing, setEditing] = useState(null);
  const [newColName, setNewColName] = useState('');
  const [newColPosition, setNewColPosition] = useState('end');
  const [newColAffixType, setNewColAffixType] = useState('none');
  const [newColAffixValue, setNewColAffixValue] = useState('');
  const [newColAlign, setNewColAlign] = useState('center');
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

  // Table Columns Management Handlers
  const handleMoveColumn = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= form.table_columns.length) return;
    const updated = [...form.table_columns];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setForm({ ...form, table_columns: updated });
  };

  const handleSetColumnPosition = (index, targetIndex) => {
    if (targetIndex < 0 || targetIndex >= form.table_columns.length || targetIndex === index) return;
    const updated = [...form.table_columns];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setForm({ ...form, table_columns: updated });
  };

  const handleColumnLabelChange = (index, newLabel) => {
    const updated = [...form.table_columns];
    updated[index] = { ...updated[index], label: newLabel };
    setForm({ ...form, table_columns: updated });
  };

  const handleColumnWidthChange = (index, newWidth) => {
    const updated = [...form.table_columns];
    updated[index] = { ...updated[index], width: newWidth };
    setForm({ ...form, table_columns: updated });
  };

  const handleAdjustColumnWidth = (index, deltaPercent) => {
    const updated = [...form.table_columns];
    const currentWStr = (updated[index].width || '20%').toString().replace('%', '').replace('px', '');
    let currentW = parseFloat(currentWStr) || 20;
    let nextW = Math.max(5, Math.min(75, currentW + deltaPercent));
    updated[index] = { ...updated[index], width: `${Math.round(nextW)}%` };
    setForm({ ...form, table_columns: updated });
  };

  const handleColumnAffixTypeChange = (index, newType) => {
    const updated = [...form.table_columns];
    updated[index] = { ...updated[index], affix_type: newType };
    setForm({ ...form, table_columns: updated });
  };

  const handleColumnAffixValueChange = (index, newVal) => {
    const updated = [...form.table_columns];
    updated[index] = { ...updated[index], affix_value: newVal };
    setForm({ ...form, table_columns: updated });
  };

  const handleColumnAlignChange = (index, newAlign) => {
    const updated = [...form.table_columns];
    updated[index] = { ...updated[index], align: newAlign || 'center' };
    setForm({ ...form, table_columns: updated });
  };

  const handleColumnVisibilityToggle = (index) => {
    const updated = [...form.table_columns];
    const isNowVisible = !updated[index].visible;
    updated[index] = { ...updated[index], visible: isNowVisible };
    
    // If toggling specification column, also keep show_specification in sync
    const isSpec = updated[index].key === 'specification';
    setForm({
      ...form,
      table_columns: updated,
      ...(isSpec ? { show_specification: isNowVisible } : {})
    });
  };

  const handleDeleteColumn = (index) => {
    const col = form.table_columns[index];
    if (col.type === 'system') {
      // System columns can be toggled hidden rather than fully deleted
      handleColumnVisibilityToggle(index);
      return;
    }
    const updated = form.table_columns.filter((_, i) => i !== index);
    setForm({ ...form, table_columns: updated });
  };

  const handleAddColumn = () => {
    const name = newColName.trim();
    if (!name) return;
    
    const existing = form.table_columns.find(c => c.label.toLowerCase() === name.toLowerCase());
    if (existing) {
      addToast('A column with this name already exists', 'error');
      return;
    }

    const newColObj = {
      key: `custom_${Date.now()}`,
      label: name,
      visible: true,
      type: 'custom',
      width: '20%',
      affix_type: newColAffixType || 'none',
      affix_value: newColAffixValue || '',
      align: newColAlign || 'center'
    };

    const current = [...form.table_columns];
    if (newColPosition === 'start' || newColPosition === '0') {
      current.unshift(newColObj);
    } else if (newColPosition === 'end' || isNaN(parseInt(newColPosition))) {
      current.push(newColObj);
    } else {
      const idx = Math.max(0, Math.min(parseInt(newColPosition), current.length));
      current.splice(idx, 0, newColObj);
    }

    setForm({ ...form, table_columns: current });
    setNewColName('');
    setNewColPosition('end');
    setNewColAffixType('none');
    setNewColAffixValue('');
    setNewColAlign('center');
    addToast(`Added column "${name}"`);
  };

  const resetTableColumnsToDefault = () => {
    setForm(f => ({
      ...f,
      table_columns: getDefaultTableColumns({ show_specification: f.show_specification })
    }));
    addToast('Table columns reset to default order');
  };

  const startEdit = (t) => {
    setEditing(t.id);
    const qLabel = t.quantity_label || 'Tons / Bags';
    const initialTableCols = getDefaultTableColumns(t);
    setForm({
      name: t.name,
      title: t.title || 'TEST REPORT',
      quantity_label: qLabel,
      default_nature_of_sample: t.default_nature_of_sample || '',
      active: t.active,
      show_specification: t.show_specification ?? true,
      visible_fields: t.visible_fields && t.visible_fields.length > 0 ? t.visible_fields : [...DEFAULT_VISIBLE_FIELDS],
      default_remarks: t.default_remarks || '',
      default_notes: t.default_notes || '',
      custom_columns: t.custom_columns || [],
      table_columns: initialTableCols
    });
    setIsCustomQty(!standardQtyOptions.includes(qLabel));
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      name: '',
      title: 'TEST REPORT',
      quantity_label: 'Tons / Bags',
      default_nature_of_sample: '',
      active: true,
      show_specification: true,
      visible_fields: [...DEFAULT_VISIBLE_FIELDS],
      default_remarks: '',
      default_notes: '',
      custom_columns: [],
      table_columns: getDefaultTableColumns()
    });
    setNewColName('');
    setNewColPosition('end');
    setNewColAffixType('none');
    setNewColAffixValue('');
    setNewColAlign('center');
    setIsCustomQty(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (isDemo) { addToast('Demo Mode: Action disabled', 'error'); return; }
    try {
      const qLabel = form.quantity_label?.trim() || 'Tons / Bags';
      
      // Extract custom column labels from table_columns
      const customCols = form.table_columns
        .filter(c => c.type === 'custom' || (!['s_no', 'parameter', 'specification', 'result'].includes(c.key)))
        .map(c => c.label);

      // Extract spec visibility
      const specCol = form.table_columns.find(c => c.key === 'specification');
      const showSpec = specCol ? specCol.visible !== false : form.show_specification;

      const payload = {
        name: form.name,
        title: form.title || 'TEST REPORT',
        quantity_label: qLabel,
        default_nature_of_sample: form.default_nature_of_sample || null,
        active: form.active,
        show_specification: showSpec,
        visible_fields: form.visible_fields || [...DEFAULT_VISIBLE_FIELDS],
        default_remarks: form.default_remarks || null,
        default_notes: form.default_notes || null,
        custom_columns: customCols,
        table_columns: form.table_columns
      };

      if (editing) await api.put(`/report-types/${editing}`, payload);
      else await api.post('/report-types', payload);
      addToast(editing ? 'Report type updated successfully' : 'Report type created successfully');
      resetForm();
      loadTypes();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save report type', 'error');
    }
  };

  const remove = async (t) => {
    if (isDemo) { addToast('Demo Mode: Action disabled', 'error'); return; }
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
    if (isDemo) { addToast('Demo Mode: Action disabled', 'error'); return; }
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
        <h1 className="text-xl font-bold text-[#1F2937]">Report Types & Table Column Management</h1>
        <p className="text-xs text-[#6B7280]">
          Configure report formats, active parameters, report fields, and arrange/customize ALL table columns (S.No, Parameter, Specification, Custom Columns, Result) with positions and custom labels.
        </p>
      </div>

      <form onSubmit={submit} className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-white/80 space-y-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-xs font-bold text-gray-900">Report Type Name *</label>
            <input
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Animal Feed, Water, Oil"
              className="mt-1.5 w-full sm:w-56 px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs"
            />
          </div>
          <div className="flex-1 min-w-[220px]">
            <label className="text-xs font-bold text-gray-900">Report Title / Header *</label>
            <input
              required
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="TEST REPORT"
              className="mt-1.5 w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-bold text-[#0B6B43] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs"
            />
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-gray-700 pb-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.active}
              onChange={e => setForm({ ...form, active: e.target.checked })}
              className="w-4 h-4 rounded text-[#168B57] focus:ring-[#168B57]"
            /> Active
          </label>
        </div>

        {/* Configurable Report Fields (Check/Uncheck to show in New Report & PDF) */}
        <div className="border border-gray-100 bg-gray-50/50 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <label className="text-xs font-bold text-[#0B6B43] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#168B57]" /> Configurable Report Fields (Check / Uncheck to Show in New Report):
              </label>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Only checked fields will appear when creating/editing a report of this type (e.g. Buyer, Seller, Vehicle No, etc.).
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAllFields}
                className="text-[11px] font-bold text-[#168B57] bg-white hover:bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl shadow-2xs transition-colors"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={resetDefaultFields}
                className="text-[11px] font-bold text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-xl shadow-2xs transition-colors"
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
                  className={`flex items-start gap-2.5 p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                    isChecked
                      ? 'bg-emerald-50/80 border-emerald-300 text-[#0B6B43] shadow-xs'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // handled by parent div
                    className="mt-0.5 w-4 h-4 rounded text-[#168B57] focus:ring-[#168B57]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold flex items-center gap-1">
                      <span>{field.label}</span>
                      {field.isCore && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-gray-200/80 text-gray-700">Core</span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 truncate mt-0.5">{field.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quantity / Unit Radio Options */}
        <div className="border border-gray-100 bg-gray-50/50 rounded-2xl p-4 sm:p-5 space-y-3">
          <label className="text-xs font-bold text-[#0B6B43] block">
            Quantity / Unit / Tons Field Label in Report &amp; PDF:
          </label>
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-900">
            <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-[#0B6B43]">
              <input
                type="radio"
                name="qty_option"
                checked={!isCustomQty && (form.quantity_label === 'Tons / Bags' || form.quantity_label === 'Bags / Tons')}
                onChange={() => handleQtyRadioChange('Tons / Bags')}
                className="w-4 h-4 text-[#168B57] focus:ring-[#168B57]"
              />
              Tons / Bags
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-[#0B6B43]">
              <input
                type="radio"
                name="qty_option"
                checked={!isCustomQty && form.quantity_label === 'Tons'}
                onChange={() => handleQtyRadioChange('Tons')}
                className="w-4 h-4 text-[#168B57] focus:ring-[#168B57]"
              />
              Tons
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-[#0B6B43]">
              <input
                type="radio"
                name="qty_option"
                checked={!isCustomQty && form.quantity_label === 'Unit'}
                onChange={() => handleQtyRadioChange('Unit')}
                className="w-4 h-4 text-[#168B57] focus:ring-[#168B57]"
              />
              Unit
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-gray-700">
              <input
                type="radio"
                name="qty_option"
                checked={!isCustomQty && form.quantity_label === 'Quantity'}
                onChange={() => handleQtyRadioChange('Quantity')}
                className="w-4 h-4 text-[#168B57] focus:ring-[#168B57]"
              />
              Quantity
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-gray-700">
              <input
                type="radio"
                name="qty_option"
                checked={isCustomQty}
                onChange={() => handleQtyRadioChange('Custom')}
                className="w-4 h-4 text-[#168B57] focus:ring-[#168B57]"
              />
              Custom Label
            </label>

            {isCustomQty && (
              <input
                type="text"
                value={form.quantity_label}
                onChange={e => setForm({ ...form, quantity_label: e.target.value })}
                placeholder="e.g. Litres, MT, Containers"
                className="px-3.5 py-1.5 border border-[#168B57] rounded-xl text-xs bg-white w-48 font-semibold text-[#0B6B43] shadow-2xs"
                autoFocus
              />
            )}
          </div>
          <p className="text-[11px] text-gray-500">
            Field name shown in Report Entry &amp; PDF: <strong className="text-[#0B6B43]">{form.quantity_label || 'Tons / Bags'}</strong>
          </p>
        </div>

        {/* Default Nature of Sample, Remarks & Notes Templates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Default Nature of Sample Template */}
          <div className="border border-gray-100 bg-gray-50/50 rounded-2xl p-4 space-y-2.5">
            <div>
              <label className="text-xs font-bold text-[#0B6B43] block">
                Default Nature of Sample:
              </label>
              <p className="text-[11px] text-gray-500">
                Prebuilt mapped value auto-filled in new reports (overrides report type name if set).
              </p>
            </div>
            <textarea
              rows={2}
              value={form.default_nature_of_sample || ''}
              onChange={e => setForm({ ...form, default_nature_of_sample: e.target.value })}
              placeholder="e.g. CATTLE FEED, GHEE, WATER or custom description..."
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] transition-all resize-y shadow-2xs"
            />
          </div>

          {/* Default Remarks Template */}
          <div className="border border-gray-100 bg-gray-50/50 rounded-2xl p-4 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold text-[#0B6B43] block">
                  Default Remarks Template:
                </label>
                <p className="text-[11px] text-gray-500">
                  Auto-fills when <strong>Remarks</strong> is checked for this report type.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, default_remarks: 'The difference between the RM Test and the RM Double Wash Test results should be within 2. If the difference is within this specified limit, the sample will be considered as Pass. If it exceeds this limit, the sample will be considered as Fail.' }))}
                className="text-[11px] font-bold text-[#0B6B43] bg-white hover:bg-emerald-50 border border-[#86C1A4] px-2.5 py-1 rounded-xl shadow-2xs transition-colors"
              >
                + RM Test Preset
              </button>
            </div>
            <textarea
              rows={2}
              value={form.default_remarks || ''}
              onChange={e => setForm({ ...form, default_remarks: e.target.value })}
              placeholder="e.g. The difference between the RM Test and the RM Double Wash Test results should be within 2..."
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] transition-all resize-y shadow-2xs"
            />
          </div>

          {/* Default Notes Template */}
          <div className="border border-gray-100 bg-gray-50/50 rounded-2xl p-4 space-y-2.5">
            <div>
              <label className="text-xs font-bold text-[#0B6B43] block">
                Default Notes Template:
              </label>
              <p className="text-[11px] text-gray-500">
                Auto-fills when <strong>Notes</strong> is checked for this report type.
              </p>
            </div>
            <textarea
              rows={2}
              value={form.default_notes || ''}
              onChange={e => setForm({ ...form, default_notes: e.target.value })}
              placeholder="e.g. Standard terms, disclaimer, or notes for this report type..."
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] transition-all resize-y shadow-2xs"
            />
          </div>
        </div>

        {/* ALL Table Columns & Positions Manager */}
        <div className="border border-gray-100 bg-gray-50/50 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold text-[#0B6B43] flex items-center gap-1.5">
                <MoveVertical className="w-4 h-4 text-[#168B57]" /> All Table Columns &amp; Position Manager (Stored in DB):
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Manage and position <strong>EVERY</strong> column (S.No, Parameter, Specification, Custom Columns like METHODE, Result). Edit labels, adjust positions (1, 2, 3...), and toggle visibility.
              </p>
            </div>
            <button
              type="button"
              onClick={resetTableColumnsToDefault}
              className="text-[11px] font-bold text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-xl shadow-2xs transition-colors"
            >
              Reset Columns Default
            </button>
          </div>

          {/* Add New Column Box */}
          <div className="flex flex-wrap gap-3 items-end bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
            <div className="flex-1 min-w-[150px]">
              <label className="text-[10px] font-bold text-gray-700 uppercase block mb-1">New Column Name / Label</label>
              <input
                value={newColName}
                onChange={e => setNewColName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddColumn();
                  }
                }}
                placeholder="e.g. METHODE, Unit, Grade, Protocol"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50/70 focus:bg-white focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] transition-all"
              />
            </div>

            <div className="w-40">
              <label className="text-[10px] font-bold text-gray-700 uppercase block mb-1">Insert Position</label>
              <select
                value={newColPosition}
                onChange={e => setNewColPosition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50/70 focus:bg-white focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] font-medium"
              >
                <option value="end">At End (Pos {form.table_columns.length + 1})</option>
                <option value="0">Position 1 (At Start)</option>
                {form.table_columns.map((c, idx) => (
                  <option key={idx} value={idx + 1}>
                    Position {idx + 2} (After {c.label})
                  </option>
                ))}
              </select>
            </div>

            <div className="w-32">
              <label className="text-[10px] font-bold text-gray-700 uppercase block mb-1">Affix / Unit</label>
              <select
                value={newColAffixType}
                onChange={e => setNewColAffixType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50/70 focus:bg-white focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] font-medium"
              >
                <option value="none">None</option>
                <option value="suffix">Suffix (e.g. %)</option>
                <option value="prefix">Prefix (e.g. ₹)</option>
              </select>
            </div>

            {newColAffixType !== 'none' && (
              <div className="w-24">
                <label className="text-[10px] font-bold text-gray-700 uppercase block mb-1">Symbol</label>
                <input
                  value={newColAffixValue}
                  onChange={e => setNewColAffixValue(e.target.value)}
                  placeholder="e.g. %"
                  className="w-full px-2.5 py-2 border border-emerald-400 rounded-xl text-xs bg-white font-bold text-[#0B6B43] text-center"
                />
              </div>
            )}

            <div className="w-28">
              <label className="text-[10px] font-bold text-gray-700 uppercase block mb-1">Align</label>
              <select
                value={newColAlign}
                onChange={e => setNewColAlign(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50/70 focus:bg-white focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] font-medium"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div>
              <button
                type="button"
                onClick={handleAddColumn}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#168B57] to-[#0B6B43] text-white font-bold text-xs shadow-[0_4px_14px_rgba(22,139,87,0.2)] hover:scale-[1.01] transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Column
              </button>
            </div>
          </div>

          {/* List of All Columns with Full Position & Label Controls */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-900 block">
              Configured Table Columns ({form.table_columns.length} columns) — Set Position, Name, Align, Width &amp; Affix:
            </label>
            
            <div className="space-y-2">
              {form.table_columns.map((col, idx) => {
                const isSystem = col.type === 'system';
                const isVisible = col.visible !== false;
                const hasAffix = col.affix_type && col.affix_type !== 'none' && col.affix_value;
                const colAlign = col.align || (col.key === 'parameter' ? 'left' : 'center');
                return (
                  <div
                    key={col.key || idx}
                    className={`flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl border transition-all ${
                      isVisible
                        ? 'border-emerald-200/90 bg-white shadow-2xs'
                        : 'border-gray-200 bg-gray-50/60 opacity-60'
                    }`}
                  >
                    {/* Position Badge & Move Buttons */}
                    <div className="flex items-center gap-1.5">
                      <span className={`flex items-center justify-center w-7 h-7 rounded-full font-black text-xs border ${
                        isVisible ? 'bg-[#EAF7F0] text-[#0B6B43] border-emerald-300' : 'bg-gray-200 text-gray-500 border-gray-300'
                      }`}>
                        {idx + 1}
                      </span>

                      {/* Position Quick Jump Selector */}
                      <select
                        value={idx}
                        onChange={e => handleSetColumnPosition(idx, parseInt(e.target.value))}
                        className="text-[10px] font-semibold border border-gray-200 rounded-lg px-2 py-1 bg-gray-50 text-gray-700"
                        title="Change column position"
                      >
                        {form.table_columns.map((_, pIdx) => (
                          <option key={pIdx} value={pIdx}>
                            Pos {pIdx + 1}
                          </option>
                        ))}
                      </select>

                      {/* Move Up Button */}
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveColumn(idx, -1)}
                        className={`p-1.5 rounded-lg text-xs border transition-colors ${
                          idx === 0
                            ? 'opacity-30 border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                        title="Move column up (left in table)"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Move Down Button */}
                      <button
                        type="button"
                        disabled={idx === form.table_columns.length - 1}
                        onClick={() => handleMoveColumn(idx, 1)}
                        className={`p-1.5 rounded-lg text-xs border transition-colors ${
                          idx === form.table_columns.length - 1
                            ? 'opacity-30 border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                        title="Move column down (right in table)"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Column Label Input */}
                    <div className="flex-1 min-w-[130px] flex items-center gap-1.5">
                      <input
                        type="text"
                        value={col.label}
                        onChange={e => handleColumnLabelChange(idx, e.target.value)}
                        placeholder="Column Label"
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] bg-white shadow-2xs"
                      />
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase shrink-0 ${
                        isSystem ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {isSystem ? 'System' : 'Custom'}
                      </span>
                    </div>

                    {/* Column Align Selector (Left / Center / Right) */}
                    <div className="flex items-center gap-1.5 shrink-0 bg-gray-50/80 px-2.5 py-1.5 rounded-xl border border-gray-200" title="Text alignment in this column">
                      <span className="text-[10px] font-bold text-gray-600">Align:</span>
                      <select
                        value={colAlign}
                        onChange={e => handleColumnAlignChange(idx, e.target.value)}
                        className="text-[10px] font-bold border border-gray-200 rounded-lg px-2 py-0.5 bg-white text-gray-700"
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </div>

                    {/* Affix / Unit Controls (None / Suffix / Prefix + Symbol) */}
                    {col.key !== 's_no' && col.key !== 'parameter' && (
                      <div className="flex items-center gap-1.5 shrink-0 bg-gray-50/80 px-2.5 py-1.5 rounded-xl border border-gray-200" title="Default Prefix/Suffix with 1-letter space gap for all values in this column">
                        <span className="text-[10px] font-bold text-gray-600">Affix:</span>
                        <select
                          value={col.affix_type || 'none'}
                          onChange={e => handleColumnAffixTypeChange(idx, e.target.value)}
                          className="text-[10px] font-bold border border-gray-200 rounded-lg px-2 py-0.5 bg-white text-gray-700"
                        >
                          <option value="none">None</option>
                          <option value="suffix">Suffix (12 %)</option>
                          <option value="prefix">Prefix (₹ 500)</option>
                        </select>
                        {col.affix_type && col.affix_type !== 'none' && (
                          <input
                            type="text"
                            value={col.affix_value || ''}
                            onChange={e => handleColumnAffixValueChange(idx, e.target.value)}
                            placeholder="e.g. %"
                            className="w-14 px-2 py-0.5 border border-emerald-400 rounded-lg bg-white text-[11px] font-bold text-[#0B6B43] text-center"
                            title="Symbol/Unit (e.g. % or mg/kg or ₹)"
                          />
                        )}
                        {hasAffix && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-emerald-100 text-[#0B6B43] rounded">
                            {col.affix_type === 'suffix' ? `val ${col.affix_value}` : `${col.affix_value} val`}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Column Width Controls (Increase / Decrease / Set) */}
                    <div className="flex items-center gap-1 shrink-0 bg-gray-100/70 px-2.5 py-1.5 rounded-xl border border-gray-200" title="Adjust column width in PDF report">
                      <span className="text-[10px] font-bold text-gray-600 mr-0.5">Width:</span>
                      <button
                        type="button"
                        onClick={() => handleAdjustColumnWidth(idx, -2)}
                        className="w-5 h-5 flex items-center justify-center rounded-lg bg-white hover:bg-gray-200 border border-gray-200 text-gray-700 font-black text-xs transition-colors"
                        title="Decrease column width (-2%)"
                      >
                        -
                      </button>
                      <input
                        type="text"
                        value={col.width || (col.key === 's_no' ? '8%' : (col.key === 'result' ? '18%' : (col.key === 'specification' ? '24%' : (col.key === 'parameter' ? '50%' : '20%'))))}
                        onChange={e => handleColumnWidthChange(idx, e.target.value)}
                        className="w-14 text-center px-1 py-0.5 border border-gray-200 rounded-lg bg-white text-[11px] font-bold text-[#0B6B43]"
                        title="Set custom width (e.g. 10%, 25%, 50%)"
                      />
                      <button
                        type="button"
                        onClick={() => handleAdjustColumnWidth(idx, 2)}
                        className="w-5 h-5 flex items-center justify-center rounded-lg bg-white hover:bg-gray-200 border border-gray-200 text-gray-700 font-black text-xs transition-colors"
                        title="Increase column width (+2%)"
                      >
                        +
                      </button>
                    </div>

                    {/* Visibility & Action Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isVisible}
                          onChange={() => handleColumnVisibilityToggle(idx)}
                          className="w-4 h-4 rounded text-[#168B57] focus:ring-[#168B57]"
                        />
                        <span className="text-[11px] font-bold">{isVisible ? 'Visible' : 'Hidden'}</span>
                      </label>

                      {!isSystem ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteColumn(idx)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors"
                          title="Delete custom column"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="w-6"></span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Table Header Preview */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#0B6B43] block mb-2">
                Live Table Header Order, Align &amp; Width Preview (As Rendered in PDF &amp; Report Screen):
              </span>
              
              <div className="overflow-x-auto border border-gray-200 rounded-2xl bg-white shadow-2xs">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#EFEAFD] border-b border-purple-100/60">
                      {form.table_columns
                        .filter(c => c.visible !== false)
                        .map((c, i) => {
                          const cAlign = c.align || (c.key === 'parameter' ? 'left' : 'center');
                          return (
                            <th
                              key={c.key || i}
                              style={{ width: c.width || 'auto', textAlign: cAlign }}
                              className="py-2.5 px-3.5 text-[11px] font-bold uppercase text-[#7A709E] border-r border-purple-100/40 last:border-r-0"
                            >
                              <div className={`flex items-center gap-1.5 ${cAlign === 'center' ? 'justify-center' : (cAlign === 'right' ? 'justify-end' : 'justify-between')}`}>
                                <span>{c.label}</span>
                                <span className="text-[9px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-md font-bold border border-purple-200">
                                  {c.width || 'auto'}
                                </span>
                              </div>
                            </th>
                          );
                        })}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white text-[11px] text-gray-500 italic">
                      {form.table_columns
                        .filter(c => c.visible !== false)
                        .map((c, i) => {
                          const cAlign = c.align || (c.key === 'parameter' ? 'left' : 'center');
                          return (
                            <td
                              key={c.key || i}
                              style={{ width: c.width || 'auto', textAlign: cAlign }}
                              className="py-2.5 px-3.5 border-r border-gray-100 last:border-r-0"
                            >
                              {c.key === 's_no' ? '1' : (c.key === 'parameter' ? 'Free Fatty Acids' : (c.key === 'result' ? '1.25 %' : (c.key === 'specification' ? 'Max 2.0 %' : `Sample ${c.label}`)))}
                            </td>
                          );
                        })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isDemo}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#168B57] to-[#0B6B43] hover:from-[#0B6B43] hover:to-[#168B57] text-white font-bold text-xs shadow-[0_4px_14px_rgba(22,139,87,0.25)] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {editing ? 'Update Report Type' : 'Add Report Type'}
          </button>
          {editing && (
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2.5 rounded-2xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 shadow-2xs transition-all"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* List of all Report Types */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-white/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#EFEAFD] text-[11px] uppercase font-bold text-[#7A709E] border-b border-purple-100/60">
                <th className="py-3 px-4 rounded-l-2xl">Name</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Qty / Unit Label</th>
                <th className="py-3 px-4">Mapped Fields</th>
                <th className="py-3 px-4">Table Columns Order</th>
                <th className="py-3 px-4">Active / Status</th>
                {!isDemo && <th className="py-3 px-4 text-right rounded-r-2xl">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map(t => {
                const activeFields = t.visible_fields && t.visible_fields.length > 0 ? t.visible_fields : DEFAULT_VISIBLE_FIELDS;
                const configuredCols = getDefaultTableColumns(t).filter(c => c.visible !== false);
                return (
                  <tr key={t.id} className={`hover:bg-gray-50/60 transition-colors ${t.active ? '' : 'opacity-60 bg-gray-50/30'}`}>
                    <td className="py-3.5 px-4 font-bold text-gray-900">{t.name}</td>
                    <td className="py-3.5 px-4 text-gray-600 font-semibold">{t.title}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[#0B6B43] font-bold text-[11px]">
                        {t.quantity_label || 'Quantity'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {activeFields.map(fKey => {
                          const def = REPORT_FIELD_DEFINITIONS.find(d => d.key === fKey);
                          return (
                            <span key={fKey} className="px-2 py-0.5 bg-gray-100 border border-gray-200/80 text-[10px] rounded-lg text-gray-700 font-medium">
                              {def ? def.label.split(' ')[0] : fKey}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap items-center gap-1 max-w-xs">
                        {configuredCols.map((col, cIdx) => (
                          <span
                            key={cIdx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-emerald-800 text-[10px] font-bold"
                          >
                            <span className="w-3.5 h-3.5 rounded-full bg-[#168B57] text-white text-[9px] flex items-center justify-center font-bold">
                              {cIdx + 1}
                            </span>
                            {col.label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        disabled={isDemo}
                        onClick={() => toggleActive(t)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all shadow-2xs ${
                          t.active ? 'bg-[#EAF7F0] text-[#0B6B43] hover:bg-emerald-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title="Click to toggle active/inactive"
                      >
                        {t.active ? '✓ Active' : '✗ Disabled'}
                      </button>
                    </td>
                    {!isDemo && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex gap-1.5 justify-end">
                          <button onClick={() => startEdit(t)} className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-2xs transition-all">Edit</button>
                          <button onClick={() => remove(t)} className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 shadow-2xs transition-all">Delete</button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
