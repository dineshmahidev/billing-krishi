import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { Mail, Lock, ArrowRight, ShieldCheck, Sparkles, Beaker, FlaskConical, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Login = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password', 'error');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      addToast('Logged in successfully', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Login failed — check credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-x-hidden bg-gradient-to-br from-[#F4FAF6] via-[#FFFFFF] to-[#EAF7F0] p-4 sm:p-6 lg:p-8">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-[#168B57]/5 to-transparent pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#168B57]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-[1040px] mx-auto relative z-10">
        
        {/* Back Link */}
        <div className="mb-4 sm:mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#0B6B43] transition-colors py-1 px-2 rounded-lg hover:bg-white/80"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Website
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 rounded-3xl sm:rounded-[32px] overflow-hidden shadow-[0_20px_60px_rgba(22,139,87,0.12)] border border-emerald-100/70 bg-white">
          
          {/* Left Panel: Brand Showcase with White Container (Desktop only) */}
          <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#F4FAF6] via-[#FFFFFF] to-[#EAF7F0] p-10 text-gray-900 border-r border-gray-100 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#168B57]/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

            {/* Top Brand Logo with White Container (Matching Mobile Exact Style) */}
            <div className="relative">
              <div className="bg-white rounded-3xl p-3.5 sm:p-4 shadow-[0_8px_25px_rgba(0,0,0,0.05)] border border-emerald-100 inline-flex items-center justify-center mb-2.5">
                <img
                  src="/krishi-transparent.png"
                  alt="Krishi Analytical Laboratory"
                  className="h-16 sm:h-20 w-auto object-contain"
                />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#168B57] bg-[#EAF7F0] px-3.5 py-1 rounded-full border border-[#D1EEE0] inline-flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Control Panel Access
                </span>
              </div>
            </div>

            {/* Middle Feature Highlights */}
            <div className="relative space-y-6 my-8">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
                  Secure.<br />Accurate. <span className="text-[#168B57]">Certified.</span>
                </h2>
                <p className="text-xs text-gray-500 font-medium mt-2 leading-relaxed">
                  Enterprise digital Certificate of Analysis (COA) workflow for Water, Vegetable Oils, Ghee, Animal Feed &amp; Rice Bran.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white border border-emerald-100/70 shadow-[0_4px_20px_rgba(22,139,87,0.04)] rounded-2xl p-3.5 text-center">
                  <div className="w-8 h-8 rounded-xl bg-[#EAF7F0] flex items-center justify-center text-[#168B57] mx-auto mb-1.5">
                    <Beaker className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-black text-gray-900 mt-1">38+ Tests</p>
                  <p className="text-[10px] text-gray-400 font-medium">Custom Specs</p>
                </div>
                <div className="bg-white border border-sky-100/70 shadow-[0_4px_20px_rgba(14,165,233,0.04)] rounded-2xl p-3.5 text-center">
                  <div className="w-8 h-8 rounded-xl bg-[#E0F2FE] flex items-center justify-center text-[#0284C7] mx-auto mb-1.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-black text-gray-900 mt-1">NABL Style</p>
                  <p className="text-[10px] text-gray-400 font-medium">Standardized</p>
                </div>
                <div className="bg-white border border-purple-100/70 shadow-[0_4px_20px_rgba(139,92,246,0.04)] rounded-2xl p-3.5 text-center">
                  <div className="w-8 h-8 rounded-xl bg-[#F3E8FF] flex items-center justify-center text-[#8B5CF6] mx-auto mb-1.5">
                    <FlaskConical className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-black text-gray-900 mt-1">Instant PDF</p>
                  <p className="text-[10px] text-gray-400 font-medium">Seal &amp; Sign</p>
                </div>
              </div>
            </div>

            {/* Bottom Lab Location Stamp */}
            <div className="relative flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
              <span className="font-medium">Kangeyam • Tiruppur District</span>
              <span className="flex items-center gap-1.5 text-[#0B6B43] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#168B57]" /> Verified Lab
              </span>
            </div>
          </div>

          {/* Right Panel: Login Form (Mobile + Desktop) */}
          <div className="p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-white">
            
            {/* Mobile Header with Logo in White Container */}
            <div className="lg:hidden flex flex-col items-center justify-center text-center mb-6">
              <div className="bg-white rounded-3xl p-3.5 shadow-[0_8px_25px_rgba(0,0,0,0.05)] border border-emerald-100 inline-flex items-center justify-center mb-2.5">
                <img
                  src="/krishi-transparent.png"
                  alt="Krishi Analytical Laboratory"
                  className="h-14 sm:h-16 w-auto object-contain mx-auto"
                />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#168B57] bg-[#EAF7F0] px-3.5 py-1 rounded-full border border-[#D1EEE0]">
                Control Panel Access
              </span>
            </div>

            <div>
              {/* Form Title */}
              <div className="mb-6">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  Welcome back
                </h1>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  Sign in to access your laboratory reports and administrative tools.
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={submit} className="space-y-4" autoComplete="on">
                {/* Email Field */}
                <div>
                  <label className="block text-[11px] font-black tracking-wider uppercase text-gray-600 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#168B57]" />
                    <input
                      type="email"
                      required
                      name="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full pl-10 pr-4 py-3.5 bg-gray-50/70 border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/30 focus:border-[#168B57] focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                </div>

                {/* Password Field with Eye Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-black tracking-wider uppercase text-gray-600">
                      Password
                    </label>
                    <span className="text-[11px] font-semibold text-gray-400">
                      Secured Access
                    </span>
                  </div>
                  <div className="relative group">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#168B57]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      name="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-12 py-3.5 bg-gray-50/70 border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168B57]/30 focus:border-[#168B57] focus:bg-white transition-all shadow-xs"
                    />
                    {/* Eye / EyeOff Password Visibility Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-700 rounded-xl transition-colors hover:bg-gray-100"
                      tabIndex={-1}
                      title={showPassword ? 'Hide password' : 'Show password'}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-[#168B57]" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 mt-2 rounded-2xl bg-gradient-to-r from-[#168B57] to-[#0B6B43] hover:from-[#0B6B43] hover:to-[#168B57] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(22,139,87,0.25)] hover:shadow-[0_12px_28px_rgba(22,139,87,0.35)] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:hover:scale-100 cursor-pointer"
                >
                  {loading ? (
                    <span>Signing in...</span>
                  ) : (
                    <>
                      <span>Sign In to Control Panel</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Security Footer Note */}
            <div className="pt-6 mt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-gray-400">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#168B57]" /> Encrypted Session
              </span>
              <span>182-B, Kangeyam • +91 63793 12357 / +91 88838 64756</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
