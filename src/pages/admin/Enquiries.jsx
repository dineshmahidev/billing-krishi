import React, { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Search, RefreshCw, Eye, EyeOff, Globe, Users, TrendingUp, Mail, Phone, TestTube, ArrowUpRight } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const Enquiries = () => {
  const { isDemo } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [traffic, setTraffic] = useState({ total_visits: 0, today_visits: 0, unique_ips: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [enqRes, trafRes] = await Promise.all([
        api.get('/enquiries', { params: { search, type: typeFilter } }),
        api.get('/traffic/stats'),
      ]);
      setEnquiries(enqRes.data.data || enqRes.data || []);
      setTraffic(trafRes.data || { total_visits: 0, today_visits: 0, unique_ips: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, typeFilter]);

  const handleDelete = async (id) => {
    if (isDemo) {
      alert('Action blocked: Demo account is in Read-Only mode.');
      return;
    }
    if (!window.confirm('Delete this enquiry?')) return;
    try {
      await api.delete(`/enquiries/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete enquiry');
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-6">
      {isDemo && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between">
          <span>🔒 Demo Mode: Web enquiries and traffic metrics are in Read-Only mode.</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1F2937] flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#168B57]" /> Website Enquiries & Traffic
          </h1>
          <p className="text-xs text-[#6B7280]">View sample requests, contact enquiries, and visitor traffic analytics</p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#D1D5DB] rounded-xl text-xs font-bold text-[#1F2937] hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 text-[#168B57] ${loading ? 'animate-spin' : ''}`} /> Refresh Data
        </button>
      </div>

      {/* Traffic Stats Cards (matching Dashboard container UI) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-emerald-100/70 shadow-[0_4px_25px_rgba(22,139,87,0.03)] flex flex-col justify-between hover:shadow-md transition-all min-h-[168px]">
          <div className="flex items-start justify-between">
            <span className="text-[#168B57] text-xs font-black tracking-wider flex items-center gap-1.5 uppercase">
              TOTAL WEBSITE TRAFFIC <ArrowUpRight className="w-3.5 h-3.5 text-[#168B57]/60" />
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#EAF7F0] flex items-center justify-center text-[#168B57] shrink-0">
              <Globe className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <p className="text-4xl font-black text-gray-900 tracking-tight leading-none my-3">
            {traffic.total_visits?.toLocaleString() || 0}
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-gray-50">
            <span className="text-xs font-medium text-gray-400">
              Total page views
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-sky-100/70 shadow-[0_4px_25px_rgba(14,165,233,0.03)] flex flex-col justify-between hover:shadow-md transition-all min-h-[168px]">
          <div className="flex items-start justify-between">
            <span className="text-[#0284C7] text-xs font-black tracking-wider flex items-center gap-1.5 uppercase">
              TODAY&apos;S VISITORS <ArrowUpRight className="w-3.5 h-3.5 text-[#0284C7]/60" />
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#E0F2FE] flex items-center justify-center text-[#0284C7] shrink-0">
              <TrendingUp className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <p className="text-4xl font-black text-gray-900 tracking-tight leading-none my-3">
            {traffic.today_visits?.toLocaleString() || 0}
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-gray-50">
            <span className="text-xs font-medium text-gray-400">
              Visits today
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-purple-100/70 shadow-[0_4px_25px_rgba(139,92,246,0.03)] flex flex-col justify-between hover:shadow-md transition-all min-h-[168px]">
          <div className="flex items-start justify-between">
            <span className="text-[#8B5CF6] text-xs font-black tracking-wider flex items-center gap-1.5 uppercase">
              UNIQUE VISITORS <ArrowUpRight className="w-3.5 h-3.5 text-[#8B5CF6]/60" />
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#F3E8FF] flex items-center justify-center text-[#8B5CF6] shrink-0">
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <p className="text-4xl font-black text-gray-900 tracking-tight leading-none my-3">
            {traffic.unique_ips?.toLocaleString() || 0}
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-gray-50">
            <span className="text-xs font-medium text-gray-400">
              Unique IP addresses
            </span>
          </div>
        </div>
      </div>

      {/* Enquiries Section */}
      <div className="bg-white rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-white/80 p-5 space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, email..."
              className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-200/90 rounded-2xl px-3.5 py-2.5 text-xs font-medium bg-gray-50/70 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#168B57]/20 focus:border-[#168B57] focus:bg-white transition-all shadow-2xs"
            >
              <option value="">All Types</option>
              <option value="sample">Sample Test Requests</option>
              <option value="enquiry">General Enquiries</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#EFEAFD] text-[#7A709E] font-bold uppercase text-[10px] tracking-wider rounded-2xl">
                <th className="px-4 py-3 rounded-l-2xl">Ref / Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Customer Name</th>
                <th className="px-4 py-3">Phone & Email</th>
                <th className="px-4 py-3">Sample Category</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3 text-right rounded-r-2xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    Loading enquiries...
                  </td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    No enquiries found.
                  </td>
                </tr>
              ) : (
                enquiries.map((e) => (
                  <tr key={e.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-4 py-3.5 whitespace-nowrap font-bold text-[#0B6B43]">
                      #{String(e.id).padStart(4, '0')}
                      <p className="text-[10px] text-gray-500 font-normal">
                        {new Date(e.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          e.type === 'sample'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {e.type === 'sample' ? <TestTube className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
                        {e.type === 'sample' ? 'Sample Test' : 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-gray-900">{e.name}</td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-gray-800 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#168B57]" /> {e.phone}
                      </p>
                      {e.email && <p className="text-[11px] text-gray-500">{e.email}</p>}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-gray-700">
                      {e.sample_type || '—'}
                    </td>
                    <td className="px-4 py-3.5 max-w-xs truncate text-gray-600">
                      {e.message || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      {!isDemo && (
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                          title="Delete Enquiry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
