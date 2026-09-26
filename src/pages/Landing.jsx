import React, { useState, useEffect, useRef } from 'react';
import { Droplets, FlaskConical, Beaker, Wheat, Leaf, CheckCircle, Clock, ShieldCheck, FileText, Lock, Printer, Menu, X, Phone, Mail, MapPin, Award, Zap, Settings2, TestTube, Sparkles, User, ClipboardList, FileCheck, FileDown, ArrowRight } from 'lucide-react';
import api from '../services/api';

const Reveal = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>{children}</div>;
};

export const Landing = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cms, setCms] = useState(null);
  useEffect(() => {
    api.get('/cms/landing').then(r => setCms(r.data)).catch(()=>{});
  }, []);

  const emptySample = { name:'', phone:'', email:'', sample_type:'', message:'' };
  const emptyContact = { name:'', phone:'', email:'', message:'' };
  const [sample, setSample] = useState(emptySample);
  const [contact, setContact] = useState(emptyContact);
  const [sampleBusy, setSampleBusy] = useState(false);
  const [contactBusy, setContactBusy] = useState(false);
  const [sampleMsg, setSampleMsg] = useState({ type:'', text:'' });
  const [contactMsg, setContactMsg] = useState({ type:'', text:'' });

  const submitSample = async (e) => {
    e.preventDefault();
    if (!sample.name.trim() || !sample.phone.trim()) { setSampleMsg({ type:'error', text:'Name and phone are required' }); return; }
    setSampleBusy(true); setSampleMsg({ type:'', text:'' });
    try {
      const r = await api.post('/enquiries', { ...sample, type:'sample', sample_type: sample.sample_type || null, email: sample.email || null, message: sample.message || null });
      setSample(emptySample);
      setSampleMsg({ type:'ok', text:`Submitted! Reference ${r.data.ref} — we'll call you back shortly.` });
    } catch (err) {
      setSampleMsg({ type:'error', text: err.response?.data?.message || 'Failed — please try again' });
    } finally { setSampleBusy(false); }
  };

  const submitContact = async (e) => {
    e.preventDefault();
    if (!contact.name.trim() || !contact.phone.trim()) { setContactMsg({ type:'error', text:'Name and phone are required' }); return; }
    setContactBusy(true); setContactMsg({ type:'', text:'' });
    try {
      const r = await api.post('/enquiries', { ...contact, type:'enquiry', message: contact.message || null });
      setContact(emptyContact);
      setContactMsg({ type:'ok', text:`Sent! Reference ${r.data.ref} — check your inbox for the acknowledgement.` });
    } catch (err) {
      setContactMsg({ type:'error', text: err.response?.data?.message || 'Failed — please try again' });
    } finally { setContactBusy(false); }
  };

  const heroTitle = cms?.hero_title || 'Accurate Lab Reports. Delivered Fast.';
  const heroDesc = cms?.hero_desc || 'Professional Certificate of Analysis for Water, Oil, Ghee, Animal Feed & Rice Bran. Trusted by industries across Tamil Nadu for precise, reliable testing.';
  const heroBadge = cms?.hero_badge || '';
  const aboutTitle = cms?.about_title || 'About Krishi Analytical Lab';
  const aboutDesc = cms?.about_desc || 'We are a dedicated analytical laboratory based in Kangeyam, Tiruppur District. We specialize in Certificate of Analysis (COA) for agro and food products. Our mission is to provide quick, accurate, and affordable testing with a clean, professional report system built for non-technical staff.';
  const contactPhone = cms?.contact_phone || '+91 63793 12357';
  const contactEmail = cms?.contact_email || 'krishianalyticallab@gmail.com';
  const contactAddress = cms?.contact_address || '182-B, Reliance Trends Near, Tiruppur Road, Kangeyam - 638701';
  const contactHours = cms?.contact_hours || 'Mon - Sat: 9am - 6pm';
  const apiOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');
  const heroImg = cms?.hero_image ? `${apiOrigin}/${cms.hero_image}` : '/hero-lab.jpg';
  const aboutImg = cms?.about_image ? `${apiOrigin}/${cms.about_image}` : '/about-glasswater.jpg';
  return (
    <div className="min-h-screen bg-white text-[#1F2937] overflow-x-hidden">
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes bubble { 0%{transform:translateY(0) scale(1); opacity:.7} 100%{transform:translateY(-40px) scale(0); opacity:0} }
        @keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes smoke { 0%{transform:translateY(0) translateX(0) scale(0.6) rotate(0deg); opacity:0.5} 50%{opacity:0.3} 100%{transform:translateY(-50px) translateX(12px) scale(1.4) rotate(10deg); opacity:0} }
        @keyframes boil { 0%,100%{transform:scaleY(1) scaleX(1)} 50%{transform:scaleY(1.08) scaleX(0.97)} }
        @keyframes headerFill { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
        @keyframes orbit { from{transform:rotate(0deg) translateX(70px) rotate(0deg)} to{transform:rotate(360deg) translateX(70px) rotate(-360deg)} }
        @keyframes orbit2 { from{transform:rotate(0deg) translateX(90px) rotate(0deg)} to{transform:rotate(-360deg) translateX(90px) rotate(360deg)} }
        @keyframes foamPulse { 0%,100%{transform:scale(1); opacity:.9} 50%{transform:scale(1.08); opacity:1} }
        .float { animation: float 4s ease-in-out infinite; }
        .float-delay { animation: float 4s ease-in-out infinite; animation-delay: 1.5s; }
        .bubble { animation: bubble 1.6s linear infinite; }
        .smoke { animation: smoke 3.2s ease-out infinite; }
        .boil-liquid { animation: boil 0.9s ease-in-out infinite; transform-origin: bottom; }
        .header-fill { background: linear-gradient(90deg, #0B6B43 0%, #168B57 25%, #22c55e 50%, #168B57 75%, #0B6B43 100%); background-size: 200% 100%; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; animation: headerFill 3s linear infinite; }
        .orbit { animation: orbit 6s linear infinite; }
        .orbit2 { animation: orbit2 8s linear infinite; }
        .foam-pulse { animation: foamPulse 1.2s ease-in-out infinite; }
      `}</style>
      {/* Top Bar - no login button */}
      <div className="bg-[#0B6B43] text-white text-[11px] hidden sm:block">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-8 flex items-center justify-between">
          <div className="flex items-center gap-4 truncate">
            <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{contactAddress}</span>
            <span className="hidden lg:flex items-center gap-1.5"><Phone className="w-3 h-3" />{contactPhone}</span>
            <span className="hidden lg:flex items-center gap-1.5"><Mail className="w-3 h-3" />{contactEmail}</span>
          </div>
          <span className="text-[11px] opacity-80 hidden lg:block">{contactHours}</span>
        </div>
      </div>

      {/* Navbar - header fill animation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-[#D1D5DB] relative">
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-[#168B57] to-transparent opacity-60" style={{ backgroundSize: '200% 100%', animation: 'gradientShift 2s linear infinite' }} />
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img src="/krishi-transparent.png" alt="Krishi Analytical Lab" className="h-11 sm:h-12 w-auto object-contain shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold leading-none truncate">KRISHI ANALYTICAL LAB</p>
              <p className="text-[10px] sm:text-[11px] text-[#168B57] font-medium mt-1 truncate">Discovering Solutions, One Test at a Time</p>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold">
            <a href="#home" className="hover:text-[#168B57] transition-colors">Home</a>
            <a href="#about" className="hover:text-[#168B57] transition-colors">About</a>
            <a href="#services" className="hover:text-[#168B57] transition-colors">Services</a>
            <a href="#why" className="hover:text-[#168B57] transition-colors">Why Us</a>
            <a href="#contact" className="hover:text-[#168B57] transition-colors">Contact</a>
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            <a href="#contact" className="hidden sm:inline-flex bg-[#168B57] hover:bg-[#0B6B43] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors">Enquire Now</a>
            <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu" className="lg:hidden p-2 border border-[#D1D5DB] rounded-xl bg-white">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        </header>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <aside className="absolute top-0 right-0 bottom-0 w-72 max-w-[85vw] bg-white border-l border-[#D1D5DB] flex flex-col shadow-[-8px_0_32px_rgba(0,0,0,0.12)] p-4 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between h-14 border-b border-[#D1D5DB]/60 pb-3 mb-4">
              <div className="flex items-center gap-2 min-w-0">
                <img src="/krishi-transparent.png" alt="logo" className="h-9 w-auto object-contain shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold leading-none truncate">KRISHI ANALYTICAL LAB</p>
                  <p className="text-[10px] text-[#168B57] mt-0.5 truncate">Premium Access</p>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-2 border border-[#D1D5DB] rounded-xl shrink-0"><X className="w-4 h-4" /></button>
            </div>
            <nav className="space-y-1 flex-1">
              {[
                { href: '#home', label: 'Home' },
                { href: '#about', label: 'About' },
                { href: '#services', label: 'Services' },
                { href: '#why', label: 'Why Us' },
                { href: '#contact', label: 'Contact' },
              ].map(it => (
                <a key={it.href} href={it.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-[#1F2937] hover:bg-[#EAF7F0] hover:text-[#0B6B43] transition-all">
                  <span className="w-1.5 h-1.5 bg-[#168B57] rounded-full shrink-0" /> {it.label}
                </a>
              ))}
            </nav>
            <div className="pt-4 border-t border-[#D1D5DB]/60 space-y-3">
              <a href="#contact" onClick={() => setMobileOpen(false)} className="block w-full text-center bg-[#168B57] hover:bg-[#0B6B43] text-white px-5 py-3 rounded-xl text-xs font-bold transition-colors">Enquire Now</a>
              <p className="text-[11px] text-[#6B7280] text-center">{contactPhone}</p>
            </div>
          </aside>
        </div>
      )}

      {/* Hero - lab photo + green overlay, white text (reference style) */}
      <section id="home" className="relative overflow-hidden min-h-[520px] sm:min-h-[560px] flex items-center">
        {/* Background image with green gradient overlay */}
        <div className="absolute inset-0">
          <img src={heroImg} alt="Krishi Lab" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B6B43] via-[#148052]/90 to-[#168B57]/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B6B43]/70 via-transparent to-[#0B6B43]/25" />
        </div>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-12 sm:py-20 relative w-full">
          <Reveal>
            <div className="max-w-3xl space-y-5">
              {/* Badge */}
              {heroBadge && (
                <div className="inline-flex items-center gap-2 border border-white/40 bg-white/10 backdrop-blur-sm text-white text-[11px] font-bold px-4 py-1.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" /> {heroBadge}
                </div>
              )}
              {/* Title */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.25)]">{heroTitle}</h1>
              <p className="text-base sm:text-lg font-bold text-white/95">Precise testing. Clear reports. Confident decisions.</p>
              <p className="text-sm text-white/80 max-w-xl">{heroDesc}</p>
              {/* CTA buttons */}
              <div className="flex flex-wrap gap-3 pt-1">
                <a href="#services" className="bg-white hover:bg-[#EAF7F0] text-[#0B6B43] px-6 py-3.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-[0_10px_30px_rgba(0,0,0,0.2)]">Explore Testing <ArrowRight className="w-4 h-4" /></a>
            <a href="/demo" className="border border-white/60 hover:bg-white/10 text-white px-6 py-3.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-[0_10px_30px_rgba(0,0,0,0.15)]"><FlaskConical className="w-4 h-4" /> Live Demo</a>
                <a href={`tel:${contactPhone.replace(/[^+\d]/g,'')}`} className="border border-white/60 hover:bg-white/10 text-white px-6 py-3.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"><Phone className="w-4 h-4" /> Call the Lab</a>
              </div>
              {/* Feature checklist */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-xs font-semibold text-white/90">
                {['5 testing categories', 'Clear COA reports', 'Local service in Kangeyam'].map(t => (
                  <span key={t} className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> {t}</span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* HERO BOTTOM FULL-WIDTH FORM with animation */}
      <Reveal>
        <section className="w-full bg-gradient-to-r from-[#EAF7F0] via-white to-[#EAF7F0] border-y border-[#D1EEE0] relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-[#168B57]/10 rounded-full blur-2xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-amber-300/10 rounded-full blur-2xl" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-96 h-1 bg-gradient-to-r from-transparent via-[#168B57]/20 to-transparent" />
          </div>
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 relative">
            <div className="bg-white border border-[#168B57]/20 rounded-2xl shadow-lg p-4 sm:p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#168B57] via-amber-400 to-sky-500" style={{ backgroundSize: '200% 100%', animation: 'gradientShift 3s linear infinite' }} />
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-sm font-bold flex items-center gap-2"><TestTube className="w-4 h-4 text-[#168B57]" /> Quick Sample Enquiry</p>
                  <p className="text-[11px] text-[#6B7280]">Fill once — we’ll call you back in 30 mins</p>
                </div>
                <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-[#0B6B43] bg-[#EAF7F0] px-3 py-1 rounded-full"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Live Lab Form</span>
              </div>
              <form className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" onSubmit={submitSample}>
                <div className="relative group">
                  <input required value={sample.name} onChange={e=>setSample({...sample, name:e.target.value})} placeholder="Your Name" className="w-full border border-[#D1D5DB] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#168B57] focus:border-[#168B57] transition-all group-hover:border-[#168B57]/40" />
                  <span className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-[#168B57] opacity-0 group-focus-within:opacity-100 transition-opacity">Name</span>
                </div>
                <div className="relative group">
                  <input required value={sample.phone} onChange={e=>setSample({...sample, phone:e.target.value})} placeholder="Phone Number" className="w-full border border-[#D1D5DB] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#168B57] transition-all" />
                </div>
                <div className="relative group">
                  <input type="email" value={sample.email} onChange={e=>setSample({...sample, email:e.target.value})} placeholder="Email (optional — for auto reply)" className="w-full border border-[#D1D5DB] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#168B57]" />
                </div>
                <div className="relative group">
                  <select value={sample.sample_type} onChange={e=>setSample({...sample, sample_type:e.target.value})} className="w-full border border-[#D1D5DB] rounded-xl px-3 py-2.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#168B57]">
                    <option value="">Select Sample Type</option>
                    <option>Water</option>
                    <option>Oil</option>
                    <option>Ghee</option>
                    <option>Animal Feed</option>
                    <option>Rice Bran</option>
                  </select>
                </div>
                <div className="relative group">
                  <input value={sample.message} onChange={e=>setSample({...sample, message:e.target.value})} placeholder="Message (optional)" className="w-full border border-[#D1D5DB] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#168B57]" />
                </div>
                <button disabled={sampleBusy} className="bg-[#168B57] hover:bg-[#0B6B43] text-white rounded-xl px-6 py-2.5 text-xs font-bold flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60">
                  {sampleBusy ? 'Submitting...' : <>Submit <Sparkles className="w-4 h-4" /></>}
                </button>
                {sampleMsg.text && <p className={`sm:col-span-2 lg:col-span-3 text-[11px] font-bold ${sampleMsg.type==='ok' ? 'text-[#0B6B43]' : 'text-red-600'}`}>{sampleMsg.text}</p>}
              </form>
              <div className="flex gap-2 mt-3">
                <span className="w-6 h-1 bg-[#168B57] rounded-full" />
                <span className="w-6 h-1 bg-amber-400 rounded-full opacity-60" />
                <span className="w-6 h-1 bg-sky-400 rounded-full opacity-60" />
                <span className="text-[10px] text-[#6B7280] ml-2">Green • Amber • Sky — Colourful Chemistry</span>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Stats Strip with scroll reveal */}
      <Reveal>
        <section className="bg-[#EAF7F0] border-y border-[#D1EEE0]">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div><p className="text-2xl font-bold text-[#0B6B43]">5</p><p className="text-xs text-[#6B7280]">Report Types</p></div>
            <div><p className="text-2xl font-bold text-[#0B6B43]">38+</p><p className="text-xs text-[#6B7280]">Test Parameters</p></div>
            <div><p className="text-2xl font-bold text-[#0B6B43]">1000+</p><p className="text-xs text-[#6B7280]">Reports Generated</p></div>
            <div><p className="text-2xl font-bold text-[#0B6B43]">24/7</p><p className="text-xs text-[#6B7280]">Support</p></div>
          </div>
        </section>
      </Reveal>

      {/* Chemistry Lab Form Animation Strip */}
      <Reveal>
        <section className="max-w-[1600px] mx-auto px-4 sm:px-6 py-10">
          <div className="bg-gradient-to-r from-[#0B6B43] via-[#168B57] to-[#0B6B43] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-300/20 rounded-full blur-3xl" />
            <div className="relative grid lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2 space-y-3">
                <p className="text-xs font-bold tracking-widest opacity-80 flex items-center gap-2"><Beaker className="w-4 h-4" /> CHEMISTRY IN ACTION</p>
                <h3 className="text-xl sm:text-2xl font-bold">Where Colour Meets Chemistry</h3>
                <p className="text-xs opacity-80">From water clarity to oil viscosity, our lab brings colourful reactions to precise measurements — green for safe, amber for caution, crystal for pure.</p>
              </div>
              <div className="flex justify-center gap-4">
                {[
                  { c: 'from-emerald-400 to-emerald-600', label: 'Safe', sub: 'pH 7.2', smoke: 'emerald' },
                  { c: 'from-amber-400 to-orange-500', label: 'Alert', sub: 'FFA 0.8%', smoke: 'amber' },
                  { c: 'from-sky-400 to-blue-600', label: 'Pure', sub: 'TDS 120', smoke: 'sky' },
                ].map((b, i) => (
                  <div key={b.label} className="float text-center relative" style={{ animationDelay: `${i * 0.5}s` }}>
                    {/* bowl smoke */}
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-8 h-8 pointer-events-none">
                      <span className="smoke absolute left-2 bottom-0 w-2 h-5 bg-white/30 rounded-full blur-[1px]" style={{ animationDelay: `${i * 0.6}s` }} />
                      <span className="smoke absolute right-1 bottom-1 w-1.5 h-4 bg-white/20 rounded-full blur-[1px]" style={{ animationDelay: `${i * 0.6 + 0.5}s` }} />
                    </div>
                    <div className={`w-16 h-20 rounded-xl bg-gradient-to-t ${b.c} border-2 border-white/30 shadow-lg relative overflow-hidden flex flex-col justify-end pb-2 boil-liquid`} style={{ animationDuration: `${0.8 + i * 0.15}s` }}>
                      <span className="bubble absolute left-2 bottom-4 w-1 h-1 bg-white/80 rounded-full" style={{ animationDelay: `${i * 0.3}s` }} />
                      <span className="bubble absolute right-2 bottom-6 w-1.5 h-1.5 bg-white/60 rounded-full" style={{ animationDelay: `${i * 0.3 + 0.4}s` }} />
                      <span className="bubble absolute left-3 bottom-2 w-0.5 h-0.5 bg-white rounded-full" style={{ animationDelay: `${i * 0.3 + 0.2}s` }} />
                      <p className="text-[10px] font-bold text-white relative">{b.sub}</p>
                    </div>
                    <p className="text-[11px] font-bold mt-2">{b.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* About - image card + white info card (reference style) */}
      <section id="about" className="bg-[#EFF6F1] py-12 sm:py-16">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-6 items-center">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl h-[360px] sm:h-[480px] shadow-[0_16px_48px_rgba(11,107,67,0.15)]">
              <img src={aboutImg} alt="About" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B6B43]/85 via-[#168B57]/25 to-[#168B57]/10" />
              <div className="absolute bottom-0 left-0 p-6 sm:p-8">
                <p className="text-white text-xl sm:text-2xl font-extrabold drop-shadow">Science you can rely on.</p>
                <p className="text-white/80 text-xs sm:text-sm mt-1">From sample receipt to your final report.</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="bg-white border border-[#D1D5DB]/70 rounded-3xl p-6 sm:p-10 shadow-[0_16px_48px_rgba(11,107,67,0.08)] space-y-5">
              <p className="text-[11px] font-bold tracking-[0.2em] text-[#168B57]">ABOUT THE LABORATORY</p>
              <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight text-[#1F2937]">{aboutTitle}</h2>
              <p className="text-sm text-[#6B7280] leading-relaxed">{aboutDesc}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  'Experienced laboratory team',
                  'Careful sample handling',
                  'Clear Certificate of Analysis',
                  'Practical support for local industries',
                ].map(t => (
                  <div key={t} className="flex items-center gap-3 bg-[#EAF7F0] border border-[#D1EEE0] rounded-xl px-4 py-3">
                    <span className="w-6 h-6 rounded-full bg-[#168B57] text-white flex items-center justify-center shrink-0"><CheckCircle className="w-4 h-4" /></span>
                    <p className="text-xs font-bold text-[#1F2937] leading-snug">{t}</p>
                  </div>
                ))}
              </div>
              <a href="#services" className="inline-flex items-center gap-2 text-sm font-bold text-[#0B6B43] hover:gap-3 transition-all">View all testing services <ArrowRight className="w-4 h-4" /></a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Services with scroll animation */}
      <section id="services" className="bg-[#F9FAFB] border-y border-[#D1D5DB] py-12 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-32 h-32 bg-[#168B57]/5 rounded-full blur-2xl" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-amber-200/20 rounded-full blur-2xl" />
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 relative">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-8">
              <p className="text-[11px] font-bold tracking-widest text-[#168B57]">SERVICES</p>
              <h2 className="text-2xl sm:text-3xl font-bold">Our Testing Services</h2>
              <p className="text-xs text-[#6B7280] mt-2">Database-driven report types — Water to Rice Bran</p>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-5">
            {[
              { title: 'Water', sub: 'Certificate of Analysis', img: '/service-water.jpg', icon: Droplets, params: ['pH', 'TDS', 'TH, TSS, Turbidity'], color: 'sky' },
              { title: 'Oil', sub: 'Certificate of Analysis', img: '/service-oil.jpg', icon: FlaskConical, params: ['FFA, Moisture', 'Iodine Value', 'Specific Gravity'], color: 'amber' },
              { title: 'Ghee', sub: 'Certificate of Analysis', img: '/service-oil.jpg', icon: Beaker, params: ['FFA, Moisture', 'BR Reading, RM Value', 'Polenske Value'], color: 'yellow' },
              { title: 'Animal Feed', sub: 'Certificate of Analysis', img: '/service-feed.jpg', icon: Wheat, params: ['Oil Content, FFA', 'Protein, Fiber', 'Sand & Silica'], color: 'emerald' },
              { title: 'Rice Bran', sub: 'Certificate of Analysis', img: '/service-rice.jpg', icon: Leaf, params: ['Oil Content, Ash', 'Moisture, Rancidity', 'Fiber, Protein'], color: 'orange' },
            ].map((s, idx) => (
              <div key={s.title} className={idx < 2 ? 'lg:col-span-3' : 'lg:col-span-2'}>
                <Reveal delay={idx * 80}>
                  <div className={`group relative overflow-hidden rounded-2xl ${idx < 2 ? 'h-[340px]' : 'h-[300px]'} hover:-translate-y-1 transition-all duration-300 shadow-[0_12px_32px_rgba(11,107,67,0.18)]`}>
                    <img src={s.img} alt={s.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#168B57]/35 via-[#148052]/70 to-[#0B6B43]/95" />
                    <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#0B6B43] shadow-lg mb-4"><s.icon className="w-6 h-6" /></div>
                      <p className="text-[10px] font-bold tracking-[0.25em] text-white/85">{s.sub.toUpperCase()}</p>
                      <h3 className="text-white text-xl sm:text-2xl font-extrabold mt-1 drop-shadow">{s.title} Testing</h3>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {s.params.flatMap(p => p.split(',').map(x => x.trim())).map(ch => (
                          <span key={ch} className="border border-white/50 bg-white/10 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1 rounded-full">{ch}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us with scroll */}
      <section id="why" className="max-w-[1600px] mx-auto px-4 sm:px-6 py-12">
        <Reveal><h2 className="text-2xl font-bold text-center">Why Laboratories Trust Us</h2></Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {[
            { t: 'Fast Turnaround', d: 'Reports in 24 hours', i: Zap },
            { t: 'Precision Accuracy', d: 'Calibrated instruments', i: ShieldCheck },
            { t: 'Professional A4 PDF', d: 'Header/footer repeats, seal & signature', i: FileText },
            { t: 'Secure & Private', d: 'Role-based Admin/Staff', i: Lock },
            { t: 'Configurable', d: 'Admin can edit parameters', i: Settings2 },
            { t: 'Print Ready', d: 'Real text PDF via DomPDF', i: Printer },
          ].map((f, i) => (
            <Reveal key={f.t} delay={i * 60}>
              <div className="border border-[#D1D5DB] rounded-2xl p-5 flex gap-3 bg-white hover:shadow-sm hover:border-[#168B57]/30 transition-all">
                <div className="w-9 h-9 rounded-xl bg-[#EAF7F0] flex items-center justify-center text-[#168B57] shrink-0"><f.i className="w-5 h-5" /></div>
                <div><p className="text-sm font-bold">{f.t}</p><p className="text-xs text-[#6B7280]">{f.d}</p></div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works — Client brings sample, lab delivers report */}
      <Reveal>
        <section className="bg-[#EAF7F0] py-10 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 w-96 h-20 bg-white/50 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#168B57]/10 rounded-full blur-2xl" />
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 relative">
            <p className="text-[11px] font-bold tracking-widest text-[#168B57] text-center">PROCESS</p>
            <h2 className="text-2xl font-bold text-center">How It Works</h2>
            <p className="text-xs text-[#6B7280] text-center mt-1">Client brings sample, we deliver certified report</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              {[
                { s: 'Client Brings Sample', d: 'Customer brings sample to lab — Water, Oil, Ghee, Feed, Rice Bran', c: 'bg-[#168B57]', Icon: User },
                { s: 'We Log Sample', d: 'We record sample details, party name and date accurately', c: 'bg-[#0B6B43]', Icon: ClipboardList },
                { s: 'Lab Testing', d: 'Chemistry analysis — pH, FFA, Protein and all parameters tested', c: 'bg-amber-500', Icon: FlaskConical },
                { s: 'Report Delivered', d: 'Auto KAL number with neat A4 PDF — ready to print and download', c: 'bg-sky-600', Icon: FileCheck },
              ].map((it, i) => (
                <div key={it.s} className="bg-white border border-[#D1D5DB] rounded-2xl p-5 text-center hover:-translate-y-1 hover:shadow-md transition-all relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#168B57]/20 to-transparent" />
                  <div className={`w-10 h-10 rounded-xl ${it.c} text-white flex items-center justify-center mx-auto`}><it.Icon className="w-5 h-5" /></div>
                  <div className={`w-6 h-6 rounded-full ${it.c} text-white flex items-center justify-center mx-auto text-[11px] font-bold mt-3`}>{i + 1}</div>
                  <p className="text-sm font-bold mt-2 leading-tight">{it.s}</p>
                  <p className="text-xs text-[#6B7280] mt-1 leading-snug">{it.d}</p>
                </div>
              ))}
            </div>
            <div className="hidden lg:flex items-center justify-center gap-2 mt-6 text-[11px] font-bold text-[#6B7280]">
              <span className="w-2 h-2 bg-[#168B57] rounded-full animate-pulse" /> Sample received in 30 mins • Report ready in 24 hours
            </div>
          </div>
        </section>
      </Reveal>

      {/* CTA - no controlpanel button, just info */}
      <Reveal>
        <section className="bg-gradient-to-r from-[#0B6B43] via-[#168B57] to-[#0B6B43] text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.15),transparent_40%)]" />
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 flex flex-col lg:flex-row items-center justify-between gap-4 relative">
            <div><p className="font-bold flex items-center gap-2"><Sparkles className="w-4 h-4" /> Ready to experience precise testing?</p><p className="text-xs opacity-90">Visit us at Kangeyam for sample submission</p></div>
            <a href="#contact" className="bg-white text-[#0B6B43] px-6 py-3 rounded-xl text-xs font-bold hover:bg-[#EAF7F0] transition-colors">Contact Lab</a>
          </div>
        </section>
      </Reveal>

      {/* Contact with scroll */}
      <section id="contact" className="max-w-[1600px] mx-auto px-4 sm:px-6 py-12 grid lg:grid-cols-2 gap-8">
        <Reveal>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Contact Us</h2>
            <div className="space-y-3 text-sm">
              <p className="flex gap-2"><MapPin className="w-4 h-4 text-[#168B57]" />{contactAddress}</p>
              <p className="flex gap-2"><Phone className="w-4 h-4 text-[#168B57]" />{contactPhone}</p>
              <p className="flex gap-2"><Mail className="w-4 h-4 text-[#168B57]" />{contactEmail}</p>
              <p className="flex gap-2"><Clock className="w-4 h-4 text-[#168B57]" />{contactHours}</p>
            </div>
            <div className="bg-[#F9FAFB] border border-[#D1D5DB] rounded-2xl h-32 flex items-center justify-center text-xs text-[#6B7280] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#EAF7F0] to-white opacity-50" />
              <span className="relative">Map — Kangeyam Tiruppur Road</span>
            </div>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <form className="bg-white border border-[#D1D5DB] rounded-2xl p-6 space-y-3 shadow-sm" onSubmit={submitContact}>
            <input required value={contact.name} onChange={e=>setContact({...contact, name:e.target.value})} placeholder="Name" className="w-full border border-[#D1D5DB] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#168B57]" />
            <input required value={contact.phone} onChange={e=>setContact({...contact, phone:e.target.value})} placeholder="Phone" className="w-full border border-[#D1D5DB] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#168B57]" />
            <input type="email" value={contact.email} onChange={e=>setContact({...contact, email:e.target.value})} placeholder="Email (optional — for auto reply)" className="w-full border border-[#D1D5DB] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#168B57]" />
            <textarea value={contact.message} onChange={e=>setContact({...contact, message:e.target.value})} placeholder="Message" rows={4} className="w-full border border-[#D1D5DB] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#168B57]" />
            <button disabled={contactBusy} className="w-full bg-[#168B57] hover:bg-[#0B6B43] text-white py-3 rounded-xl font-bold text-xs transition-colors disabled:opacity-60">{contactBusy ? 'Sending...' : 'Send Enquiry'}</button>
            {contactMsg.text && <p className={`text-[11px] font-bold text-center ${contactMsg.type==='ok' ? 'text-[#0B6B43]' : 'text-red-600'}`}>{contactMsg.text}</p>}
          </form>
        </Reveal>
      </section>

      {/* Footer - no controlpanel link */}
      <footer className="bg-[#0B6B43] text-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 grid sm:grid-cols-3 gap-8 text-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <img src="/krishi-transparent.png" alt="logo" className="h-11 w-auto object-contain" />
              <div>
                <p className="font-bold">KRISHI ANALYTICAL LAB</p>
                <p className="opacity-80">Discovering Solutions, One Test at a Time</p>
              </div>
            </div>
            <p className="opacity-60">182-B, Tiruppur Road, Kangeyam</p>
          </div>
          <div>
            <p className="font-bold mb-2">Quick Links</p>
            <div className="space-y-1 opacity-80"><a href="#home" className="block hover:underline">Home</a><a href="#services" className="block hover:underline">Services</a><a href="#contact" className="block hover:underline">Contact</a></div>
          </div>
          <div>
            <p className="font-bold mb-2">Services</p>
            <div className="space-y-1 opacity-80"><p>Water</p><p>Oil</p><p>Ghee</p><p>Animal Feed</p><p>Rice Bran</p></div>
          </div>
        </div>
        <div className="border-t border-white/20 text-center py-3 text-[11px] opacity-70">© 2026 Krishi Analytical Lab. All rights reserved.</div>
      </footer>
    </div>
  );
};
export default Landing;
