import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Demo = () => {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    (async () => {
      try {
        if (!user || !user.is_demo) {
          await login('demo@krishilab.com', 'Demo123!');
        }
        if (!cancelled) navigate('/panel', { replace: true });
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.message || 'Could not start the demo session');
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm font-bold text-red-600">{error}</p>
        <Link to="/" className="text-xs font-bold text-[#0B6B43] underline">Back to home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-[#168B57] border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-bold text-[#0B6B43] uppercase tracking-widest">Starting demo panel...</p>
    </div>
  );
};
export default Demo;
