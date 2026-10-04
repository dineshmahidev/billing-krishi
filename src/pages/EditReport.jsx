import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../components/common/Toast';
import { CustomerAutocomplete } from '../components/common/CustomerAutocomplete';
import { getDefaultTableColumns } from './admin/ReportTypes';
import {
  Calendar, Building2, FlaskConical, Truck, Package, Hash,
  FileText, UserCheck, Store, ClipboardList, MessageSquare
} from 'lucide-react';

export const EditReport = ({ reportId, setActiveTab, setSelectedReportId }) => {
  const { addToast } = useToast();
  const [form, setForm] = useState(null);
  const [results, setResults] = useState([]);
  const [saving, setSaving] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [enableRemarks, setEnableRemarks] = useState(true);
  const [enableNotes, setEnableNotes] = useState(true);

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
      <div>
        <h1 className="text-xl font-bold text-[#1F2937]">Edit Report — {form.report_no}</h1>
        <p className="text-xs text-[#6B7280]">{form.report_type?.name} • {form.report_type?.title}</p>
      </div>

      <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-5 space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
        <div>
          <h3 className="text-xs font-bold text-[#0B6B43] uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Report Information (PDF Meta)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3">
            {/* Report No */}
            {isFieldVisible('report_no') && (
              <div>
                <label className="text-xs font-semibold text-[#1F2937] flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-[#168B57]" /> Report No
                </label>
                <div className="relative mt-1">
                  <Hash className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={form.report_no || ''}
                    onChange={e => setForm({ ...form, report_no: e.target.value })}
                    placeholder="e.g. KAL-4412"
                    className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white font-mono font-medium"
                  />
                </div>
              </div>
            )}

            {/* Date */}
            {isFieldVisible('sample_date') && (
              <div>
                <label className="text-xs font-semibold text-[#1F2937] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#168B57]" /> Date *
                </label>
                <div className="relative mt-1">
                  <Calendar className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={form.sample_date}
                    onChange={e => setForm({ ...form, sample_date: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white"
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
                <label className="text-xs font-semibold text-[#1F2937] flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-[#168B57]" /> Address <span className="text-[10px] text-[#6B7280] font-normal">(optional / auto-fetched)</span>
                </label>
                <div className="relative mt-1">
                  <Building2 className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={form.address || ''}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    placeholder="e.g. 182-B, Main Road, Kangeyam (auto-fetched from party if available)"
                    className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white"
                  />
                </div>
              </div>
            )}

            {/* Sample Name */}
            {isFieldVisible('sample_name') && (
              <div>
                <label className="text-xs font-semibold text-[#1F2937] flex items-center gap-1">
                  <FlaskConical className="w-3.5 h-3.5 text-[#168B57]" /> Sample Name
                </label>
                <div className="relative mt-1">
                  <FlaskConical className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={form.sample_name}
                    onChange={e => setForm({ ...form, sample_name: e.target.value })}
                    placeholder="e.g. CATTLE FEED, GHEE, WATER"
                    className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white"
                  />
                </div>
              </div>
            )}

            {/* Vehicle No */}
            {isFieldVisible('vehicle_no') && (
              <div>
                <label className="text-xs font-semibold text-[#1F2937] flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#168B57]" /> Vehicle No
                </label>
                <div className="relative mt-1">
                  <Truck className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={form.vehicle_no}
                    onChange={e => setForm({ ...form, vehicle_no: e.target.value })}
                    placeholder="e.g. TN 27 YY 3314"
                    className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white uppercase"
                  />
                </div>
              </div>
            )}

            {/* Bill No */}
            {isFieldVisible('bill_no') && (
              <div>
                <label className="text-xs font-semibold text-[#1F2937] flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-[#168B57]" /> Bill No <span className="text-[10px] text-[#6B7280] font-normal">(optional)</span>
                </label>
                <input
                  value={form.bill_no || ''}
                  onChange={e => setForm({ ...form, bill_no: e.target.value })}
                  placeholder="e.g. BL-1002"
                  className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white"
                />
              </div>
            )}

            {/* Quantity */}
            {isFieldVisible('bags_tons') && (
              <div>
                <label className="text-xs font-semibold text-[#1F2937] flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-[#168B57]" /> {form.report_type?.quantity_label || 'Tons / Bags'}
                </label>
                <div className="relative mt-1">
                  <Package className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={form.bags_tons}
                    onChange={e => setForm({ ...form, bags_tons: e.target.value })}
                    placeholder={form.report_type?.quantity_label === 'Unit' ? 'e.g. 50 Units' : 'e.g. 40 Bags / 20 Tons'}
                    className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white"
                  />
                </div>
              </div>
            )}

            {/* Buyer */}
            {isFieldVisible('buyer') && (
              <div>
                <label className="text-xs font-semibold text-[#1F2937] flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-[#168B57]" /> Buyer
                </label>
                <div className="relative mt-1">
                  <UserCheck className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={form.buyer}
                    onChange={e => setForm({ ...form, buyer: e.target.value })}
                    placeholder="e.g. ABC Foods Pvt Ltd"
                    className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white"
                  />
                </div>
              </div>
            )}

            {/* Seller */}
            {isFieldVisible('seller') && (
              <div>
                <label className="text-xs font-semibold text-[#1F2937] flex items-center gap-1">
                  <Store className="w-3.5 h-3.5 text-[#168B57]" /> Seller
                </label>
                <div className="relative mt-1">
                  <Store className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={form.seller}
                    onChange={e => setForm({ ...form, seller: e.target.value })}
                    placeholder="e.g. XYZ Agro Traders"
                    className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white"
                  />
                </div>
              </div>
            )}

            {/* Nature of Sample */}
            {isFieldVisible('nature_of_sample') && (
              <div>
                <label className="text-xs font-semibold text-[#1F2937] flex items-center gap-1">
                  <ClipboardList className="w-3.5 h-3.5 text-[#168B57]" /> Nature of Sample
                </label>
                <div className="relative mt-1">
                  <ClipboardList className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={form.nature_of_sample}
                    onChange={e => setForm({ ...form, nature_of_sample: e.target.value })}
                    placeholder="e.g. Solid Pellet / Liquid / Powder"
                    className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Test Results */}
        <div className="pt-3 border-t border-[#D1D5DB]/60">
          <h3 className="text-xs font-bold text-[#0B6B43] uppercase tracking-wider">
            Test Results {showSpecEdit ? '' : '(Specification hidden)'}
          </h3>
          {(() => {
            const activeTableCols = getDefaultTableColumns(form.report_type || {}).filter(c => c.visible !== false);
            return (
              <div className="mt-3 overflow-x-auto border border-[#D1D5DB] rounded-xl shadow-sm">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#EAF7F0] text-[11px] uppercase font-bold text-[#6B7280] border-b border-[#D1D5DB]">
                      {activeTableCols.map(col => {
                        const cAlign = col.align || (col.key === 'parameter' ? 'left' : 'center');
                        return (
                          <th
                            key={col.key}
                            style={{ textAlign: cAlign }}
                            className={`py-2.5 px-3 ${col.key === 's_no' ? 'w-10' : (col.key === 'result' ? 'w-32' : '')}`}
                          >
                            {col.label}
                          </th>
                        );
                      })}
                      <th className="py-2.5 px-3 w-16 text-center">Include</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D1D5DB]/60 bg-white">
                    {results.map((r, i) => {
                      const on = r.enabled !== false;
                      const sno = results.slice(0, i).filter(x => x.enabled !== false).length + (on ? 1 : 0);
                      return (
                        <tr key={r.parameter_id} className={on ? 'hover:bg-[#EAF7F0]/30' : 'bg-[#F3F4F6] opacity-60'}>
                          {activeTableCols.map(col => {
                            const cAlign = col.align || (col.key === 'parameter' ? 'left' : 'center');
                            if (col.key === 's_no') {
                              return (
                                <td key={col.key} style={{ textAlign: cAlign }} className="py-2 px-3 font-bold text-[#6B7280]">
                                  {on ? `${sno}.` : '—'}
                                </td>
                              );
                            }
                            if (col.key === 'parameter') {
                              return (
                                <td key={col.key} style={{ textAlign: cAlign }} className="py-2 px-3 font-bold text-[#1F2937]">
                                  {r.name}
                                </td>
                              );
                            }
                            if (col.key === 'specification') {
                              return (
                                <td key={col.key} className="py-2 px-3">
                                  <input
                                    value={r.specification}
                                    disabled={!on}
                                    onChange={e => {
                                      const c = [...results];
                                      c[i].specification = e.target.value;
                                      setResults(c);
                                    }}
                                    style={{ textAlign: cAlign }}
                                    className="w-full px-2.5 py-1.5 border border-[#D1D5DB] rounded-lg text-xs bg-[#F9FAFB] disabled:bg-[#F3F4F6]"
                                  />
                                </td>
                              );
                            }
                            if (col.key === 'result') {
                              const hasAffix = col.affix_type && col.affix_type !== 'none' && col.affix_value;
                              const isAffixOn = r.affix_toggles?.['result'] !== false;
                              const displayAffix = col.affix_value || r.unit || '';
                              return (
                                <td key={col.key} className="py-2 px-3">
                                  <div className="flex items-center gap-1">
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
                                      className="w-full px-2.5 py-1.5 border border-[#D1D5DB] rounded-lg text-xs font-medium disabled:bg-[#F3F4F6]"
                                    />
                                    {hasAffix && (
                                      <button
                                        type="button"
                                        onClick={() => toggleRowAffix(i, 'result')}
                                        disabled={!on}
                                        title={isAffixOn ? `Affix "${col.affix_value}" ON for this row (Click to turn OFF)` : `Affix "${col.affix_value}" OFF for this row (Click to turn ON)`}
                                        className={`px-1.5 py-1 rounded text-[11px] font-bold border transition-colors shrink-0 select-none ${
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
                              <td key={col.key} className="py-2 px-3">
                                <div className="flex items-center gap-1">
                                  <input
                                    value={customVal}
                                    disabled={!on}
                                    onChange={e => updateCustomValue(i, col.label, e.target.value)}
                                    placeholder="-"
                                    style={{ textAlign: cAlign }}
                                    className="w-full px-2.5 py-1.5 border border-[#D1D5DB] rounded-lg text-xs bg-[#F9FAFB] disabled:bg-[#F3F4F6]"
                                  />
                                  {hasAffix && (
                                    <button
                                      type="button"
                                      onClick={() => toggleRowAffix(i, col.key || col.label)}
                                      disabled={!on}
                                      title={isAffixOn ? `Affix "${col.affix_value}" ON for this row (Click to turn OFF)` : `Affix "${col.affix_value}" OFF for this row (Click to turn ON)`}
                                      className={`px-1.5 py-1 rounded text-[11px] font-bold border transition-colors shrink-0 select-none ${
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
                          <td className="py-2 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={on}
                              onChange={() => {
                                const c = [...results];
                                c[i] = { ...c[i], enabled: !on };
                                setResults(c);
                              }}
                              title={on ? 'Included in report & PDF' : 'Excluded from report & PDF'}
                              className="w-4 h-4 accent-[#168B57] cursor-pointer"
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
        <div className="pt-3 border-t border-[#D1D5DB]/60">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <label className="text-xs font-bold text-[#1F2937] flex items-center gap-2 cursor-pointer select-none">
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
              <MessageSquare className="w-3.5 h-3.5 text-[#168B57]" />
              <span>Remarks {enableRemarks ? <span className="text-[10px] text-[#0B6B43] font-semibold">(ON - Included in PDF)</span> : <span className="text-[10px] text-[#6B7280] font-normal">(OFF - Excluded from PDF)</span>}</span>
            </label>
            {enableRemarks && (
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, remarks: 'The difference between the RM Test and the RM Double Wash Test results should be within 2. If the difference is within this specified limit, the sample will be considered as Pass. If it exceeds this limit, the sample will be considered as Fail.' }))}
                className="text-[11px] font-bold text-[#0B6B43] bg-[#EAF7F0] hover:bg-[#D1E7DD] border border-[#86C1A4] px-2.5 py-0.5 rounded-lg transition-colors"
                title="Insert standard RM Test comparison note"
              >
                + RM Test Note
              </button>
            )}
          </div>
          {enableRemarks && (
            <div className="relative mt-1">
              <MessageSquare className="w-4 h-4 text-[#6B7280] absolute left-3 top-2.5" />
              <textarea
                rows={2}
                value={form.remarks || ''}
                onChange={e => setForm({ ...form, remarks: e.target.value })}
                placeholder="e.g. The difference between the RM Test and the RM Double Wash Test results should be within 2..."
                className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white resize-y text-[#1F2937]"
              />
            </div>
          )}
        </div>

        {/* Notes (Separately at the bottom with ON/OFF Checkbox) */}
        <div className="pt-3 border-t border-[#D1D5DB]/60">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <label className="text-xs font-bold text-[#1F2937] flex items-center gap-2 cursor-pointer select-none">
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
              <MessageSquare className="w-3.5 h-3.5 text-[#168B57]" />
              <span>Notes {enableNotes ? <span className="text-[10px] text-[#0B6B43] font-semibold">(ON - Included in PDF)</span> : <span className="text-[10px] text-[#6B7280] font-normal">(OFF - Excluded from PDF)</span>}</span>
            </label>
          </div>
          {enableNotes && (
            <div className="relative mt-1">
              <MessageSquare className="w-4 h-4 text-[#6B7280] absolute left-3 top-2.5" />
              <textarea
                rows={2}
                value={form.notes || ''}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="e.g. Terms & conditions or specific notes for this report..."
                className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white resize-y text-[#1F2937]"
              />
            </div>
          )}
        </div>

        {/* Linked Invoice Overview */}
        {invoice && (
          <div className="border-2 border-[#168B57]/30 rounded-2xl p-4 bg-[#EAF7F0]/30 space-y-3">
            <h3 className="text-xs font-bold text-[#0B6B43]">Linked Invoice — {invoice.invoice_no}</h3>
            <div className={`grid gap-3 text-xs ${invoice.gst_enabled ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <div className="bg-white border border-[#D1D5DB] rounded-xl p-3 text-center">
                <p className="text-[#6B7280]">Subtotal</p>
                <p className="font-bold text-sm">₹{Number(invoice.subtotal).toFixed(2)}</p>
              </div>
              {invoice.gst_enabled && (
                <div className="bg-white border border-[#D1D5DB] rounded-xl p-3 text-center">
                  <p className="text-[#6B7280]">GST ({invoice.gst_percent}%)</p>
                  <p className="font-bold text-sm">₹{Number(invoice.gst_amount).toFixed(2)}</p>
                </div>
              )}
              <div className="bg-[#0B6B43] text-white rounded-xl p-3 text-center">
                <p className="opacity-80">Total Amount</p>
                <p className="font-bold text-sm">₹{Number(invoice.total_amount).toFixed(2)}</p>
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-[#1F2937] cursor-pointer">
              <input
                type="checkbox"
                checked={!!invoice.gst_enabled}
                onChange={async e => {
                  try {
                    const r = await api.put(`/reports/${reportId}/invoice/gst`, { gst_enabled: e.target.checked });
                    setInvoice(r.data);
                  } catch {}
                }}
                className="w-4 h-4 accent-[#168B57]"
              />
              GST Enabled (Auto-calculates {invoice.gst_percent || 18}% GST)
            </label>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            disabled={saving}
            onClick={save}
            className="px-5 py-2.5 rounded-xl bg-[#168B57] hover:bg-[#0B6B43] transition-colors text-white font-bold text-xs disabled:opacity-60 shadow-sm"
          >
            {saving ? 'Saving...' : 'Update Report'}
          </button>
          <button
            onClick={() => setActiveTab('view-report')}
            className="px-5 py-2.5 rounded-xl bg-white border border-[#D1D5DB] font-bold text-xs hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
