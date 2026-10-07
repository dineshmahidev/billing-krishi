import React, { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Search, RefreshCw, Eye, EyeOff, Globe, Users, TrendingUp, Mail, Phone, TestTube } from 'lucide-react';
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

      {/* Traffic Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#D1EEE0] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#6B7280]">Total Website Traffic</p>
            <p className="text-2xl font-black text-[#0B6B43] mt-1">{traffic.total_visits.toLocaleString()}</p>
            <p className="text-[11px] text-[#168B57] font-medium mt-0.5">Total page views</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#EAF7F0] flex items-center justify-center text-[#168B57]">
            <Globe className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D1EEE0] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#6B7280]">Today's Visitors</p>
            <p className="text-2xl font-black text-[#0B6B43] mt-1">{traffic.today_visits.toLocaleString()}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Visits today</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D1EEE0] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#6B7280]">Unique Visitors</p>
            <p className="text-2xl font-black text-[#0B6B43] mt-1">{traffic.unique_ips.toLocaleString()}</p>
            <p className="text-[11px] text-[#168B57] font-medium mt-0.5">Unique IP addresses</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#EAF7F0] flex items-center justify-center text-[#168B57]">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Enquiries Section */}
      <div className="bg-white border border-[#D1D5DB]/80 rounded-2xl shadow-sm p-4 sm:p-5 space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, email..."
              className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#168B57]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-[#D1D5DB] rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#168B57]"
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
            <thead className="bg-[#EAF7F0] text-[#0B6B43] font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">Ref / Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Customer Name</th>
                <th className="px-4 py-3">Phone & Email</th>
                <th className="px-4 py-3">Sample Category</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3 text-right rounded-r-xl">Action</th>
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
