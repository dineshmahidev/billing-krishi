import React, { useEffect, useState } from 'react';
import api, { openPdf } from '../services/api';
import { useToast } from '../components/common/Toast';
import { CustomerAutocomplete } from '../components/common/CustomerAutocomplete';
import { Calendar, Building2, FlaskConical, Truck, Package, Layers, Hash, FileText } from 'lucide-react';

export const NewReport = ({ setActiveTab, setSelectedReportId }) => {
  const { addToast } = useToast();
  const [types, setTypes] = useState([]);
  const [params, setParams] = useState([]);
  const [loadingParams, setLoadingParams] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    report_type_id: '',
    sample_date: new Date().toISOString().split('T')[0],
    company_name: '',
    party_name: '',
    customer_name: '',
    sample_name: '',
    vehicle_no: '',
    report_no: '',
    bill_no: '',
    bags_tons: '',
  });
  const [results, setResults] = useState([]);

  useEffect(()=>{
    api.get('/report-types?active=1')
      .then(r => setTypes((r.data || []).filter(t => t.active !== false)))
      .catch(()=>{});
  }, []);

  const loadParams = async (typeId) => {
    if (!typeId) { setParams([]); setResults([]); return; }
    setLoadingParams(true);
    try {
      const res = await api.get(`/report-types/${typeId}/parameters`);
      setParams(res.data);
      setResults(res.data.map(p => ({
        parameter_id: p.id,
        result: '',
        specification: p.specification || '',
        name: p.name,
        unit: p.unit,
        enabled: true,
      })));
    } catch {
      setParams([]);
      setResults([]);
    } finally {
      setLoadingParams(false);
    }
  };

  const onTypeChange = (e) => {
    const v = e.target.value;
    setForm(f => ({ ...f, report_type_id: v }));
    loadParams(v);
  };

  const updateResult = (idx, val) => {
    setResults(r => {
      const copy = [...r];
      copy[idx] = { ...copy[idx], result: val };
      return copy;
    });
  };

  const updateSpec = (idx, val) => {
    setResults(r => {
      const copy = [...r];
      copy[idx] = { ...copy[idx], specification: val };
      return copy;
    });
  };

  const toggleEnabled = (idx) => {
    setResults(r => {
      const copy = [...r];
      copy[idx] = { ...copy[idx], enabled: !(copy[idx].enabled !== false) };
      return copy;
    });
  };

  const validate = () => {
    if (!form.report_type_id) { addToast('Report Type required', 'error'); return false; }
    if (!form.sample_date) { addToast('Date required', 'error'); return false; }
    if (!form.company_name && !form.party_name && !form.customer_name && !form.sample_name) {
      addToast('Party Name or Sample Name required', 'error');
      return false;
    }
    return true;
  };

  const save = async (andPdf = false) => {
    if (!validate()) return;
    setSaving(true);
    try {
      const party = form.company_name || form.party_name || form.customer_name;
      const payload = {
        ...form,
        party_name: party,
        customer_name: party,
        coa_date: form.sample_date,
        results: results.map(r => ({
          parameter_id: r.parameter_id,
          result: r.result || '-',
          specification: r.specification,
          enabled: r.enabled !== false,
        })),
      };
      delete payload.company_name;
      if (!payload.report_no) delete payload.report_no;
      if (!payload.bill_no) delete payload.bill_no;

      const res = await api.post('/reports', payload);
      addToast(`Report ${res.data.report_no} saved successfully`);
      if (andPdf) {
        await openPdf(res.data.id);
      }
      setSelectedReportId(res.data.id);
      setActiveTab('view-report');
    } catch (e) {
      addToast(e.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const selectedType = types.find(t => String(t.id) === String(form.report_type_id));
  const showSpec = selectedType ? (selectedType.show_specification ?? true) : true;

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-[#1F2937]">New Report</h1>
        <p className="text-xs text-[#6B7280]">Fill in details matching the official Certificate of Analysis format</p>
      </div>

      <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-5 space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
        <div>
          <label className="text-xs font-bold text-[#1F2937] flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#168B57]" /> Report Type *
          </label>
          <div className="relative mt-1">
            <Layers className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={form.report_type_id}
              onChange={onTypeChange}
              className="w-full pl-9 pr-3 py-2.5 border border-[#D1D5DB] rounded-xl text-xs bg-white font-medium shadow-sm"
            >
              <option value="">-- Select Report Type --</option>
              {types.map(t => (
                <option key={t.id} value={t.id}>{t.name} — {t.title}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedType && (
          <>
            <div className="pt-3 border-t border-[#D1D5DB]/60">
              <h3 className="text-xs font-bold text-[#0B6B43] uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Report Information (PDF Meta)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3">
                {/* Date */}
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

                {/* Party Name */}
                <div>
                  <CustomerAutocomplete
                    label="Party Name"
                    placeholder="Search customer / enter new party name..."
                    value={form.company_name || form.party_name || form.customer_name}
                    onChange={v => setForm(f => ({ ...f, company_name: v, party_name: v, customer_name: v }))}
                    onSelect={c => setForm(f => ({ ...f, company_name: c.name, party_name: c.name, customer_name: c.name }))}
                  />
                </div>

                {/* Sample Name */}
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

                {/* Vehicle No */}
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

                {/* Bill No */}
                <div>
                  <label className="text-xs font-semibold text-[#1F2937] flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-[#168B57]" /> Bill No <span className="text-[10px] text-[#6B7280] font-normal">(optional)</span>
                  </label>
                  <input
                    value={form.bill_no}
                    onChange={e => setForm({ ...form, bill_no: e.target.value })}
                    placeholder="e.g. BL-1002"
                    className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white"
                  />
                </div>

                {/* Quantity / Tons / Bags */}
                <div>
                  <label className="text-xs font-semibold text-[#1F2937] flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-[#168B57]" /> {selectedType?.quantity_label || 'Tons / Bags'}
                  </label>
                  <div className="relative mt-1">
                    <Package className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      value={form.bags_tons}
                      onChange={e => setForm({ ...form, bags_tons: e.target.value })}
                      placeholder={
                        selectedType?.quantity_label === 'Unit'
                          ? 'e.g. 50 Units'
                          : (selectedType?.quantity_label === 'Tons'
                              ? 'e.g. 20 Tons'
                              : 'e.g. 40 Bags / 20 Tons')
                      }
                      className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white"
                    />
                  </div>
                </div>

                {/* Report No */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-[#1F2937] flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-[#168B57]" /> Report No <span className="text-[10px] text-[#168B57] font-normal">(leave blank for auto-generated number)</span>
                  </label>
                  <input
                    value={form.report_no}
                    onChange={e => setForm({ ...form, report_no: e.target.value })}
                    placeholder="Auto generated e.g. KLA-2026-0120"
                    className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs bg-white font-mono font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Test Results */}
            <div className="pt-3 border-t border-[#D1D5DB]/60">
              <h3 className="text-xs font-bold text-[#0B6B43] uppercase tracking-wider">
                Test Results {showSpec ? '' : '(Specification hidden)'}
              </h3>
              {loadingParams ? (
                <p className="text-xs text-[#6B7280] py-4">Loading parameters...</p>
              ) : (
                <div className="mt-3 overflow-x-auto border border-[#D1D5DB] rounded-xl shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#EAF7F0] text-[11px] uppercase font-bold text-[#6B7280] border-b border-[#D1D5DB]">
                        <th className="py-2.5 px-3 w-10 text-center">S.No</th>
                        <th className="py-2.5 px-3">Test Parameter</th>
                        <th className="py-2.5 px-3 w-32">Result</th>
                        {showSpec && <th className="py-2.5 px-3">Specification</th>}
                        <th className="py-2.5 px-3 w-16 text-center">Include</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D1D5DB]/60 bg-white">
                      {results.map((r, i) => {
                        const on = r.enabled !== false;
                        const sno = results.slice(0, i).filter(x => x.enabled !== false).length + (on ? 1 : 0);
                        return (
                          <tr key={r.parameter_id} className={on ? 'hover:bg-[#EAF7F0]/30' : 'bg-[#F3F4F6] opacity-60'}>
                            <td className="py-2 px-3 text-center font-bold text-[#6B7280]">{on ? `${sno}.` : '—'}</td>
                            <td className="py-2 px-3 font-bold text-[#1F2937]">{r.name}</td>
                            <td className="py-2 px-3">
                              <div className="relative">
                                <input
                                  value={r.result}
                                  disabled={!on}
                                  onChange={e => updateResult(i, e.target.value.replace('%', ''))}
                                  placeholder="-"
                                  className={`w-full px-2.5 py-1.5 border border-[#D1D5DB] rounded-lg text-xs font-medium disabled:bg-[#F3F4F6] ${r.unit === '%' ? 'pr-7' : ''}`}
                                />
                                {r.unit === '%' && (
                                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-[#168B57]">%</span>
                                )}
                                {r.unit && r.unit !== '%' && (
                                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#6B7280]">{r.unit}</span>
                                )}
                              </div>
                            </td>
                            {showSpec && (
                              <td className="py-2 px-3">
                                <input
                                  value={r.specification}
                                  disabled={!on}
                                  onChange={e => updateSpec(i, e.target.value)}
                                  className="w-full px-2.5 py-1.5 border border-[#D1D5DB] rounded-lg text-xs bg-[#F9FAFB] disabled:bg-[#F3F4F6]"
                                />
                              </td>
                            )}
                            <td className="py-2 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={on}
                                onChange={() => toggleEnabled(i)}
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
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-3 border-t border-[#D1D5DB]/60">
              <button
                disabled={saving}
                onClick={() => save(false)}
                className="px-5 py-2.5 rounded-xl bg-[#168B57] text-white font-bold text-xs hover:bg-[#0B6B43] transition-colors disabled:opacity-60 shadow-sm"
              >
                {saving ? 'Saving...' : 'Save Report'}
              </button>
              <button
                disabled={saving}
                onClick={() => save(true)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition-colors shadow-[0_4px_12px_rgba(245,158,11,0.3)] disabled:opacity-60"
              >
                Save &amp; Generate PDF
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
