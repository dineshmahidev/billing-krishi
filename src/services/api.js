import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = String(err.config?.url || '');
    const isLogin = url.includes('/login');
    if (err.response?.status === 401 && !isLogin) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      if (window.location.pathname.startsWith('/panel')) {
        window.location.href = '/panel';
      }
    }
    return Promise.reject(err);
  }
);

export const openPdf = async (reportId) => {
  const token = localStorage.getItem('auth_token');
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  // Direct open with token query is most reliable (no CORS preflight, no popup block issues)
  const url = `${base}/reports/${reportId}/pdf${token ? `?token=${token}` : ''}`;
  const win = window.open(url, '_blank');
  if (!win) {
    // Fallback to blob if popup blocked
    try {
      const res = await api.get(`/reports/${reportId}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (e) {
      window.location.href = url;
    }
  }
};

export const downloadPdf = async (reportId, filename) => {
  const token = localStorage.getItem('auth_token');
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const url = `${base}/reports/${reportId}/pdf/download${token ? `?token=${token}` : ''}`;
  // Use direct download link for reliability
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `report-${reportId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

export const openWord = async (reportId) => {
  const token = localStorage.getItem('auth_token');
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const url = `${base}/reports/${reportId}/word${token ? `?token=${token}` : ''}`;
  window.open(url, '_blank');
};

export const downloadWord = async (reportId, filename) => {
  const token = localStorage.getItem('auth_token');
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const url = `${base}/reports/${reportId}/word/download${token ? `?token=${token}` : ''}`;
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `report-${reportId}.doc`;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

export const openInvoiceWord = async (reportId) => {
  const token = localStorage.getItem('auth_token');
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const url = `${base}/reports/${reportId}/invoice/word${token ? `?token=${token}` : ''}`;
  const win = window.open(url, '_blank');
  if (!win) window.location.href = url;
};

export const downloadInvoiceWord = async (reportId, filename) => {
  const token = localStorage.getItem('auth_token');
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const url = `${base}/reports/${reportId}/invoice/word/download${token ? `?token=${token}` : ''}`;
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `invoice-${reportId}.doc`;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

export const printReport = (reportId) => {
  const token = localStorage.getItem('auth_token');
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const url = `${base}/reports/${reportId}/pdf${token ? `?token=${token}` : ''}`;
  const win = window.open(url, '_blank');
  if (win) {
    win.onload = () => { try { win.print(); } catch(e) {} };
  }
};

export const openReportByNo = (reportNo) => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const no = encodeURIComponent(String(reportNo || '').trim());
  const url = `${base}/reports/by-no/${no}/pdf`;
  const win = window.open(url, '_blank');
  if (!win) window.location.href = url;
};

export const downloadReportByNo = (reportNo) => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const no = encodeURIComponent(String(reportNo || '').trim());
  const url = `${base}/reports/by-no/${no}/pdf/download`;
  const a = document.createElement('a');
  a.href = url;
  a.download = `${reportNo}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

export default api;
