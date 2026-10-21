import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import { CustomerAutocomplete } from '../components/common/CustomerAutocomplete';
import { getDefaultTableColumns } from './admin/ReportTypes';
import {
  Calendar, Building2, FlaskConical, Truck, Package, Hash,
  FileText, UserCheck, Store, ClipboardList, MessageSquare, User, Tag
} from 'lucide-react';

export const EditReport = ({ reportId, setActiveTab, setSelectedReportId }) => {
  const { addToast } = useToast();
  const { isDemo } = useAuth();
  const [form, setForm] = useState(null);
  const [results, setResults] = useState([]);
  const [saving, setSaving] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [enableRemarks, setEnableRemarks] = useState(true);
  const [enableNotes, setEnableNotes] = useState(true);
  const [suggestions, setSuggestions] = useState({});

  useEffect(()=>{
    api.get('/reports/field-suggestions')
      .then(r => setSuggestions(r.data || {}))
      .catch(()=>{});
  }, []);

  useEffect(()=>{
    if (!reportId) return;
    setLoadError('');
    setForm(null);
    api.get(`/reports/${reportId}`).then(r=>{
      const d = r.data;
      const company = d.party_name || d.customer_name || '';
      const visFields = Array.isArray(d.report_type?.visible_fields) ? d.report_type.visible_fields : ['sample_date', 'party_name', 'sample_name', 'vehicle_no', 'bill_no', 'bags_tons'];
      const hasRemContent = d.remarks !== null && d.remarks !== undefined && d.remarks.trim() !== '';
      const isRemVis = visFields.includes('remarks');
      setEnableRemarks(hasRemContent || isRemVis);

      const hasNotesContent = d.notes !== null && d.notes !== undefined && d.notes.trim() !== '';
      const isNotesVis = visFields.includes('notes');
      setEnableNotes(hasNotesContent || isNotesVis);

      setForm({
        sample_date: d.sample_date ? d.sample_date.split('T')[0] : '',
        company_name: company,
        party_name: company,
        customer_name: company,
        address: d.address || d.customer?.address || '',
        sample_name: d.sample_name || '',
        vehicle_no: d.vehicle_no || '',
        bill_no: d.bill_no || '',
        bags_tons: d.bags_tons || '',
        buyer: d.buyer || '',
        seller: d.seller || '',
        depositor_name: d.depositor_name || '',
        cid_no: d.cid_no || '',
        si_no: d.si_no || '',
        lot_no: d.lot_no || '',
        nature_of_sample: d.nature_of_sample || d.report_type?.name || '',
        remarks: d.remarks !== null && d.remarks !== undefined && d.remarks !== ''
          ? d.remarks
          : (d.report_type?.default_remarks || 'The difference between the RM Test and the RM Double Wash Test results should be within 2. If the difference is within this specified limit, the sample will be considered as Pass. If it exceeds this limit, the sample will be considered as Fail.'),
        notes: d.notes !== null && d.notes !== undefined && d.notes !== ''
          ? d.notes
          : (d.report_type?.default_notes || ''),
        report_type: d.report_type,
        report_no: d.report_no,
      });
      setResults((d.results || []).map(x => ({
        parameter_id: x.parameter_id,
        result: x.result,
        specification: x.specification,
        name: x.parameter?.name,
        unit: x.parameter?.unit,
        custom_values: x.custom_values || {},
        enabled: x.enabled !== false,
      })));
    }).catch(()=> setLoadError('Failed to load report'));
    api.get(`/reports/${reportId}/invoice`).then(r => setInvoice(r.data)).catch(()=> setInvoice(null));
  }, [reportId]);

  if (!reportId) return <div className="p-8 text-center text-xs text-[#6B7280]">No report selected</div>;
  if (loadError) return <div className="p-8 text-center text-xs text-red-600">{loadError}</div>;
  if (!form) return <div className="p-8 text-center text-xs text-[#6B7280]">Loading...</div>;

  const showSpecEdit = form.report_type ? (form.report_type.show_specification ?? true) : true;
  
  const defaultFields = ['report_no', 'sample_date', 'party_name', 'sample_name', 'vehicle_no', 'bill_no', 'bags_tons'];
  const visibleFields = form.report_type?.visible_fields && form.report_type.visible_fields.length > 0
    ? form.report_type.visible_fields
    : defaultFields;

  const isFieldVisible = (key) => key === 'report_no' || visibleFields.includes(key);

  const updateCustomValue = (idx, col, val) => {
    setResults(r => {
      const copy = [...r];
      copy[idx] = {
        ...copy[idx],
        custom_values: { ...(copy[idx].custom_values || {}), [col]: val }
      };
      return copy;
    });
  };

  const toggleRowAffix = (idx, colKey) => {
    setResults(r => {
      const copy = [...r];
      const currentToggles = copy[idx].affix_toggles || {};
      const currentVal = currentToggles[colKey] !== false;
      copy[idx] = {
        ...copy[idx],
        affix_toggles: {
          ...currentToggles,
          [colKey]: !currentVal
        }
      };
      return copy;
    });
  };

  const formatCellWithAffix = (val, col, isEnabled = true) => {
    if (!val || val === '-' || !isEnabled) return val;
    const affixType = col.affix_type;
    const affixVal = (col.affix_value || '').trim();
    if (!affixType || affixType === 'none' || !affixVal) return val;

    const strVal = String(val).trim();
    if (affixType === 'suffix') {
      const esc = affixVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp(esc + '$').test(strVal)) {
        return strVal.replace(new RegExp('\\s*' + esc + '$'), ` ${affixVal}`);
      }
      return `${strVal} ${affixVal}`;
    }
    if (affixType === 'prefix') {
      const esc = affixVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp('^' + esc).test(strVal)) {
        return `${affixVal} ` + strVal.replace(new RegExp('^' + esc + '\\s*'), '');
      }
      return `${affixVal} ${strVal}`;
    }
    return val;
  };

  const save = async () => {
    if (isDemo) {
      addToast('Demo Mode: Editing reports is disabled in read-only mode', 'error');
      return;
    }
    setSaving(true);
    try {
      const tableCols = Array.isArray(form.report_type?.table_columns) && form.report_type.table_columns.length > 0
        ? form.report_type.table_columns
        : [];
      const resCol = tableCols.find(c => c.key === 'result') || { affix_type: 'none', affix_value: '' };

      const party = form.company_name || form.party_name || form.customer_name;
      const payload = {
        ...form,
        party_name: party,
        customer_name: party,
        coa_date: form.sample_date,
        remarks: enableRemarks ? (form.remarks || '') : '',
        notes: enableNotes ? (form.notes || '') : '',
        results: results.map(r => {
          const isResAffixOn = r.affix_toggles?.['result'] !== false;
          const formattedRes = formatCellWithAffix(r.result, resCol, isResAffixOn);

          const formattedCustom = {};
          Object.entries(r.custom_values || {}).forEach(([cName, cVal]) => {
            const customCol = tableCols.find(c => c.label === cName || c.key === cName) || { affix_type: 'none', affix_value: '' };
            const isCustomAffixOn = r.affix_toggles?.[customCol.key || cName] !== false;
            formattedCustom[cName] = formatCellWithAffix(cVal, customCol, isCustomAffixOn);
          });

          return {
            parameter_id: r.parameter_id,
            result: formattedRes || '-',
            specification: r.specification,
            custom_values: formattedCustom,
            enabled: r.enabled !== false,
          };
        }),
      };
      delete payload.company_name;
      delete payload.report_type;
      if (!payload.report_no || !payload.report_no.trim()) delete payload.report_no;
      else payload.report_no = payload.report_no.trim();
      if (!payload.bill_no) delete payload.bill_no;

      await api.put(`/reports/${reportId}`, payload);
      addToast('Report updated successfully');
      setActiveTab('view-report');
    } catch(e) {
      addToast(e.response?.data?.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {isDemo && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-800 font-semibold flex items-center justify-between">
          <span>🔒 Demo Mode: You are in read-only access. Editing reports is disabled.</span>
        </div>
      )}
      <div>
        <h1 className="text-xl font-bold text-[#1F2937]">Edit Report — {form.report_no}</h1>
        <p className="text-xs text-[#6B7280]">{form.report_type?.name} • {form.report_type?.title}</p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-white/80 space-y-6">
        <div>
          <h3 className="text-xs font-black text-[#0B6B43] uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#168B57]" /> Report Information (PDF Meta)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {/* Report No */}
            {isFieldVisible('report_no') && (
              <div>
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1.5">
                  <Hash className="w-3.5 h-3.5 text-[#168B57]" /> Report No
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    value={form.report_no || ''}
                    onChange={e => setForm({ ...form, report_no: e.target.value })}
                    placeholder="e.g. KAL-4412"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-mono font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs"
                  />
                </div>
              </div>
            )}

            {/* Date */}
            {isFieldVisible('sample_date') && (
              <div>
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#168B57]" /> Date *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={form.sample_date}
                    onChange={e => setForm({ ...form, sample_date: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Customer Name */}
            {isFieldVisible('party_name') && (
              <div>
                <CustomerAutocomplete
                  label="Customer Name"
                  value={form.company_name}
                  onChange={v => setForm(f => ({ ...f, company_name: v, party_name: v, customer_name: v }))}
                  onSelect={c => setForm(f => ({ ...f, company_name: c.name, party_name: c.name, customer_name: c.name, address: c.address || f.address }))}
                  placeholder="Search or enter customer name..."
                />
              </div>
            )}

            {/* Address */}
            {isFieldVisible('party_name') && (
              <div>
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#168B57]" /> Address <span className="text-[10px] text-gray-400 font-normal">(optional / auto-fetched)</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    value={form.address || ''}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    placeholder="e.g. 182-B, Main Road, Kangeyam (auto-fetched from party if available)"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs"
                  />
                </div>
              </div>
            )}

            {/* Sample Name */}
            {isFieldVisible('sample_name') && (
              <div>
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1.5">
                  <FlaskConical className="w-3.5 h-3.5 text-[#168B57]" /> Sample Name
                </label>
                <div className="relative">
                  <FlaskConical className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    list="edit-list-sample_name"
                    value={form.sample_name}
                    onChange={e => setForm({ ...form, sample_name: e.target.value })}
                    placeholder="e.g. CATTLE FEED, GHEE, WATER"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs"
                  />
                  <datalist id="edit-list-sample_name">
                    {(suggestions.sample_name || []).map((item, idx) => (
                      <option key={idx} value={item} />
                    ))}
                  </datalist>
                </div>
              </div>
            )}

            {/* Vehicle No */}
            {isFieldVisible('vehicle_no') && (
              <div>
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#168B57]" /> Vehicle No
                </label>
                <div className="relative">
                  <Truck className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    list="edit-list-vehicle_no"
                    value={form.vehicle_no}
                    onChange={e => setForm({ ...form, vehicle_no: e.target.value })}
                    placeholder="e.g. TN 27 YY 3314"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 uppercase focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs"
                  />
                  <datalist id="edit-list-vehicle_no">
                    {(suggestions.vehicle_no || []).map((item, idx) => (
                      <option key={idx} value={item} />
                    ))}
                  </datalist>
                </div>
              </div>
            )}

            {/* Bill No */}
            {isFieldVisible('bill_no') && (
              <div>
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1.5">
                  <Hash className="w-3.5 h-3.5 text-[#168B57]" /> Bill No <span className="text-[10px] text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  list="edit-list-bill_no"
                  value={form.bill_no || ''}
                  onChange={e => setForm({ ...form, bill_no: e.target.value })}
                  placeholder="e.g. BL-1002"
                  className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs"
                />
                <datalist id="edit-list-bill_no">
                  {(suggestions.bill_no || []).map((item, idx) => (
                    <option key={idx} value={item} />
                  ))}
                </datalist>
              </div>
            )}

            {/* Quantity */}
            {isFieldVisible('bags_tons') && (
              <div>
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1.5">
                  <Package className="w-3.5 h-3.5 text-[#168B57]" /> {form.report_type?.quantity_label || 'Tons / Bags'}
                </label>
                <div className="relative">
                  <Package className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    list="edit-list-bags_tons"
                    value={form.bags_tons}
                    onChange={e => setForm({ ...form, bags_tons: e.target.value })}
                    placeholder={form.report_type?.quantity_label === 'Unit' ? 'e.g. 50 Units' : 'e.g. 40 Bags / 20 Tons'}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs"
                  />
                  <datalist id="edit-list-bags_tons">
                    {(suggestions.bags_tons || []).map((item, idx) => (
                      <option key={idx} value={item} />
                    ))}
                  </datalist>
                </div>
              </div>
            )}

            {/* Buyer */}
            {isFieldVisible('buyer') && (
              <div>
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#168B57]" /> Buyer
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    list="edit-list-buyer"
                    value={form.buyer}
                    onChange={e => setForm({ ...form, buyer: e.target.value })}
                    placeholder="e.g. ABC Foods Pvt Ltd"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs"
                  />
                  <datalist id="edit-list-buyer">
                    {(suggestions.buyer || []).map((item, idx) => (
                      <option key={idx} value={item} />
                    ))}
                  </datalist>
                </div>
              </div>
            )}

            {/* Seller */}
            {isFieldVisible('seller') && (
              <div>
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1.5">
                  <Store className="w-3.5 h-3.5 text-[#168B57]" /> Seller
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    list="edit-list-seller"
                    value={form.seller}
                    onChange={e => setForm({ ...form, seller: e.target.value })}
                    placeholder="e.g. XYZ Agro Traders"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs"
                  />
                  <datalist id="edit-list-seller">
                    {(suggestions.seller || []).map((item, idx) => (
                      <option key={idx} value={item} />
                    ))}
                  </datalist>
                </div>
              </div>
            )}

            {/* Depositer Name */}
            {isFieldVisible('depositor_name') && (
              <div>
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1.5">
                  <User className="w-3.5 h-3.5 text-[#168B57]" /> Depositer Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    list="edit-list-depositor_name"
                    value={form.depositor_name || ''}
                    onChange={e => setForm({ ...form, depositor_name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs"
                  />
                  <datalist id="edit-list-depositor_name">
                    {(suggestions.depositor_name || []).map((item, idx) => (
                      <option key={idx} value={item} />
                    ))}
                  </datalist>
                </div>
              </div>
            )}

            {/* CID No */}
            {isFieldVisible('cid_no') && (
              <div>
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1.5">
                  <Hash className="w-3.5 h-3.5 text-[#168B57]" /> CID No
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    list="edit-list-cid_no"
                    value={form.cid_no || ''}
                    onChange={e => setForm({ ...form, cid_no: e.target.value })}
                    placeholder="e.g. CID-8849"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs"
                  />
                  <datalist id="edit-list-cid_no">
                    {(suggestions.cid_no || []).map((item, idx) => (
                      <option key={idx} value={item} />
                    ))}
                  </datalist>
                </div>
              </div>
            )}

            {/* SI No */}
            {isFieldVisible('si_no') && (
              <div>
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1.5">
                  <Hash className="w-3.5 h-3.5 text-[#168B57]" /> SI No
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    list="edit-list-si_no"
                    value={form.si_no || ''}
                    onChange={e => setForm({ ...form, si_no: e.target.value })}
                    placeholder="e.g. SI-102"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs"
                  />
                  <datalist id="edit-list-si_no">
                    {(suggestions.si_no || []).map((item, idx) => (
                      <option key={idx} value={item} />
                    ))}
                  </datalist>
                </div>
              </div>
            )}

            {/* Lot No */}
            {isFieldVisible('lot_no') && (
              <div>
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#168B57]" /> Lot No
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    list="edit-list-lot_no"
                    value={form.lot_no || ''}
                    onChange={e => setForm({ ...form, lot_no: e.target.value })}
                    placeholder="e.g. LOT-2026/04"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 uppercase focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs"
                  />
                  <datalist id="edit-list-lot_no">
                    {(suggestions.lot_no || []).map((item, idx) => (
                      <option key={idx} value={item} />
                    ))}
                  </datalist>
                </div>
              </div>
            )}

            {/* Nature of Sample */}
            {isFieldVisible('nature_of_sample') && (
              <div>
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1.5">
                  <ClipboardList className="w-3.5 h-3.5 text-[#168B57]" /> Nature of Sample
                </label>
                <div className="relative">
                  <ClipboardList className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    list="edit-list-nature_of_sample"
                    value={form.nature_of_sample}
                    onChange={e => setForm({ ...form, nature_of_sample: e.target.value })}
                    placeholder="e.g. Solid Pellet / Liquid / Powder"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs"
                  />
                  <datalist id="edit-list-nature_of_sample">
                    {(suggestions.nature_of_sample || []).map((item, idx) => (
                      <option key={idx} value={item} />
                    ))}
                  </datalist>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Test Results */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-xs font-black text-[#0B6B43] uppercase tracking-wider">
            Test Results {showSpecEdit ? '' : '(Specification hidden)'}
          </h3>
          {(() => {
            const activeTableCols = getDefaultTableColumns(form.report_type || {}).filter(c => c.visible !== false);
            return (
              <div className="mt-3 overflow-hidden border border-gray-200/80 rounded-2xl shadow-sm bg-white">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#EFEAFD] text-[11px] uppercase font-bold text-[#7A709E] border-b border-purple-100/60">
                      {activeTableCols.map(col => {
                        const cAlign = col.align || (col.key === 'parameter' ? 'left' : 'center');
                        return (
                          <th
                            key={col.key}
                            style={{ textAlign: cAlign }}
                            className={`py-3 px-3.5 ${col.key === 's_no' ? 'w-12' : (col.key === 'result' ? 'w-36' : '')}`}
                          >
                            {col.label}
                          </th>
                        );
                      })}
                      <th className="py-3 px-3.5 w-16 text-center">Include</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {results.map((r, i) => {
                      const on = r.enabled !== false;
                      const sno = results.slice(0, i).filter(x => x.enabled !== false).length + (on ? 1 : 0);
                      return (
                        <tr key={r.parameter_id} className={on ? 'hover:bg-emerald-50/30 transition-colors' : 'bg-gray-50/60 opacity-60'}>
                          {activeTableCols.map(col => {
                            const cAlign = col.align || (col.key === 'parameter' ? 'left' : 'center');
                            if (col.key === 's_no') {
                              return (
                                <td key={col.key} style={{ textAlign: cAlign }} className="py-2.5 px-3.5 font-bold text-gray-500">
                                  {on ? `${sno}.` : '—'}
                                </td>
                              );
                            }
                            if (col.key === 'parameter') {
                              return (
                                <td key={col.key} style={{ textAlign: cAlign }} className="py-2.5 px-3.5 font-bold text-gray-900">
                                  {r.name}
                                </td>
                              );
                            }
                            if (col.key === 'specification') {
                              return (
                                <td key={col.key} className="py-2.5 px-3.5">
                                  <input
                                    value={r.specification}
                                    disabled={!on}
                                    onChange={e => {
                                      const c = [...results];
                                      c[i].specification = e.target.value;
                                      setResults(c);
                                    }}
                                    style={{ textAlign: cAlign }}
                                    className="w-full px-3 py-1.5 bg-gray-50/70 border border-gray-200/90 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all disabled:bg-gray-100 disabled:text-gray-400"
                                  />
                                </td>
                              );
                            }
                            if (col.key === 'result') {
                              const hasAffix = col.affix_type && col.affix_type !== 'none' && col.affix_value;
                              const isAffixOn = r.affix_toggles?.['result'] !== false;
                              const displayAffix = col.affix_value || r.unit || '';
                              return (
                                <td key={col.key} className="py-2.5 px-3.5">
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      value={r.result}
                                      disabled={!on}
                                      onChange={e => {
                                        const c = [...results];
                                        c[i].result = e.target.value;
                                        setResults(c);
                                      }}
                                      placeholder="-"
                                      style={{ textAlign: cAlign }}
                                      className="w-full px-3 py-1.5 bg-gray-50/70 border border-gray-200/90 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all disabled:bg-gray-100 disabled:text-gray-400"
                                    />
                                    {hasAffix && (
                                      <button
                                        type="button"
                                        onClick={() => toggleRowAffix(i, 'result')}
                                        disabled={!on}
                                        title={isAffixOn ? `Affix "${col.affix_value}" ON for this row (Click to turn OFF)` : `Affix "${col.affix_value}" OFF for this row (Click to turn ON)`}
                                        className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-all shrink-0 select-none shadow-2xs ${
                                          isAffixOn
                                            ? 'bg-emerald-50 text-[#0B6B43] border-emerald-300'
                                            : 'bg-gray-100 text-gray-400 border-gray-300 line-through'
                                        }`}
                                      >
                                        {col.affix_value}
                                      </button>
                                    )}
                                    {!hasAffix && displayAffix && (
                                      <span className="text-[11px] font-bold text-[#168B57] shrink-0 px-1">{displayAffix}</span>
                                    )}
                                  </div>
                                </td>
                              );
                            }
                            // Custom column
                            const customVal = r.custom_values?.[col.label] ?? (r.custom_values?.[col.key] ?? '');
                            const hasAffix = col.affix_type && col.affix_type !== 'none' && col.affix_value;
                            const isAffixOn = r.affix_toggles?.[col.key || col.label] !== false;
                            return (
                              <td key={col.key} className="py-2.5 px-3.5">
                                <div className="flex items-center gap-1.5">
                                  <input
                                    value={customVal}
                                    disabled={!on}
                                    onChange={e => updateCustomValue(i, col.label, e.target.value)}
                                    placeholder="-"
                                    style={{ textAlign: cAlign }}
                                    className="w-full px-3 py-1.5 bg-gray-50/70 border border-gray-200/90 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all disabled:bg-gray-100 disabled:text-gray-400"
                                  />
                                  {hasAffix && (
                                    <button
                                      type="button"
                                      onClick={() => toggleRowAffix(i, col.key || col.label)}
                                      disabled={!on}
                                      title={isAffixOn ? `Affix "${col.affix_value}" ON for this row (Click to turn OFF)` : `Affix "${col.affix_value}" OFF for this row (Click to turn ON)`}
                                      className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-all shrink-0 select-none shadow-2xs ${
                                        isAffixOn
                                          ? 'bg-emerald-50 text-[#0B6B43] border-emerald-300'
                                          : 'bg-gray-100 text-gray-400 border-gray-300 line-through'
                                      }`}
                                    >
                                      {col.affix_value}
                                    </button>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                          <td className="py-2.5 px-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={on}
                              onChange={() => {
                                const c = [...results];
                                c[i] = { ...c[i], enabled: !on };
                                setResults(c);
                              }}
                              title={on ? 'Included in report & PDF' : 'Excluded from report & PDF'}
                              className="w-4 h-4 rounded text-[#168B57] focus:ring-[#168B57] accent-[#168B57] cursor-pointer"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>

        {/* Remarks (Separately at the bottom with ON/OFF Checkbox) */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <label className="text-xs font-bold text-gray-800 flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={enableRemarks}
                onChange={e => {
                  const on = e.target.checked;
                  setEnableRemarks(on);
                  if (on && (!form.remarks || form.remarks.trim() === '')) {
                    setForm(f => ({ ...f, remarks: form.report_type?.default_remarks || 'The difference between the RM Test and the RM Double Wash Test results should be within 2. If the difference is within this specified limit, the sample will be considered as Pass. If it exceeds this limit, the sample will be considered as Fail.' }));
                  }
                }}
                className="w-4 h-4 rounded text-[#168B57] focus:ring-[#168B57] accent-[#168B57]"
              />
              <MessageSquare className="w-4 h-4 text-[#168B57]" />
              <span>Remarks {enableRemarks ? <span className="text-[10px] text-[#0B6B43] font-bold">(ON - Included in PDF)</span> : <span className="text-[10px] text-gray-400 font-normal">(OFF - Excluded from PDF)</span>}</span>
            </label>
            {enableRemarks && (
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, remarks: 'The difference between the RM Test and the RM Double Wash Test results should be within 2. If the difference is within this specified limit, the sample will be considered as Pass. If it exceeds this limit, the sample will be considered as Fail.' }))}
                className="text-[11px] font-bold text-[#0B6B43] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-xl transition-all shadow-2xs"
                title="Insert standard RM Test comparison note"
              >
                + RM Test Note
              </button>
            )}
          </div>
          {enableRemarks && (
            <div className="relative mt-2">
              <MessageSquare className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
              <textarea
                rows={2}
                value={form.remarks || ''}
                onChange={e => setForm({ ...form, remarks: e.target.value })}
                placeholder="e.g. The difference between the RM Test and the RM Double Wash Test results should be within 2..."
                className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs resize-y"
              />
            </div>
          )}
        </div>

        {/* Notes (Separately at the bottom with ON/OFF Checkbox) */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <label className="text-xs font-bold text-gray-800 flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={enableNotes}
                onChange={e => {
                  const on = e.target.checked;
                  setEnableNotes(on);
                  if (on && (!form.notes || form.notes.trim() === '')) {
                    setForm(f => ({ ...f, notes: form.report_type?.default_notes || '' }));
                  }
                }}
                className="w-4 h-4 rounded text-[#168B57] focus:ring-[#168B57] accent-[#168B57]"
              />
              <MessageSquare className="w-4 h-4 text-[#168B57]" />
              <span>Notes {enableNotes ? <span className="text-[10px] text-[#0B6B43] font-bold">(ON - Included in PDF)</span> : <span className="text-[10px] text-gray-400 font-normal">(OFF - Excluded from PDF)</span>}</span>
            </label>
          </div>
          {enableNotes && (
            <div className="relative mt-2">
              <MessageSquare className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
              <textarea
                rows={2}
                value={form.notes || ''}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="e.g. Terms & conditions or specific notes for this report..."
                className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs resize-y"
              />
            </div>
          )}
        </div>

        {/* Linked Invoice Overview */}
        {invoice && (
          <div className="border border-emerald-200/80 rounded-3xl p-5 bg-gradient-to-br from-emerald-50/50 to-emerald-50/10 space-y-4 shadow-sm">
            <h3 className="text-xs font-black text-[#0B6B43] uppercase tracking-wider">Linked Invoice — {invoice.invoice_no}</h3>
            <div className={`grid gap-3 text-xs ${invoice.gst_enabled ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <div className="bg-white border border-gray-100 rounded-2xl p-3.5 text-center shadow-2xs">
                <p className="text-gray-400 font-medium text-[11px]">Subtotal</p>
                <p className="font-extrabold text-sm text-gray-900 mt-0.5">₹{Number(invoice.subtotal).toFixed(2)}</p>
              </div>
              {invoice.gst_enabled && (
                <div className="bg-white border border-gray-100 rounded-2xl p-3.5 text-center shadow-2xs">
                  <p className="text-gray-400 font-medium text-[11px]">GST ({invoice.gst_percent}%)</p>
                  <p className="font-extrabold text-sm text-gray-900 mt-0.5">₹{Number(invoice.gst_amount).toFixed(2)}</p>
                </div>
              )}
              <div className="bg-gradient-to-r from-[#168B57] to-[#0B6B43] text-white rounded-2xl p-3.5 text-center shadow-2xs">
                <p className="opacity-80 text-[11px] font-medium">Total Amount</p>
                <p className="font-extrabold text-sm mt-0.5">₹{Number(invoice.total_amount).toFixed(2)}</p>
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
              <input
                type="checkbox"
                checked={!!invoice.gst_enabled}
                disabled={isDemo}
                onChange={async e => {
                  try {
                    const r = await api.put(`/reports/${reportId}/invoice/gst`, { gst_enabled: e.target.checked });
                    setInvoice(r.data);
                  } catch {}
                }}
                className="w-4 h-4 rounded text-[#168B57] focus:ring-[#168B57] accent-[#168B57]"
              />
              GST Enabled (Auto-calculates {invoice.gst_percent || 18}% GST)
            </label>
          </div>
        )}

        <div className="flex gap-3 pt-3 border-t border-gray-100">
          <button
            disabled={saving || isDemo}
            onClick={save}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#168B57] to-[#0B6B43] hover:from-[#0B6B43] hover:to-[#168B57] text-white font-bold text-xs shadow-[0_4px_14px_rgba(22,139,87,0.25)] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Update Report'}
          </button>
          <button
            onClick={() => setActiveTab('view-report')}
            className="px-6 py-2.5 rounded-2xl bg-white border border-gray-200 font-bold text-xs text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
