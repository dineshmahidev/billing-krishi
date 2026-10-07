import React, { useState, useEffect, useRef } from 'react';
import { Droplets, FlaskConical, Beaker, Wheat, Leaf, CheckCircle, Clock, ShieldCheck, FileText, Lock, Printer, Menu, X, Phone, Mail, MapPin, Award, Zap, Settings2, TestTube, Sparkles, User, ClipboardList, FileCheck, FileDown, ArrowRight, ChevronLeft, ChevronRight, Home, Info, PhoneCall, Star, Quote, Building2 } from 'lucide-react';
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
    api.post('/traffic/visit', { page_url: window.location.pathname }).catch(()=>{});
  }, []);

  const emptySample = { name:'', phone:'', email:'', sample_type:'', message:'' };
  const emptyContact = { name:'', phone:'', email:'', message:'' };
  const [sample, setSample] = useState(emptySample);
  const [contact, setContact] = useState(emptyContact);
  const [sampleBusy, setSampleBusy] = useState(false);
  const [contactBusy, setContactBusy] = useState(false);
  const [sampleMsg, setSampleMsg] = useState({ type:'', text:'' });
  const [contactMsg, setContactMsg] = useState({ type:'', text:'' });

  const heroSlides = [
    { src: cms?.hero_image ? `${apiOrigin}/${cms.hero_image}` : '/hero-slide-1.jpg', tag: 'Analytical Precision' },
    { src: '/hero-slide-2.jpg', tag: 'Chemical & Purity Analysis' },
    { src: '/hero-slide-3.jpg', tag: 'Accurate Testing Certification' },
  ];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 4200);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

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
  const defaultEmbed = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.3589961733287!2d77.5525126!3d11.0116687!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba9a180a88cb8a7%3A0xba96d3fb508d6259!2sKrishi%20Analytical%20Lab!5e0!3m2!1sen!2sin!4v1790512063225!5m2!1sen!2sin";
  const rawMap = cms?.map_embed_url;
  const mapEmbedUrl = (() => {
    if (!rawMap || typeof rawMap !== 'string' || !rawMap.trim()) return defaultEmbed;
    const s = rawMap.trim();
    if (s.includes('<iframe')) {
      const match = s.match(/src=["']([^"']+)["']/i);
      if (match && match[1]) return match[1];
    }
    if (s.includes('maps.app.goo.gl')) return defaultEmbed;
    if (s.startsWith('http://') || s.startsWith('https://')) return s;
    return defaultEmbed;
  })();
  const directMapUrl = "https://maps.app.goo.gl/ESrzRfHUkver8HTj7";
  const apiOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');
  const heroImg = cms?.hero_image ? `${apiOrigin}/${cms.hero_image}` : '/hero-lab.jpg';
  const aboutImg = cms?.about_image ? `${apiOrigin}/${cms.about_image}` : '/about-lab-team.jpg';
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
      {/* Top Bar - Yellow Background #FDE41D */}
      <div className="bg-[#FDE41D] text-gray-900 text-xs font-extrabold hidden sm:block border-b border-[#e5cd17]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-9 flex items-center justify-between">
          <div className="flex items-center gap-6 truncate">
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#0B6B43]" />{contactAddress}</span>
            <span className="hidden lg:flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[#0B6B43]" />{contactPhone}</span>
            <span className="hidden lg:flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[#0B6B43]" />{contactEmail}</span>
          </div>
          <span className="text-xs font-bold text-gray-900 hidden lg:block">{contactHours}</span>
        </div>
      </div>

      {/* Navbar - Reduced height with icons on nav links */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#D1D5DB] relative shadow-sm">
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-transparent via-[#168B57] to-transparent opacity-80" style={{ backgroundSize: '200% 100%', animation: 'gradientShift 2s linear infinite' }} />
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-[72px] sm:h-[78px] lg:h-[84px] flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center min-w-0">
            <img src="/krishi-transparent.png" alt="Krishi Analytical Lab" className="h-12 sm:h-14 lg:h-16 w-auto object-contain shrink-0" />
          </div>

          {/* Navigation Links with Icons & Active Underline */}
          <nav className="hidden lg:flex items-center gap-7 text-sm sm:text-base font-extrabold text-gray-900">
            {[
              { href: '#home', label: 'Home', Icon: Home },
              { href: '#about', label: 'About', Icon: Info },
              { href: '#services', label: 'Services', Icon: FlaskConical },
              { href: '#why', label: 'Why Us', Icon: Award },
              { href: '#contact', label: 'Contact', Icon: PhoneCall },
            ].map((navItem, idx) => (
              <a
                key={navItem.href}
                href={navItem.href}
                className="relative py-2 text-sm sm:text-base font-extrabold text-gray-900 hover:text-[#168B57] transition-all flex items-center gap-1.5 group tracking-wide"
              >
                <navItem.Icon className="w-4 h-4 text-[#168B57] group-hover:scale-110 transition-transform" />
                {navItem.label}
                {/* Active / Hover Green Underline Indicator */}
                <span className={`absolute bottom-0 left-0 w-full h-[3px] bg-[#168B57] rounded-full transition-transform duration-300 origin-left ${idx === 0 ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <a href="#contact" className="hidden sm:inline-flex bg-[#168B57] hover:bg-[#0B6B43] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
              Enquire Now
            </a>
            <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu" className="lg:hidden p-2 border border-[#D1D5DB] rounded-xl bg-white shadow-sm">
              {mobileOpen ? <X className="w-6 h-6 text-gray-800" /> : <Menu className="w-6 h-6 text-gray-800" />}
            </button>
          </div>
        </div>
      </header>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <aside className="absolute top-0 right-0 bottom-0 w-72 max-w-[85vw] bg-white border-l border-[#D1D5DB] flex flex-col shadow-[-8px_0_32px_rgba(0,0,0,0.12)] p-4 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between h-14 border-b border-[#D1D5DB]/60 pb-3 mb-4">
              <div className="flex items-center min-w-0">
                <img src="/krishi-transparent.png" alt="Krishi Analytical Lab" className="h-9 w-auto object-contain shrink-0" />
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

      {/* Hero Section - Full Covered 3-Image Banner Auto-Slider directly under Navbar */}
      <section id="home" className="relative w-full h-[360px] sm:h-[460px] md:h-[520px] lg:h-[580px] overflow-hidden bg-gray-900 group">
        {/* Clean auto-sliding images - 100% full covered width */}
        {heroSlides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={slide.src}
              alt={slide.tag}
              className="w-full h-full object-cover object-center"
            />
          </div>
        ))}

        {/* Top Floating Glass Badge */}
        <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-20 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200/80 text-xs sm:text-sm font-extrabold text-[#0B6B43] shadow-lg flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#168B57] animate-ping" />
          {heroSlides[currentSlide].tag}
        </div>

        {/* Previous Button */}
        <button
          onClick={() => setCurrentSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length)}
          aria-label="Previous Slide"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3.5 rounded-full bg-white/90 hover:bg-white text-[#0B6B43] shadow-xl border border-gray-200/80 transition-all opacity-80 group-hover:opacity-100 hover:scale-110 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Next Button */}
        <button
          onClick={() => setCurrentSlide((currentSlide + 1) % heroSlides.length)}
          aria-label="Next Slide"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3.5 rounded-full bg-white/90 hover:bg-white text-[#0B6B43] shadow-xl border border-gray-200/80 transition-all opacity-80 group-hover:opacity-100 hover:scale-110 active:scale-95"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Bottom Centered Pagination Dots */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200/80 shadow-lg">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all rounded-full ${
                idx === currentSlide
                  ? 'w-7 h-2.5 bg-[#168B57]'
                  : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </section>

      {/* HERO BOTTOM FULL-WIDTH FORM with premium #FDE41D and Emerald styling */}
      <Reveal>
        <section className="w-full bg-gradient-to-r from-[#F4FAF6] via-white to-[#F4FAF6] border-y border-[#D1EEE0] relative overflow-hidden py-2">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-40 h-40 bg-[#168B57]/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-[#FDE41D]/25 rounded-full blur-3xl" style={{ animationDelay: '1s' }} />
          </div>
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 relative">
            <div className="bg-white border-2 border-[#168B57]/20 rounded-2xl shadow-xl p-5 sm:p-6 relative overflow-hidden">
              {/* Premium Golden Yellow & Emerald top bar gradient */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#168B57] via-[#FDE41D] to-[#0B6B43]" style={{ backgroundSize: '200% 100%', animation: 'gradientShift 3s linear infinite' }} />
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5">
                <div>
                  <p className="text-base font-black text-gray-900 flex items-center gap-2">
                    <TestTube className="w-5 h-5 text-[#168B57]" /> Quick Sample Enquiry
                  </p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Submit sample request — we’ll call back within 30 minutes</p>
                </div>
                <span className="hidden sm:flex items-center gap-2 text-xs font-black text-gray-900 bg-[#FDE41D] px-4 py-1.5 rounded-full shadow-sm border border-[#e2cb10]">
                  <span className="w-2.5 h-2.5 bg-[#168B57] rounded-full animate-ping" /> Live Sample Portal
                </span>
              </div>

              <form className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5" onSubmit={submitSample}>
                <div className="relative group">
                  <input required value={sample.name} onChange={e=>setSample({...sample, name:e.target.value})} placeholder="Your Name *" className="w-full border border-gray-300 rounded-xl px-3.5 py-3 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#168B57] focus:border-[#168B57] transition-all bg-white hover:border-[#168B57]/50 shadow-sm" />
                </div>
                <div className="relative group">
                  <input required value={sample.phone} onChange={e=>setSample({...sample, phone:e.target.value})} placeholder="Phone Number *" className="w-full border border-gray-300 rounded-xl px-3.5 py-3 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#168B57] focus:border-[#168B57] transition-all bg-white hover:border-[#168B57]/50 shadow-sm" />
                </div>
                <div className="relative group">
                  <input type="email" value={sample.email} onChange={e=>setSample({...sample, email:e.target.value})} placeholder="Email (optional — for auto report)" className="w-full border border-gray-300 rounded-xl px-3.5 py-3 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#168B57] focus:border-[#168B57] transition-all bg-white hover:border-[#168B57]/50 shadow-sm" />
                </div>
                <div className="relative group">
                  <select value={sample.sample_type} onChange={e=>setSample({...sample, sample_type:e.target.value})} className="w-full border border-gray-300 rounded-xl px-3.5 py-3 text-xs font-bold text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#168B57] focus:border-[#168B57] transition-all hover:border-[#168B57]/50 shadow-sm">
                    <option value="">Select Sample Type</option>
                    <option>Water</option>
                    <option>Oil</option>
                    <option>Ghee</option>
                    <option>Animal Feed</option>
                    <option>Rice Bran</option>
                  </select>
                </div>
                <div className="relative group">
                  <input value={sample.message} onChange={e=>setSample({...sample, message:e.target.value})} placeholder="Notes / Specific Test Requirement" className="w-full border border-gray-300 rounded-xl px-3.5 py-3 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#168B57] focus:border-[#168B57] transition-all bg-white hover:border-[#168B57]/50 shadow-sm" />
                </div>
                <button disabled={sampleBusy} className="bg-gradient-to-r from-[#168B57] via-[#0B6B43] to-[#168B57] hover:from-[#0B6B43] hover:to-[#0B6B43] text-white rounded-xl px-6 py-3 text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60">
                  {sampleBusy ? 'Submitting...' : <>Submit Enquiry <Sparkles className="w-4 h-4 text-[#FDE41D]" /></>}
                </button>
                {sampleMsg.text && <p className={`sm:col-span-2 lg:col-span-3 text-xs font-extrabold ${sampleMsg.type==='ok' ? 'text-[#0B6B43]' : 'text-red-600'}`}>{sampleMsg.text}</p>}
              </form>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                <span className="w-6 h-1.5 bg-[#168B57] rounded-full" />
                <span className="w-6 h-1.5 bg-[#FDE41D] rounded-full" />
                <span className="w-6 h-1.5 bg-sky-500 rounded-full" />
                <span className="text-[11px] font-bold text-gray-600 ml-2">Krishi Precision Assurance • 24hr COA Turnaround</span>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Stats Strip with #FDE41D accent pills */}
      <Reveal>
        <section className="bg-gradient-to-r from-[#EAF7F0] via-emerald-50/60 to-[#EAF7F0] border-y border-[#D1EEE0]">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-7 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
              <p className="text-3xl font-black text-[#0B6B43]">{cms?.stat1_value ?? '5'}</p>
              <p className="text-xs font-bold text-gray-600 mt-0.5">{cms?.stat1_label ?? 'Report Types'}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
              <p className="text-3xl font-black text-[#0B6B43]">{cms?.stat2_value ?? '38+'}</p>
              <p className="text-xs font-bold text-gray-600 mt-0.5">{cms?.stat2_label ?? 'Test Parameters'}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
              <p className="text-3xl font-black text-[#0B6B43]">{cms?.stat3_value ?? '1000+'}</p>
              <p className="text-xs font-bold text-gray-600 mt-0.5">{cms?.stat3_label ?? 'Reports Generated'}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
              <p className="text-3xl font-black text-[#0B6B43]">{cms?.stat4_value ?? '24/7'}</p>
              <p className="text-xs font-bold text-gray-600 mt-0.5">{cms?.stat4_label ?? 'Support'}</p>
            </div>
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

      {/* Services with scroll animation & spread floating background icons */}
      <section id="services" className="bg-gradient-to-b from-white via-emerald-50/30 to-white border-y border-gray-100 py-16 relative overflow-hidden">
        {/* Spread background floating icons */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <Beaker className="w-20 h-20 text-[#168B57]/15 absolute top-10 left-[8%] animate-pulse" />
          <FlaskConical className="w-24 h-24 text-[#FDE41D]/40 absolute top-1/3 right-[5%] float" />
          <Droplets className="w-16 h-16 text-sky-500/15 absolute bottom-12 left-[15%] float-delay" />
          <Leaf className="w-20 h-20 text-[#168B57]/15 absolute bottom-20 right-[18%] animate-bounce" style={{ animationDuration: '6s' }} />
          <Wheat className="w-28 h-28 text-amber-500/15 absolute top-1/2 left-[3%]" />
          <TestTube className="w-16 h-16 text-[#168B57]/15 absolute top-16 right-[25%]" />
          <Sparkles className="w-14 h-14 text-[#FDE41D]/40 absolute bottom-1/3 left-[28%]" />
        </div>

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 relative z-10">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FDE41D] text-gray-900 text-[11px] font-black uppercase tracking-wider shadow-sm border border-[#e2cb10]">
                <FlaskConical className="w-3.5 h-3.5 text-[#0B6B43]" /> Analytical Categories
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-gray-900">Our Testing Services</h2>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Certified laboratory analysis for agro and food industries — from Water to Rice Bran</p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-5">
            {[
              { title: 'Water', sub: 'Certificate of Analysis', img: '/service-water.jpg', icon: Droplets, params: ['pH', 'TDS', 'TH', 'TSS', 'Turbidity'], color: 'sky' },
              { title: 'Oil', sub: 'Certificate of Analysis', img: '/service-oil.jpg', icon: FlaskConical, params: ['FFA', 'Moisture', 'Iodine Value', 'Specific Gravity'], color: 'amber' },
              { title: 'Ghee', sub: 'Certificate of Analysis', img: '/service-oil.jpg', icon: Beaker, params: ['FFA', 'Moisture', 'BR Reading', 'RM Value', 'Polenske Value'], color: 'yellow' },
              { title: 'Animal Feed', sub: 'Certificate of Analysis', img: '/service-feed.jpg', icon: Wheat, params: ['Oil Content', 'FFA', 'Protein', 'Fiber', 'Silica'], color: 'emerald' },
              { title: 'Rice Bran', sub: 'Certificate of Analysis', img: '/service-rice.jpg', icon: Leaf, params: ['Oil Content', 'Ash', 'Moisture', 'Rancidity', 'Protein'], color: 'orange' },
            ].map((s, idx) => (
              <div key={s.title} className={idx < 2 ? 'lg:col-span-3' : 'lg:col-span-2'}>
                <Reveal delay={idx * 80}>
                  <div className={`group relative overflow-hidden rounded-2xl ${idx < 2 ? 'h-[360px]' : 'h-[320px]'} hover:-translate-y-1.5 transition-all duration-300 shadow-xl border border-gray-200/80 bg-white`}>
                    <img src={s.img} alt={s.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    
                    {/* Bottom-to-Top Gradient Fade: Bright at top, very low shade fade transitioning to dark at bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B6B43]/95 via-[#0B6B43]/40 via-45% to-transparent" />
                    
                    <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
                      <div className="w-12 h-12 rounded-2xl bg-white text-[#0B6B43] shadow-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <s.icon className="w-6 h-6 text-[#168B57]" />
                      </div>
                      <p className="text-[10px] font-black tracking-[0.25em] text-[#FDE41D]">{s.sub.toUpperCase()}</p>
                      <h3 className="text-white text-xl sm:text-2xl font-black mt-0.5 drop-shadow">{s.title} Testing</h3>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {s.params.map(ch => (
                          <span key={ch} className="border border-white/40 bg-black/30 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">{ch}</span>
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

      {/* Testimonials / Trusted Customers Section */}
      <section id="testimonials" className="bg-gradient-to-b from-white via-emerald-50/40 to-white py-14 border-t border-gray-100 relative overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 text-[#0B6B43] text-[11px] font-extrabold uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5" /> Client Reviews
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                Trusted by Agro & Oil Merchants
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">
                Leading traders, feed mills, and oil refineries rely on Krishi Analytical Lab for accurate Certificate of Analysis reports.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
            {[
              {
                company: 'SM Traders',
                type: 'Oil Seeds & Grain Merchant',
                loc: 'Kangeyam',
                text: 'Krishi Lab provides fast 24-hour Certificate of Analysis for our oil seed shipments. Extremely reliable testing quality in Kangeyam!',
                rating: 5,
              },
              {
                company: 'Shree Feeds',
                type: 'Animal Feed Manufacturer',
                loc: 'Tiruppur',
                text: 'Accurate moisture, protein, and fat testing for our animal feed batches. Their clear COA reports help us maintain feed standard quality.',
                rating: 5,
              },
              {
                company: 'AMARJOTHI RICE MILL',
                type: 'Rice Mill & Agro Foods',
                loc: 'Kangeyam',
                text: 'Krishi Analytical Lab provides rapid and accurate quality testing for our rice mill products. Highly reliable testing quality and report speed!',
                rating: 5,
              },
              {
                company: 'THIRUMAGAL TRADERS',
                type: 'Grain & Feed Merchant',
                loc: 'Tiruppur',
                text: 'Fast turn-around time and trustworthy Certificate of Analysis reports. Outstanding service quality and professional staff support.',
                rating: 5,
              },
            ].map((item, idx) => (
              <Reveal key={item.company} delay={idx * 100}>
                <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#168B57]/40 transition-all flex flex-col justify-between h-full relative group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex text-amber-400 gap-0.5">
                        {[...Array(item.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <Quote className="w-6 h-6 text-emerald-200 group-hover:text-[#168B57]/40 transition-colors" />
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed italic">
                      "{item.text}"
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-gray-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EAF7F0] text-[#0B6B43] font-black text-xs flex items-center justify-center border border-[#D1EEE0]">
                      {item.company.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-900">{item.company}</p>
                      <p className="text-[10px] font-semibold text-[#168B57]">{item.type} • {item.loc}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
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
                { s: 'We Log Sample', d: 'We record sample details, customer name and date accurately', c: 'bg-[#0B6B43]', Icon: ClipboardList },
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
            <div className="bg-white border border-[#D1D5DB] rounded-2xl overflow-hidden shadow-sm">
              <div className="h-60 sm:h-64 w-full relative">
                <iframe
                  src={mapEmbedUrl}
                  title="Krishi Analytical Lab Location Map"
                  className="w-full h-full border-0"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="p-3 bg-[#F9FAFB] border-t border-[#D1D5DB] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <MapPin className="w-4 h-4 text-[#168B57] shrink-0" />
                  <span className="text-xs font-bold truncate text-[#1F2937]">Krishi Analytical Lab • Kangeyam</span>
                </div>
                <a
                  href={directMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 bg-[#168B57] hover:bg-[#0B6B43] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm shrink-0"
                >
                  Get Directions <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <form className="bg-white border-2 border-[#168B57]/20 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xl relative overflow-hidden" onSubmit={submitContact}>
            {/* Golden Yellow Top Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#168B57] via-[#FDE41D] to-[#0B6B43]" />

            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#168B57]" /> Send Direct Enquiry
              </h3>
              <p className="text-xs text-gray-500 font-medium">Have questions or custom testing requirements? Message us directly.</p>
            </div>

            <div>
              <input required value={contact.name} onChange={e=>setContact({...contact, name:e.target.value})} placeholder="Your Full Name *" className="w-full border border-gray-300 rounded-xl px-4 py-3 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#168B57] focus:border-[#168B57] transition-all bg-white hover:border-[#168B57]/50 shadow-sm" />
            </div>
            <div>
              <input required value={contact.phone} onChange={e=>setContact({...contact, phone:e.target.value})} placeholder="Phone Number *" className="w-full border border-gray-300 rounded-xl px-4 py-3 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#168B57] focus:border-[#168B57] transition-all bg-white hover:border-[#168B57]/50 shadow-sm" />
            </div>
            <div>
              <input type="email" value={contact.email} onChange={e=>setContact({...contact, email:e.target.value})} placeholder="Email Address (optional)" className="w-full border border-gray-300 rounded-xl px-4 py-3 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#168B57] focus:border-[#168B57] transition-all bg-white hover:border-[#168B57]/50 shadow-sm" />
            </div>
            <div>
              <textarea value={contact.message} onChange={e=>setContact({...contact, message:e.target.value})} placeholder="Your Message / Inquiry Details..." rows={4} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#168B57] focus:border-[#168B57] transition-all bg-white hover:border-[#168B57]/50 shadow-sm" />
            </div>
            <button disabled={contactBusy} className="w-full bg-gradient-to-r from-[#168B57] via-[#0B6B43] to-[#168B57] hover:from-[#0B6B43] hover:to-[#0B6B43] text-white py-3.5 rounded-xl font-extrabold text-xs transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 flex items-center justify-center gap-2">
              {contactBusy ? 'Sending...' : <>Send Message <Sparkles className="w-4 h-4 text-[#FDE41D]" /></>}
            </button>
            {contactMsg.text && <p className={`text-xs font-extrabold text-center ${contactMsg.type==='ok' ? 'text-[#0B6B43]' : 'text-red-600'}`}>{contactMsg.text}</p>}
          </form>
        </Reveal>
      </section>

      {/* Footer with background image & deep emerald shade overlay */}
      <footer className="relative text-white overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img src="/hero-slide-1.jpg" alt="Footer Lab Background" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B6B43]/95 via-[#07472c]/90 to-[#0B6B43]/95 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-[#0B6B43]/40" />
        </div>

        {/* Top Golden Yellow Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#168B57] via-[#FDE41D] to-[#0B6B43]" />

        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 pt-12 pb-8 grid sm:grid-cols-3 gap-8 text-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img src="/krishi-transparent.png" alt="Krishi Analytical Lab" className="h-12 w-auto object-contain" />
            </div>
            <p className="opacity-90 font-medium text-gray-200 leading-relaxed max-w-sm">
              Discovering Solutions, One Test at a Time. ISO standard & NABL aligned analytical testing laboratory in Kangeyam.
            </p>
            <p className="opacity-80 font-semibold flex items-center gap-1.5 text-emerald-200">
              <MapPin className="w-3.5 h-3.5 text-[#FDE41D]" /> 182-B, Tiruppur Road, Kangeyam - 638701
            </p>
          </div>
          <div>
            <p className="font-extrabold text-sm mb-3 text-[#FDE41D]">Quick Navigation</p>
            <div className="space-y-2 opacity-90 font-semibold text-gray-200">
              <a href="#home" className="block hover:text-[#FDE41D] transition-colors">Home</a>
              <a href="#about" className="block hover:text-[#FDE41D] transition-colors">About Us</a>
              <a href="#services" className="block hover:text-[#FDE41D] transition-colors">Services & Testing</a>
              <a href="#testimonials" className="block hover:text-[#FDE41D] transition-colors">Client Reviews</a>
              <a href="#contact" className="block hover:text-[#FDE41D] transition-colors">Contact Us</a>
            </div>
          </div>
          <div>
            <p className="font-extrabold text-sm mb-3 text-[#FDE41D]">Testing Services</p>
            <div className="space-y-2 opacity-90 font-semibold text-gray-200">
              <p>• Drinking & Industrial Water Analysis</p>
              <p>• Edible & Vegetable Oil Testing</p>
              <p>• Pure Ghee Purity Analysis</p>
              <p>• Animal Feed Quality Testing</p>
              <p>• Rice Bran Oil COA Certification</p>
            </div>
          </div>
        </div>
        <div className="relative border-t border-white/15 text-center py-4 text-xs font-semibold opacity-80 bg-black/30">
          © 2026 Krishi Analytical Lab. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
export default Landing;
