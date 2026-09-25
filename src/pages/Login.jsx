import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { Mail, Lock, ArrowRight, ShieldCheck, Sparkles, Beaker, FlaskConical } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      addToast('Logged in');
    } catch (err) {
      addToast(err.response?.data?.message || 'Login failed', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-[#F6FDF9] via-white to-[#EAF7F0]">
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes bubble { 0%{transform:translateY(0); opacity:.8} 100%{transform:translateY(-50px); opacity:0} }
        @keyframes headerFill { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
        .float{animation:float 4s ease-in-out infinite}
        .bubble{animation:bubble 2.2s linear infinite}
        .header-fill{background:linear-gradient(90deg,#0B6B43 0%,#168B57 25%,#22c55e 50%,#168B57 75%,#0B6B43 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:headerFill 3s linear infinite}
      `}</style>

      {/* Bottom bowl spread - premium */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[170%] h-[42%] pointer-events-none">
        <div className="w-full h-full bg-gradient-to-t from-[#0B6B43] via-[#168B57]/90 to-[#A7F3D0]/0 rounded-t-[60%] border-t-[3px] border-white/60 relative overflow-hidden">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[78%] h-1.5 bg-white/80 rounded-full blur-[0.5px]" />
          <span className="bubble absolute left-[15%] bottom-6 w-2 h-2 bg-white rounded-full" />
          <span className="bubble absolute left-[30%] bottom-10 w-3 h-3 bg-white/90 rounded-full" style={{ animationDelay: '0.5s' }} />
          <span className="bubble absolute left-[50%] bottom-8 w-2 h-2 bg-white rounded-full" style={{ animationDelay: '1s' }} />
          <span className="bubble absolute left-[70%] bottom-6 w-2.5 h-2.5 bg-white/90 rounded-full" style={{ animationDelay: '0.7s' }} />
          <span className="bubble absolute left-[85%] bottom-10 w-1.5 h-1.5 bg-white rounded-full" style={{ animationDelay: '1.2s' }} />
        </div>
      </div>
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#EAF7F0]/50 to-transparent pointer-events-none" />

      <div className="w-full max-w-[1100px] mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-0 items-center p-4 sm:p-6 relative z-10">
        {/* Left Premium Branding */}
        <div className="hidden lg:flex flex-col justify-between h-[560px] bg-gradient-to-br from-[#0B6B43] via-[#168B57] to-[#0B6B43] rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <img src="/krishi-transparent.png" alt="logo" className="h-12 w-auto object-contain" />
              <div>
                <p className="text-sm font-bold leading-none">KRISHI ANALYTICAL LAB</p>
                <p className="text-[11px] opacity-80">Discovering Solutions, One Test at a Time</p>
              </div>
            </div>
          </div>
          <div className="relative space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20 px-3 py-1 rounded-full text-[11px] font-bold"><Sparkles className="w-3 h-3" /> Premium Lab OS</div>
            <h2 className="text-3xl font-extrabold leading-tight">Secure.<br />Precise. <span className="text-white/90">Premium.</span></h2>
            <p className="text-xs opacity-80">Enterprise-grade report management for Water, Oil, Ghee, Feed & Rice Bran — trusted by 500+ labs.</p>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-3 text-center"><Beaker className="w-5 h-5 mx-auto" /><p className="text-[11px] font-bold mt-1">38+ Tests</p></div>
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-3 text-center"><ShieldCheck className="w-5 h-5 mx-auto" /><p className="text-[11px] font-bold mt-1">NABL Style</p></div>
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-3 text-center"><FlaskConical className="w-5 h-5 mx-auto" /><p className="text-[11px] font-bold mt-1">A4 PDF</p></div>
            </div>
          </div>
          <div className="relative flex items-center gap-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl p-3">
            <img src="/hero-lab.jpg" alt="lab" className="w-12 h-12 rounded-lg object-cover" />
            <div><p className="text-xs font-bold">KAL-4419 Certified</p><p className="text-[11px] opacity-70">Auto numbering • Seal & Signature</p></div>
            <div className="ml-auto w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Right Login Card - Premium Glass */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex justify-center mb-6">
              <div className="bg-white border border-[#D1D5DB] rounded-2xl px-5 py-3 shadow-sm flex items-center gap-3">
                <img src="/krishi-transparent.png" alt="logo" className="h-10 w-auto object-contain" />
                <div><p className="text-xs font-bold header-fill">KRISHI ANALYTICAL LAB</p><p className="text-[11px] text-[#6B7280]">Premium Access</p></div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_20px_60px_rgba(22,139,87,0.15)] overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-[#0B6B43] via-[#168B57] to-amber-400" />
              <div className="p-6 sm:p-8 space-y-5">
                <div>
                  <h1 className="text-xl font-bold">Welcome back</h1>
                  <p className="text-xs text-[#6B7280] mt-1">Sign in to <span className="font-bold text-[#168B57]">Control Panel</span> — admin & staff only</p>
                </div>

                <form onSubmit={submit} className="space-y-4" autoComplete="off">
                  <div>
                    <label className="text-[11px] font-bold tracking-widest text-[#6B7280]">EMAIL</label>
                    <div className="relative mt-1.5 group">
                      <Mail className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-[#168B57]" />
                      <input type="email" required name="kl_email" autoComplete="off" autoCorrect="off" spellCheck={false} readOnly onFocus={e=>e.target.removeAttribute('readOnly')} value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@lab.com" className="w-full pl-10 pr-3 py-3 bg-[#F9FAFB] border border-[#D1D5DB] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#168B57] focus:bg-white focus:border-[#168B57] transition-all" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between"><label className="text-[11px] font-bold tracking-widest text-[#6B7280]">PASSWORD</label><span className="text-[11px] text-[#6B7280]">Secure login</span></div>
                    <div className="relative mt-1.5 group">
                      <Lock className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-[#168B57]" />
                      <input type="password" required name="kl_password" autoComplete="off" readOnly onFocus={e=>e.target.removeAttribute('readOnly')} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-3 py-3 bg-[#F9FAFB] border border-[#D1D5DB] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#168B57] focus:bg-white transition-all" />
                    </div>
                  </div>

                  <button disabled={loading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#168B57] to-[#0B6B43] hover:from-[#0B6B43] hover:to-[#168B57] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(22,139,87,0.3)] hover:shadow-[0_12px_30px_rgba(22,139,87,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all">
                    {loading?'Signing in...':'Sign In to Control Panel'} <ArrowRight className="w-4 h-4" />
                  </button>

                  </form>

                <div className="flex items-center gap-2 text-[11px] text-[#6B7280] justify-center">
                  <ShieldCheck className="w-3 h-3 text-[#168B57]" /> Encrypted • Role-based • Audit logged
                </div>
              </div>
              <div className="bg-[#F9FAFB] border-t border-[#D1D5DB]/60 px-6 py-3 flex items-center justify-between text-[11px]">
                <span className="text-[#6B7280]">182-B, Kangeyam • +91 63793 12357</span>
                <span className="font-bold text-[#168B57] flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Secure</span>
              </div>
            </div>
            <p className="text-center text-[11px] text-[#6B7280] mt-3">Access via <span className="font-mono font-bold">/panel</span> only • No public signup</p>
          </div>
        </div>
      </div>
    </div>
  );
};
