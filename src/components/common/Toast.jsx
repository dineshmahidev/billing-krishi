import React, { createContext, useContext, useState } from 'react';
const ToastContext = createContext(null);
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const addToast = (msg, type='success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)), 3000);
  };
  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(t=>(
          <div key={t.id} className={`px-4 py-2 rounded-xl text-xs font-bold shadow-lg ${t.type==='error'?'bg-red-600 text-white':'bg-[#0B6B43] text-white'}`}>{t.msg}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
export const useToast = () => useContext(ToastContext);
