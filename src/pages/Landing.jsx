import React, { useState, useEffect, useRef } from 'react';
import {
  Droplets,
  FlaskConical,
  Beaker,
  Wheat,
  Leaf,
  CheckCircle,
  Clock,
  ShieldCheck,
  FileText,
  Lock,
  Printer,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Award,
  Zap,
  Settings2,
  TestTube,
  Sparkles,
  User,
  ClipboardList,
  FileCheck,
  ArrowRight,
  ChevronDown,
  Star,
  Quote,
  Building2,
  ExternalLink,
  Eye,
  Check,
  Search
} from 'lucide-react';
import api from '../services/api';

const Reveal = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVisible(true);
        obs.disconnect();
      }
    }, { threshold: 0.12 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  );
};

// 12-point radiant starburst matching reference icon
const StarburstIcon = ({ className = 'w-7 h-7 text-[#3af04f]' }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
    <g transform="translate(50,50)">
      {[...Array(12)].map((_, i) => (
        <rect
          key={i}
          x="-3.5"
          y="-45"
          width="7"
          height="28"
          rx="3.5"
          transform={`rotate(${i * 30})`}
        />
      ))}
      <circle cx="0" cy="0" r="10" />
    </g>
  </svg>
);

// 4-point sparkle star
const Sparkle4 = ({ className = 'w-5 h-5 text-[#3af04f]' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
  </svg>
);

// Lab Equipment: Floating Erlenmeyer Flask
const LabFlaskDecor = ({ className = 'w-10 h-10 text-[#168B57]' }) => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 6h10M21 6v10l-9.5 19a4 4 0 0 0 3.5 6h18a4 4 0 0 0 3.5-6L27 16V6" />
    <path d="M14 29h20" strokeDasharray="2 2" />
    <circle cx="20" cy="33" r="1.5" fill="currentColor" />
    <circle cx="27" cy="35" r="1" fill="currentColor" />
  </svg>
);

// Lab Equipment: Chemical Benzene / Molecular Structure
const LabMoleculeDecor = ({ className = 'w-12 h-12 text-[#168B57]' }) => (
  <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <polygon points="30,8 48,18 48,40 30,50 12,40 12,18" />
    <circle cx="30" cy="8" r="3" fill="currentColor" />
    <circle cx="48" cy="18" r="3" fill="currentColor" />
    <circle cx="48" cy="40" r="3" fill="currentColor" />
    <circle cx="30" cy="50" r="3" fill="currentColor" />
    <circle cx="12" cy="40" r="3" fill="currentColor" />
    <circle cx="12" cy="18" r="3" fill="currentColor" />
    <circle cx="30" cy="29" r="6" strokeDasharray="3 3" />
  </svg>
);

// Lab Equipment: Precision Microscope
const LabMicroscopeDecor = ({ className = 'w-10 h-10 text-[#168B57]' }) => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 42h24M24 42V32M18 32h12M24 8l8 14-6 3-8-14 6-3zM28 20a6 6 0 1 1-12 0 6 6 0 0 1 12 0z" />
    <path d="M16 28a8 8 0 0 0 8 8" />
  </svg>
);

// Lab Equipment: Test Tube Stand
const LabTestTubesDecor = ({ className = 'w-10 h-10 text-[#168B57]' }) => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
    <path d="M8 38h32M12 12v22a3 3 0 0 0 6 0V12M22 12v22a3 3 0 0 0 6 0V12M32 12v22a3 3 0 0 0 6 0V12" />
    <path d="M12 26h6M22 22h6M32 29h6" />
  </svg>
);

// Lab Equipment: Graduated Beaker
const LabBeakerDecor = ({ className = 'w-8 h-8 text-[#168B57]' }) => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10 8h28M12 8v28a6 6 0 0 0 6 6h12a6 6 0 0 0 6-6V8" />
    <path d="M12 16h6M12 24h10M12 32h8" />
    <path d="M12 30c4 0 6-2 12-2s8 2 12 2" strokeDasharray="2 2" />
  </svg>
);

export const Landing = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cms, setCms] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [sampleModalOpen, setSampleModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [activeService, setActiveService] = useState(0);

  useEffect(() => {
    api.get('/cms/landing').then(r => setCms(r.data)).catch(() => {});
    api.get('/testimonials').then(r => setTestimonials(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    api.post('/traffic/visit', { page_url: window.location.pathname }).catch(() => {});
  }, []);

  const emptySample = { name: '', phone: '', email: '', sample_type: '', message: '' };
  const emptyContact = { name: '', phone: '', email: '', message: '' };
  const [sample, setSample] = useState(emptySample);
  const [contact, setContact] = useState(emptyContact);
  const [sampleBusy, setSampleBusy] = useState(false);
  const [contactBusy, setContactBusy] = useState(false);
  const [sampleMsg, setSampleMsg] = useState({ type: '', text: '' });
  const [contactMsg, setContactMsg] = useState({ type: '', text: '' });

  const submitSample = async (e) => {
    e.preventDefault();
    if (!sample.name.trim() || !sample.phone.trim()) {
      setSampleMsg({ type: 'error', text: 'Name and phone are required' });
      return;
    }
    setSampleBusy(true);
    setSampleMsg({ type: '', text: '' });
    try {
      const r = await api.post('/enquiries', {
        ...sample,
        type: 'sample',
        sample_type: sample.sample_type || null,
        email: sample.email || null,
        message: sample.message || null
      });
      setSample(emptySample);
      setSampleMsg({ type: 'ok', text: `Submitted! Reference ${r.data.ref} — we'll call you back shortly.` });
    } catch (err) {
      setSampleMsg({ type: 'error', text: err.response?.data?.message || 'Failed — please try again' });
    } finally {
      setSampleBusy(false);
    }
  };

  const submitContact = async (e) => {
    e.preventDefault();
    if (!contact.name.trim() || !contact.phone.trim()) {
      setContactMsg({ type: 'error', text: 'Name and phone are required' });
      return;
    }
    setContactBusy(true);
    setContactMsg({ type: '', text: '' });
    try {
      const r = await api.post('/enquiries', {
        ...contact,
        type: 'enquiry',
        message: contact.message || null
      });
      setContact(emptyContact);
      setContactMsg({ type: 'ok', text: `Sent! Reference ${r.data.ref} — check your inbox for the acknowledgement.` });
    } catch (err) {
      setContactMsg({ type: 'error', text: err.response?.data?.message || 'Failed — please try again' });
    } finally {
      setContactBusy(false);
    }
  };

  const contactPhone = cms?.contact_phone || '+91 63793 12357';
  const contactEmail = cms?.contact_email || 'krishianalyticallab@gmail.com';
  const contactAddress = cms?.contact_address || '182-B, Reliance Trends Near, Tiruppur Road, Kangeyam - 638701';
  const contactHours = cms?.contact_hours || 'Mon - Sat: 9am - 6pm';
  const defaultEmbed = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.3589961733287!2d77.5525126!3d11.0116687!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba9a180a88cb8a7%3A0xba96d3fb508d6259!2sKrishi%20Analytical%20Lab!5e0!3m2!1sen!2sin!4v1790512063225!5m2!1sen!2sin';
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
  const directMapUrl = 'https://maps.app.goo.gl/ESrzRfHUkver8HTj7';

  const servicesList = [
    {
      num: '01',
      title: 'Water Analysis',
      sub: 'Drinking, Industrial & Effluent Testing',
      params: ['pH Level', 'TDS', 'Total Hardness (TH)', 'TSS', 'Turbidity', 'Chlorides'],
      icon: Droplets,
      sampleVal: 'Water',
      badge: 'Certified COA',
      image: '/krishi-founder-services.jpg',
      chemist: 'Senior Analytical Chemist • Krishi Lab',
      tech: 'Spectrophotometry, TDS & pH Titration',
      tag: 'POTABLE & EFFLUENT ANALYSIS'
    },
    {
      num: '02',
      title: 'Oil & Fat Testing',
      sub: 'Edible & Industrial Oils Quality',
      params: ['Free Fatty Acids (FFA)', 'Moisture Value', 'Iodine Value', 'Specific Gravity', 'Saponification'],
      icon: FlaskConical,
      sampleVal: 'Oil',
      badge: 'High Accuracy',
      image: '/krishi-founder-services.jpg',
      chemist: 'Senior Analytical Chemist • Krishi Lab',
      tech: 'Gas Chromatography (GC-MS) & FFA Titration',
      tag: 'EDIBLE & INDUSTRIAL OIL STANDARDS'
    },
    {
      num: '03',
      title: 'Pure Ghee Testing',
      sub: 'Purity & Adulteration Detection',
      params: ['B.R Reading @ 40°C', 'Reichert Meissl (RM) Value', 'Polenske Value', 'Peroxide Value', 'Baudouin Test'],
      icon: Beaker,
      sampleVal: 'Ghee',
      badge: 'Adulteration Check',
      image: '/krishi-founder-services.jpg',
      chemist: 'Senior Analytical Chemist • Krishi Lab',
      tech: 'Digital Refractometry (BR @ 40°C) & RM Value',
      tag: 'PURITY & ADULTERATION TESTING'
    },
    {
      num: '04',
      title: 'Animal Feed Analysis',
      sub: 'Nutritional & Physical Parameters',
      params: ['Oil Content (OC)', 'Crude Protein', 'Crude Fiber', 'Total Ash', 'Sand & Silica'],
      icon: Wheat,
      sampleVal: 'Animal Feed',
      badge: 'Nutrition Grade',
      image: '/krishi-founder-services.jpg',
      chemist: 'Senior Analytical Chemist • Krishi Lab',
      tech: 'Crude Protein, Crude Fiber & Ash Digestion',
      tag: 'CATTLE & POULTRY FEED NUTRITION'
    },
    {
      num: '05',
      title: 'Rice Bran Quality',
      sub: 'Extraction & Processing Standards',
      params: ['Oil Content (OC %)', 'Free Fatty Acid (FFA)', 'Sand & Silica', 'Moisture', 'Rancidity'],
      icon: Leaf,
      sampleVal: 'Rice Bran',
      badge: 'Mill Standard',
      image: '/krishi-founder-services.jpg',
      chemist: 'Senior Analytical Chemist • Krishi Lab',
      tech: 'Solvent Extraction (Soxhlet) & Sand Silica',
      tag: 'RICE BRAN OIL EXTRACTION SPEC'
    }
  ];


  const fallbackTestimonials = [
    {
      company: 'Deivam Dairy & Foods',
      type: 'Pure Ghee & Butter',
      loc: 'Uthukuli',
      rating: 5,
      text: 'Krishi Lab provides rapid, tamper-proof Certificate of Analysis for every batch of ghee. The BR reading and RM values are exceptionally accurate.'
    },
    {
      company: 'Laxmi Traders',
      type: 'Rice Bran Oil Mill',
      loc: 'Kangeyam',
      rating: 5,
      text: 'Our commercial loads are cleared within hours thanks to their speedy 24hr turnaround. Digital report access makes our trade operations seamless.'
    },
    {
      company: 'Shri Balaji Feed Mill',
      type: 'Animal Feed Processing',
      loc: 'Tiruppur',
      rating: 5,
      text: 'The protein and fiber breakdown is tested with precision instruments. Non-technical staff can understand the reports instantly.'
    },
    {
      company: 'A.R.G. Agro Industries',
      type: 'Edible Oil Refineries',
      loc: 'Thanjavur',
      rating: 5,
      text: 'Strict adherence to NABL parameters and certified stamp. Highly recommended for agro-processing units across Tamil Nadu.'
    }
  ];

  const displayedTestimonials = testimonials.length > 0 ? testimonials : fallbackTestimonials;

  return (
    <div className="min-h-screen bg-[#0A0D0C] text-white selection:bg-[#3af04f] selection:text-black font-sans relative overflow-x-hidden">
      {/* ---------------------------------------------------- */}
      {/* TOP HERO WHITE CANVAS CARD (MATCHING USER REFERENCE) */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white text-gray-900 rounded-b-[36px] sm:rounded-b-[48px] lg:rounded-b-[56px] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.35)] relative overflow-hidden pt-3 sm:pt-5 pb-8 sm:pb-10 border-b border-gray-100">
        
        {/* SPREAD LAB EQUIPMENT DECORATORS (REPLACING GENERIC GREEN DOODLES) */}
        <div className="absolute top-6 left-6 sm:left-10 pointer-events-none opacity-40 float">
          <LabFlaskDecor className="w-10 h-10 sm:w-14 sm:h-14 text-[#168B57]" />
        </div>
        <div className="absolute top-10 right-6 sm:right-14 pointer-events-none opacity-40 float-delay">
          <LabMoleculeDecor className="w-12 h-12 sm:w-16 sm:h-16 text-[#168B57]" />
        </div>
        <div className="absolute top-44 left-3 sm:left-6 pointer-events-none opacity-25 hidden sm:block">
          <LabTestTubesDecor className="w-9 h-9 text-[#168B57]" />
        </div>
        <div className="absolute top-44 right-3 sm:right-6 pointer-events-none opacity-25 hidden sm:block">
          <LabBeakerDecor className="w-8 h-8 text-[#168B57]" />
        </div>

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          
          {/* ==================================================== */}
          {/* INTEGRATED WHITE NAVBAR (LOGO LEFT, LINKS CENTER, ATTRACTIVE CTA RIGHT) */}
          {/* ==================================================== */}
          <header className="relative z-50 pt-1 sm:pt-2 pb-3">
            <div className="flex items-center justify-between w-full max-w-7xl mx-auto px-1 sm:px-3">
              
              {/* Left Side: Brand Logo */}
              <a href="#home" className="flex items-center group transition-transform duration-300 hover:scale-105 shrink-0">
                <img
                  src="/krishi-transparent.png"
                  alt="Krishi Analytical Laboratory"
                  className="h-10 sm:h-12 md:h-14 w-auto object-contain"
                />
              </a>

              {/* Center Navigation Links */}
              <nav className="hidden lg:flex items-center gap-7 text-xs sm:text-sm font-semibold text-gray-700">
                <a href="#home" className="hover:text-[#168B57] transition-colors font-bold text-gray-900">Home</a>
                <a href="#about" className="hover:text-[#168B57] transition-colors flex items-center gap-1.5 group">
                  <Building2 className="w-3.5 h-3.5 text-[#168B57] group-hover:scale-110 transition-transform" />
                  <span>About Us</span>
                </a>
                <a href="#services" className="hover:text-[#168B57] transition-colors flex items-center gap-1.5 group">
                  <FlaskConical className="w-3.5 h-3.5 text-[#168B57] group-hover:scale-110 transition-transform" />
                  <span>Services</span>
                </a>
                <a href="#why" className="hover:text-[#168B57] transition-colors flex items-center gap-1.5 group">
                  <Award className="w-3.5 h-3.5 text-[#168B57] group-hover:scale-110 transition-transform" />
                  <span>Why Us</span>
                </a>
                <a href="#contact" className="hover:text-[#168B57] transition-colors flex items-center gap-1.5 group">
                  <Phone className="w-3.5 h-3.5 text-[#168B57] group-hover:scale-110 transition-transform" />
                  <span>Contact</span>
                </a>
              </nav>

              {/* Right Side: Attractive Book Test Button & Mobile Menu Toggle */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSampleModalOpen(true)}
                  className="hidden sm:flex relative group overflow-hidden bg-gradient-to-r from-[#168B57] via-[#0E7A4A] to-[#0B5C38] hover:from-[#1AA366] hover:to-[#168B57] text-white font-black text-xs sm:text-sm px-5 sm:px-6 py-2.5 rounded-full shadow-lg shadow-emerald-700/25 hover:shadow-xl hover:shadow-emerald-600/35 active:scale-95 transition-all duration-300 items-center gap-2 border border-emerald-400/40"
                >
                  <span className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />
                  <TestTube className="w-4 h-4 text-emerald-200 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="tracking-wide">Book Test</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-200 group-hover:translate-x-1 transition-transform duration-300" />
                </button>

                {/* Mobile Menu Toggle Button */}
                <div className="flex lg:hidden items-center">
                  <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle Menu"
                    className="p-2 text-gray-800 hover:text-black rounded-lg hover:bg-gray-100"
                  >
                    {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                </div>
              </div>

            </div>

            {/* Mobile Slide-Down Menu (Clean White Card) */}
            {mobileOpen && (
              <div className="lg:hidden mt-3 bg-white border border-gray-200 rounded-3xl p-5 shadow-2xl text-gray-900 space-y-2.5">
                <a
                  href="#home"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-bold text-gray-800 hover:bg-gray-100"
                >
                  Home
                </a>
                <a
                  href="#about"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-gray-800 hover:bg-gray-100"
                >
                  <Building2 className="w-4 h-4 text-[#168B57]" /> About Us
                </a>
                <a
                  href="#services"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-gray-800 hover:bg-gray-100"
                >
                  <FlaskConical className="w-4 h-4 text-[#168B57]" /> Services
                </a>
                <a
                  href="#why"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-gray-800 hover:bg-gray-100"
                >
                  <Award className="w-4 h-4 text-[#168B57]" /> Why Us
                </a>
                <a
                  href="#contact"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-gray-800 hover:bg-gray-100"
                >
                  <Phone className="w-4 h-4 text-[#168B57]" /> Contact
                </a>
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <a
                    href="/panel"
                    className="text-xs font-bold text-gray-600 hover:text-black flex items-center gap-1.5"
                  >
                    Staff Portal →
                  </a>
                  <button
                    onClick={() => { setMobileOpen(false); setSampleModalOpen(true); }}
                    className="bg-[#168B57] text-white font-extrabold px-4 py-2 rounded-full text-xs shadow-md"
                  >
                    Book Sample Test
                  </button>
                </div>
              </div>
            )}
          </header>

          {/* ==================================================== */}
          {/* NEXORA-STYLE HERO: SPLIT HEADLINE & OVERLAPPING GIRL */}
          {/* ==================================================== */}
          {/* ==================================================== */}
          {/* MOBILE HERO SECTION (ADAPTABLE, GORGEOUS & TOUCH-FRIENDLY) */}
          {/* ==================================================== */}
          <div className="lg:hidden block mt-2 space-y-3">
            
            {/* Top Compact Brand Headline */}
            <div className="text-center pt-1 px-1">
              <h1 className="font-display font-black text-3xl sm:text-4xl text-gray-900 leading-tight tracking-tight">
                REPORTS <span className="text-[#0B6B43]">DELIVERED</span>
              </h1>
              <p className="text-xs text-gray-500 mt-1 font-medium max-w-xs mx-auto">
                Government-standard food, oil & water testing with 24h turnaround.
              </p>
            </div>

            {/* Mobile Emerald Curved Hero Card */}
            <div className="relative rounded-3xl bg-gradient-to-br from-[#126e45] via-[#0E5B37] to-[#0A4328] text-white p-5 shadow-2xl overflow-hidden">
              
              {/* Subtle background SVG waves */}
              <div className="absolute inset-0 opacity-15 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 500 500" preserveAspectRatio="none">
                  <path d="M0,80 Q125,180 250,70 T500,100 L500,500 L0,500 Z" fill="white" />
                  <circle cx="80" cy="380" r="120" fill="white" opacity="0.1" />
                  <circle cx="420" cy="160" r="150" fill="white" opacity="0.1" />
                </svg>
              </div>

              {/* Text & CTAs */}
              <div className="relative z-10 text-center">
                <h2 className="font-display font-black text-xl sm:text-2xl text-white leading-snug">
                  Where Precision Meets Absolute Confidence
                </h2>
                <p className="text-xs text-emerald-100/90 mt-1.5 leading-relaxed font-normal max-w-xs mx-auto">
                  Elevate your agro-commodity quality with tamper-proof laboratory testing trusted by 500+ mills.
                </p>

                {/* Primary Touch-Friendly CTA Buttons */}
                <div className="flex items-center justify-center gap-2.5 pt-3">
                  <button
                    onClick={() => setSampleModalOpen(true)}
                    className="bg-black hover:bg-gray-900 text-white font-extrabold text-xs px-5 py-2.5 rounded-full shadow-xl active:scale-95 transition-all flex items-center gap-1.5 border border-white/10"
                  >
                    Book Sample Test <ArrowRight className="w-3.5 h-3.5 text-[#3af04f]" />
                  </button>
                  <a
                    href="#services"
                    className="bg-white/15 hover:bg-white/25 text-white font-bold text-xs px-4 py-2.5 rounded-full backdrop-blur-md"
                  >
                    View Services
                  </a>
                </div>
              </div>

              {/* Chemist Girl Spotlight Stage with Floating Badges */}
              <div className="relative mt-4 pt-1 flex justify-center items-end">
                {/* Radial Glow Aura */}
                <div className="absolute inset-0 m-auto w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

                {/* Left Floating Badge */}
                <div className="absolute top-2 left-0 z-20 bg-black/60 backdrop-blur-md border border-white/20 rounded-full px-2.5 py-1 text-[10px] font-bold text-white shadow-lg flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3af04f] animate-ping" />
                  <span>Rapid 24h TAT</span>
                </div>

                {/* Right Floating Badge */}
                <div className="absolute top-8 right-0 z-20 bg-black/60 backdrop-blur-md border border-white/20 rounded-full px-2.5 py-1 text-[10px] font-bold text-emerald-200 shadow-lg flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-[#3af04f]" />
                  <span>100% Certified</span>
                </div>

                {/* The Chemist Girl (Scaled to fit mobile screen naturally) */}
                <img
                  src="/hero-lab-chemist-girl.png"
                  alt="Krishi Analytical Lab Chemist"
                  className="relative z-10 h-64 sm:h-72 w-auto object-contain object-bottom drop-shadow-[0_15px_25px_rgba(0,0,0,0.4)] select-none"
                />
              </div>

              {/* Social Proof Pill Bar */}
              <div className="mt-2 pt-2.5 border-t border-white/15 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1.5 shrink-0">
                    <img src="/krishi-founder-about1.jpg" className="w-6 h-6 rounded-full border border-emerald-400 object-cover" alt="Analyst" />
                    <img src="/krishi-founder-services.jpg" className="w-6 h-6 rounded-full border border-emerald-400 object-cover" alt="Analyst" />
                    <img src="/krishi-founder-about2.jpg" className="w-6 h-6 rounded-full border border-emerald-400 object-cover" alt="Analyst" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-white leading-none">Trusted by 500+ Mills & Traders</p>
                    <p className="text-[8px] text-emerald-200 mt-0.5">Kangeyam • Tiruppur • Erode</p>
                  </div>
                </div>
                <span className="text-rose-400 text-xs font-bold">♥ 4.9/5</span>
              </div>

            </div>

            {/* Mobile Featured Analysis Card (Clean, Separate, 1-Tap Booking!) */}
            <div className="bg-white rounded-2xl p-3 shadow-lg border border-gray-100 flex items-center gap-3">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                <img
                  src="/service-male-ghee.jpg"
                  alt="Pure Ghee & Oil Analysis"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-1 right-1 bg-black/80 text-[#3af04f] text-[8px] font-mono px-1 py-0.5 rounded">
                  BR 40°C
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800">Featured Test</span>
                  <span className="text-[9px] font-black text-[#0B6B43] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Rapid 24h
                  </span>
                </div>
                <p className="font-display font-black text-xs text-gray-900 truncate mt-0.5">Pure Ghee & Oil Analysis</p>
                <p className="text-[10px] text-gray-500 truncate">FFA, RM Value & Purity Testing</p>
                <button
                  onClick={() => { setSample({ ...sample, sample_type: 'Ghee' }); setSampleModalOpen(true); }}
                  className="mt-1.5 w-full bg-black hover:bg-gray-800 text-white font-bold text-[10px] py-1.5 px-3 rounded-full flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm"
                >
                  <TestTube className="w-3 h-3 text-[#3af04f]" /> Book This Test
                </button>
              </div>
            </div>

          </div>

          {/* ==================================================== */}
          {/* DESKTOP HERO SECTION (PERFECT 16:9 WIDESCREEN NEXORA LAYOUT) */}
          {/* ==================================================== */}
          <div className="hidden lg:block relative mt-4 sm:mt-6">
            
            {/* TOP SPLIT HEADLINE (LEFT: Accurate Lab REPORTS | RIGHT: Certified Quality DELIVERED) */}
            <div className="grid grid-cols-12 items-center relative z-20 pt-1 pb-1">
              
              {/* Left Headline */}
              <div className="col-span-5 text-left">
                <span className="font-display font-medium text-gray-800 text-3xl tracking-tight block">
                  Accurate Lab
                </span>
                <span className="font-display font-black text-7xl text-[#0B6B43] tracking-tighter block leading-[0.95] mt-1">
                  REPORTS
                </span>
              </div>

              {/* Center Spacer (Reserved for Chemist head) */}
              <div className="col-span-2 h-8" />

              {/* Right Headline */}
              <div className="col-span-5 text-right">
                <span className="font-display font-medium text-gray-800 text-3xl tracking-tight block">
                  Certified Quality
                </span>
                <span className="font-display font-black text-7xl text-[#0B6B43] tracking-tighter flex items-center justify-end gap-2 leading-[0.95] mt-1">
                  DELIVERED
                  <Sparkle4 className="w-9 h-9 text-[#3af04f] shrink-0" />
                </span>
              </div>
            </div>

            {/* MAIN LOWER CARD CONTAINER (CURVED EMERALD CARD - NEXORA LAYOUT) */}
            <div className="relative rounded-[44px] bg-gradient-to-br from-[#126e45] via-[#0E5B37] to-[#0A4328] text-white p-9 lg:p-10 shadow-2xl overflow-hidden mt-6">
              
              {/* Decorative Subtle Wave Background */}
              <div className="absolute inset-0 opacity-15 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 1000 500" preserveAspectRatio="none">
                  <path d="M0,80 Q250,180 500,70 T1000,100 L1000,500 L0,500 Z" fill="white" />
                  <circle cx="150" cy="380" r="160" fill="white" opacity="0.1" />
                  <circle cx="850" cy="180" r="200" fill="white" opacity="0.1" />
                </svg>
              </div>

              {/* Floating Lab Molecule inside card */}
              <div className="absolute bottom-4 right-1/3 pointer-events-none opacity-20">
                <LabMoleculeDecor className="w-32 h-32 text-white" />
              </div>

              {/* CARD INTERIOR 3-COLUMN CONTENT */}
              <div className="grid grid-cols-12 gap-8 items-center relative z-20">
                
                {/* LEFT SIDE: Heading, Description, CTA, Social Proof */}
                <div className="col-span-5 space-y-3.5 text-left">
                  
                  {/* Heading */}
                  <h2 className="font-display font-black text-3xl lg:text-4xl text-white leading-tight">
                    Where Precision Meets Absolute Confidence
                  </h2>

                  {/* Subtitle */}
                  <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal max-w-sm">
                    Elevate your food and agro-commodity quality with tamper-proof laboratory testing trusted by mills and traders across South India.
                  </p>

                  {/* CTA Button */}
                  <div className="pt-1 flex items-center justify-start gap-3">
                    <button
                      onClick={() => setSampleModalOpen(true)}
                      className="bg-black hover:bg-gray-900 text-white font-extrabold text-xs sm:text-sm px-6 sm:px-7 py-2.5 sm:py-3 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 border border-white/10 group whitespace-nowrap"
                    >
                      Book Sample Test <ArrowRight className="w-4 h-4 text-[#3af04f] group-hover:translate-x-1 transition-transform" />
                    </button>
                    <a
                      href="#services"
                      className="bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm px-5 py-2.5 sm:py-3 rounded-full transition-all backdrop-blur-md whitespace-nowrap"
                    >
                      View 5 Services
                    </a>
                  </div>

                  {/* Social Proof Pill (Loved by 500+ Mills) */}
                  <div className="pt-2 flex items-center justify-start">
                    <div className="inline-flex items-center gap-3 bg-black/35 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-2 shadow-lg">
                      <div className="flex -space-x-2 shrink-0">
                        <img src="/krishi-founder-about1.jpg" className="w-7 h-7 rounded-full border-2 border-emerald-400 object-cover" alt="Analyst" />
                        <img src="/krishi-founder-services.jpg" className="w-7 h-7 rounded-full border-2 border-emerald-400 object-cover" alt="Analyst" />
                        <img src="/krishi-founder-about2.jpg" className="w-7 h-7 rounded-full border-2 border-emerald-400 object-cover" alt="Analyst" />
                      </div>
                      <div className="text-left">
                        <p className="text-[11px] font-bold text-white flex items-center gap-1 leading-none">
                          Trusted by 500+ Mills & Traders <span className="text-rose-400">♥</span>
                        </p>
                        <p className="text-[9px] text-emerald-200 mt-0.5">Kangeyam • Tiruppur • Erode</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* CENTER COLUMN: RESERVED SPACE FOR CENTER OVERLAPPING CHEMIST GIRL */}
                <div className="col-span-2" />

                {/* RIGHT SIDE: Featured Analysis Card */}
                <div className="col-span-5 flex flex-col justify-center">

                  {/* Featured Analysis Card (Matching Featured Look card in Nexora) */}
                  <div className="bg-white rounded-3xl p-3.5 shadow-2xl text-gray-900 border border-white/80 max-w-sm ml-auto">
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Featured Analysis</p>
                    <div className="rounded-2xl overflow-hidden h-28 sm:h-32 bg-gray-100 relative group">
                      <img
                        src="/service-male-ghee.jpg"
                        alt="Pure Ghee & Edible Oil Analysis"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 right-2 bg-black/75 text-[#3af04f] text-[10px] font-mono px-2 py-0.5 rounded-full backdrop-blur-md shadow-md">
                        BR @ 40°C
                      </div>
                    </div>
                    <div className="mt-2.5">
                      <p className="font-display font-black text-xs sm:text-sm text-gray-900 leading-snug">Pure Ghee & Oil Analysis</p>
                      <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium mt-0.5">FFA, RM Value & Baudouin Purity Test</p>
                      <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-[10px] font-black text-[#0B6B43] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          Rapid 24h
                        </span>
                        <button
                          onClick={() => { setSample({ ...sample, sample_type: 'Ghee' }); setSampleModalOpen(true); }}
                          className="bg-black hover:bg-gray-800 text-white font-bold text-[11px] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                        >
                          <TestTube className="w-3.5 h-3.5 text-[#3af04f]" /> Book Test
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>

            {/* ==================================================== */}
            {/* THE LAB CHEMIST GIRL CUTOUT (OVERLAPPING CENTER)     */}
            {/* ==================================================== */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 pointer-events-none z-30 w-full max-w-[440px] h-[540px] flex items-end justify-center">
              <img
                src="/hero-lab-chemist-girl.png"
                alt="Krishi Analytical Lab Chemist"
                className="w-full h-full object-contain object-bottom select-none drop-shadow-[0_20px_30px_rgba(0,0,0,0.35)]"
              />
            </div>

          </div>

          {/* QUICK LAB CONTACT STRIP (COMPACT HEIGHT AT BASE OF HERO) */}
          <div className="mt-6 pt-4 border-t border-gray-200/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 relative z-20">
            <a
              href={directMapUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-gray-50/90 hover:bg-emerald-50/70 transition-all border border-gray-200/50 hover:border-emerald-300 shadow-sm group"
            >
              <div className="p-2 rounded-xl bg-white shadow-sm text-[#0B6B43] border border-gray-200/40 shrink-0 group-hover:scale-110 transition-transform">
                <MapPin className="w-4 h-4 text-[#0B6B43]" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block leading-tight">Kangeyam Lab</span>
                <p className="text-xs font-bold text-gray-800 group-hover:text-[#0B6B43] truncate mt-0.5">
                  182-B, Reliance Trends Near, Tiruppur Rd
                </p>
              </div>
            </a>

            <a
              href="tel:+916379312357"
              className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-gray-50/90 hover:bg-emerald-50/70 transition-all border border-gray-200/50 hover:border-emerald-300 shadow-sm group"
            >
              <div className="p-2 rounded-xl bg-white shadow-sm text-[#0B6B43] border border-gray-200/40 shrink-0 group-hover:scale-110 transition-transform">
                <Phone className="w-4 h-4 text-[#0B6B43]" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block leading-tight">Call / WhatsApp</span>
                <p className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#0B6B43] truncate mt-0.5">
                  +91 63793 12357
                </p>
              </div>
            </a>

            <a
              href="mailto:krishianalyticallab@gmail.com"
              className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-gray-50/90 hover:bg-emerald-50/70 transition-all border border-gray-200/50 hover:border-emerald-300 shadow-sm group"
            >
              <div className="p-2 rounded-xl bg-white shadow-sm text-[#0B6B43] border border-gray-200/40 shrink-0 group-hover:scale-110 transition-transform">
                <Mail className="w-4 h-4 text-[#0B6B43]" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block leading-tight">Official Email</span>
                <p className="text-xs font-bold text-gray-900 group-hover:text-[#0B6B43] truncate mt-0.5">
                  krishianalyticallab@gmail.com
                </p>
              </div>
            </a>

            <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-gray-50/90 hover:bg-gray-100 transition-colors border border-gray-200/50 shadow-sm">
              <div className="p-2 rounded-xl bg-white shadow-sm text-[#0B6B43] border border-gray-200/40 shrink-0">
                <Clock className="w-4 h-4 text-[#0B6B43]" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block leading-tight">Working Hours</span>
                <p className="text-xs sm:text-sm font-bold text-gray-900 mt-0.5">
                  Mon - Sat: 9am - 6pm
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* DARK LUXURY CONTAINER (STATISTICS PILL STRIP)        */}
      {/* ---------------------------------------------------- */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 mt-12 sm:mt-16">
        <Reveal>
          <div className="bg-[#121614] border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center backdrop-blur-xl">
            <div className="border-r border-white/10 last:border-none">
              <p className="font-display font-black text-2xl sm:text-4xl text-white">
                {cms?.stat1_value || '10'}
              </p>
              <p className="text-xs font-semibold text-gray-400 mt-1 tracking-wider">
                {cms?.stat1_label || 'Report Types'}
              </p>
            </div>
            <div className="border-r border-white/10 last:border-none">
              <p className="font-display font-black text-2xl sm:text-4xl text-white">
                {cms?.stat2_value || '38+'}
              </p>
              <p className="text-xs font-semibold text-gray-400 mt-1 tracking-wider">
                {cms?.stat2_label || 'Test Parameters'}
              </p>
            </div>
            <div className="border-r border-white/10 last:border-none">
              <p className="font-display font-black text-2xl sm:text-4xl text-white">
                {cms?.stat3_value || '5000+'}
              </p>
              <p className="text-xs font-semibold text-gray-400 mt-1 tracking-wider">
                {cms?.stat3_label || 'Reports Generated'}
              </p>
            </div>
            <div>
              <p className="font-display font-black text-2xl sm:text-4xl text-white">
                {cms?.stat4_value || '24/7'}
              </p>
              <p className="text-xs font-semibold text-gray-400 mt-1 tracking-wider">
                {cms?.stat4_label || 'Support'}
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------------------------------------------------- */}
      {/* SECTION: TURNING IDEAS INTO MASTERPIECES             */}
      {/* ---------------------------------------------------- */}
      <section id="about" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          
          {/* Left Title with Sparkle Star */}
          <div className="lg:col-span-6 flex items-start gap-3">
            <Sparkle4 className="w-6 h-6 text-[#3af04f] mt-2 shrink-0 animate-pulse" />
            <h2 className="font-display font-black text-2xl sm:text-4xl lg:text-5xl text-white leading-tight">
              Turning Ideas Into <br className="hidden sm:block" />Masterpieces
            </h2>
          </div>

          {/* Right Description */}
          <div className="lg:col-span-6">
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-normal">
              We may be a compact team, but our precision knows no bounds. By staying agile and working hand-in-hand with our clients, we transform samples into cutting-edge certified laboratory reports that make a lasting impression and ensure industry compliance.
            </p>
          </div>
        </div>

        {/* TWO FEATURED CARDS SIDE-BY-SIDE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Founder Chemist with Clipboard */}
          <Reveal delay={100}>
            <div className="relative rounded-3xl overflow-hidden h-[340px] sm:h-[420px] border border-white/10 group shadow-2xl bg-black">
              <img
                src="/krishi-founder-about1.jpg"
                alt="Analytical Testing Chemist"
                className="w-full h-full object-cover contrast-110 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              
              {/* Neon Green Pill Badge */}
              <div className="absolute bottom-6 left-6">
                <span className="bg-[#3af04f] text-black font-black text-[11px] sm:text-xs uppercase px-4 py-2 rounded-xl tracking-wider shadow-lg">
                  A Certified Analytical Lab
                </span>
              </div>
            </div>
          </Reveal>

          {/* Card 2: Precision Pipetting Action Shot */}
          <Reveal delay={200}>
            <div className="relative rounded-3xl overflow-hidden h-[340px] sm:h-[420px] border border-white/10 group shadow-2xl bg-black">
              <img
                src="/krishi-founder-about2.jpg"
                alt="Precision Sample Testing"
                className="w-full h-full object-cover contrast-110 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Hand-drawn red/coral outline doodle idea bulb over head */}
              <div className="absolute top-8 right-10 pointer-events-none">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M24 6C16 6 12 12 12 18C12 23 16 26 18 30L30 30C32 26 36 23 36 18C36 12 32 6 24 6Z" />
                  <path d="M19 36L29 36" />
                  <path d="M21 42L27 42" />
                  <path d="M24 2L24 0" />
                  <path d="M38 12L41 10" />
                  <path d="M10 12L7 10" />
                </svg>
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-xs font-black text-[#3af04f] tracking-widest uppercase">Precision Standards</p>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">Science You Can Rely On</h3>
                <p className="text-xs text-gray-300 mt-1 max-w-md">From sample receipt in Kangeyam to ISO & NABL aligned Certificate of Analysis.</p>
              </div>
            </div>
          </Reveal>

        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* SECTION: OUR SERVICES (WITH MALE CHEMIST PICTURE)    */}
      {/* ---------------------------------------------------- */}
      <section id="services" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20 border-t border-white/10">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-display font-black text-2xl sm:text-4xl text-white">Our</span>
                <span className="bg-[#3af04f] text-black font-display font-black text-2xl sm:text-4xl px-4 py-0.5 rounded-full shadow-lg shadow-[#3af04f]/20">
                  Services
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 max-w-lg mt-2">
                We offer a range of specialized analytical and laboratory testing services designed to ensure strict compliance and elevate your product quality.
              </p>
            </div>
            
            <button
              onClick={() => setSampleModalOpen(true)}
              className="self-start md:self-auto bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full border border-white/20 transition-all flex items-center gap-2"
            >
              Request Sample Test <ArrowRight className="w-4 h-4 text-[#3af04f]" />
            </button>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Interactive Numbered Services List */}
          <div className="lg:col-span-7 space-y-3">
            {servicesList.map((srv, idx) => {
              const isSelected = activeService === idx;
              return (
                <div
                  key={srv.num}
                  onClick={() => setActiveService(idx)}
                  onMouseEnter={() => setActiveService(idx)}
                  className={`cursor-pointer rounded-2xl p-5 sm:p-6 transition-all duration-300 border ${
                    isSelected
                      ? 'bg-[#151a17] border-[#3af04f]/80 shadow-xl shadow-[#3af04f]/10'
                      : 'bg-[#101412] border-white/10 hover:border-white/25 hover:bg-[#131815]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className={`font-mono text-xs sm:text-sm font-black ${isSelected ? 'text-[#3af04f]' : 'text-gray-500'}`}>
                        {srv.num}
                      </span>
                      <h3 className={`font-display font-bold text-base sm:text-lg ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                        {srv.title}
                      </h3>
                      <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10">
                        {srv.badge}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`p-2 rounded-full transition-transform ${isSelected ? 'bg-[#3af04f] text-black rotate-90' : 'bg-white/5 text-gray-400'}`}>
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  {/* Expanded Parameters when active */}
                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                      <p className="text-xs text-gray-400 font-medium">{srv.sub}</p>
                      <div className="flex flex-wrap gap-2">
                        {srv.params.map(p => (
                          <span
                            key={p}
                            className="bg-black/60 border border-[#3af04f]/30 text-[#3af04f] text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5"
                          >
                            <Check className="w-3 h-3" /> {p}
                          </span>
                        ))}
                      </div>
                      <div className="pt-2 flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSample({ ...sample, sample_type: srv.sampleVal });
                            setSampleModalOpen(true);
                          }}
                          className="text-xs font-bold text-[#3af04f] hover:underline flex items-center gap-1"
                        >
                          Book {srv.sampleVal} Test →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Side: DYNAMIC MALE CHEMIST PHOTO CARD */}
          <div className="lg:col-span-5">
            <Reveal delay={150}>
              <div className="relative rounded-3xl overflow-hidden h-[420px] sm:h-[500px] border border-white/15 shadow-2xl group bg-black">
                
                {/* Male Chemist Picture - changes dynamically with activeService */}
                <img
                  key={activeService}
                  src={servicesList[activeService].image}
                  alt={servicesList[activeService].title}
                  className="w-full h-full object-cover object-center filter contrast-110 group-hover:scale-105 transition-all duration-700 animate-serviceFade"
                />

                {/* Ambient dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent pointer-events-none" />
                
                {/* Subtle tech badge on image */}
                <div className="absolute top-6 left-6 pointer-events-none">
                  <span className="text-[10px] font-mono tracking-widest text-[#3af04f] bg-black/70 px-3 py-1.5 rounded-full border border-[#3af04f]/40 backdrop-blur-md shadow-lg flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3af04f] animate-ping" />
                    {servicesList[activeService].tag}
                  </span>
                </div>

                {/* Service index dots on top right */}
                <div className="absolute top-6 right-6 flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                  {servicesList.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      onClick={() => setActiveService(dotIdx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        activeService === dotIdx ? 'w-6 bg-[#3af04f]' : 'w-2 bg-white/30 hover:bg-white/60'
                      }`}
                      aria-label={`Go to service ${dotIdx + 1}`}
                    />
                  ))}
                </div>

                {/* Bottom Overlay & "See sample report" Pill Button */}
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-white font-display font-black text-lg sm:text-xl drop-shadow truncate">
                      {servicesList[activeService].chemist}
                    </p>
                    <p className="text-xs text-gray-300 font-medium truncate mt-0.5">
                      {servicesList[activeService].tech}
                    </p>
                  </div>

                  <button
                    onClick={() => setReportModalOpen(true)}
                    className="bg-black/90 hover:bg-black text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full border border-white/20 hover:border-[#3af04f] transition-all shadow-xl shrink-0 flex items-center gap-2 group-hover:scale-105"
                  >
                    <Eye className="w-4 h-4 text-[#3af04f]" /> Sample Report
                  </button>
                </div>

              </div>
            </Reveal>
          </div>

        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* QUICK SAMPLE ENQUIRY SECTION (INLINE FORM IN DARK)   */}
      {/* ---------------------------------------------------- */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-12">
        <Reveal>
          <div className="bg-gradient-to-br from-[#121815] to-[#0d1210] border-2 border-[#3af04f]/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#3af04f]/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-black tracking-widest text-[#3af04f] uppercase flex items-center gap-2">
                  <TestTube className="w-4 h-4" /> Quick Sample Submission
                </p>
                <h3 className="font-display font-black text-2xl sm:text-3xl text-white mt-1">
                  Ready to test a sample?
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  Submit details below — our analytical technicians will confirm sample collection within 30 minutes.
                </p>
              </div>

              <span className="hidden sm:inline-flex items-center gap-2 text-xs font-black text-black bg-[#3af04f] px-4 py-1.5 rounded-full shadow-lg">
                <span className="w-2 h-2 bg-black rounded-full animate-ping" /> 24hr COA Turnaround
              </span>
            </div>

            <form onSubmit={submitSample} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <input
                  required
                  value={sample.name}
                  onChange={e => setSample({ ...sample, name: e.target.value })}
                  placeholder="Your Name / Mill Name *"
                  className="w-full bg-[#090c0a] border border-white/15 focus:border-[#3af04f] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-all"
                />
              </div>
              <div>
                <input
                  required
                  value={sample.phone}
                  onChange={e => setSample({ ...sample, phone: e.target.value })}
                  placeholder="Phone Number *"
                  className="w-full bg-[#090c0a] border border-white/15 focus:border-[#3af04f] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-all"
                />
              </div>
              <div>
                <input
                  type="email"
                  value={sample.email}
                  onChange={e => setSample({ ...sample, email: e.target.value })}
                  placeholder="Email (for digital report)"
                  className="w-full bg-[#090c0a] border border-white/15 focus:border-[#3af04f] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-all"
                />
              </div>
              <div>
                <select
                  value={sample.sample_type}
                  onChange={e => setSample({ ...sample, sample_type: e.target.value })}
                  className="w-full bg-[#090c0a] border border-white/15 focus:border-[#3af04f] rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none transition-all"
                >
                  <option value="">Select Sample Type</option>
                  <option>Water</option>
                  <option>Oil</option>
                  <option>Ghee</option>
                  <option>Animal Feed</option>
                  <option>Rice Bran</option>
                </select>
              </div>
              <div>
                <input
                  value={sample.message}
                  onChange={e => setSample({ ...sample, message: e.target.value })}
                  placeholder="Specific Parameters / Quantity"
                  className="w-full bg-[#090c0a] border border-white/15 focus:border-[#3af04f] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-all"
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={sampleBusy}
                  className="w-full bg-[#3af04f] hover:bg-[#32d944] text-black font-extrabold rounded-xl px-6 py-3 text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#3af04f]/25 active:scale-95 disabled:opacity-60"
                >
                  {sampleBusy ? 'Submitting...' : <>Submit Sample Request <Sparkles className="w-4 h-4 text-black" /></>}
                </button>
              </div>
              {sampleMsg.text && (
                <p className={`sm:col-span-2 lg:col-span-3 text-xs font-bold ${sampleMsg.type === 'ok' ? 'text-[#3af04f]' : 'text-red-400'}`}>
                  {sampleMsg.text}
                </p>
              )}
            </form>
          </div>
        </Reveal>
      </section>

      {/* ---------------------------------------------------- */}
      {/* SECTION: WHY LABORATORIES TRUST US                   */}
      {/* ---------------------------------------------------- */}
      <section id="why" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-16">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-black text-[#3af04f] uppercase tracking-widest">Quality Pillars</span>
            <h2 className="font-display font-black text-2xl sm:text-4xl text-white mt-1">Why Laboratories Trust Us</h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">Built for speed, accuracy, and enterprise reporting across Tamil Nadu.</p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { t: 'Fast 24hr Turnaround', d: 'Get certified reports within 24 hours of sample receipt.', i: Zap },
            { t: 'Precision Accuracy', d: 'Calibrated laboratory instruments & strict quality controls.', i: ShieldCheck },
            { t: 'Professional A4 PDF', d: 'Print-ready Certificate of Analysis with seal & signature.', i: FileText },
            { t: 'Secure & Private', d: 'Role-based access ensuring client confidentiality at all times.', i: Lock },
            { t: 'Configurable Testing', d: 'Standard & custom testing parameters for specific industry specs.', i: Settings2 },
            { t: 'Direct Verification', d: 'QR verified authentic reports recognized by trading authorities.', i: Printer },
          ].map((item, idx) => (
            <Reveal key={item.t} delay={idx * 60}>
              <div className="bg-[#111613] border border-white/10 rounded-2xl p-6 hover:border-[#3af04f]/50 hover:bg-[#141b17] transition-all group shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-[#3af04f]/15 border border-[#3af04f]/30 flex items-center justify-center text-[#3af04f] mb-4 group-hover:scale-110 transition-transform">
                  <item.i className="w-5 h-5" />
                </div>
                <h4 className="font-display font-bold text-white text-base">{item.t}</h4>
                <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{item.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* SECTION: CLIENT REVIEWS / TESTIMONIALS               */}
      {/* ---------------------------------------------------- */}
      <section id="reviews" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-16 border-t border-white/10">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-black text-[#3af04f] uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Client Reviews
            </span>
            <h2 className="font-display font-black text-2xl sm:text-4xl text-white mt-1">
              Trusted by Agro & Oil Merchants
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              Leading traders, feed mills, and oil refineries rely on Krishi Analytical Lab for accurate Certificate of Analysis.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {displayedTestimonials.map((item, idx) => (
            <Reveal key={item.company} delay={idx * 80}>
              <div className="bg-[#111513] border border-white/10 rounded-2xl p-5 shadow-lg hover:border-[#3af04f]/40 transition-all flex flex-col justify-between h-full group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex text-[#3af04f] gap-0.5">
                      {[...Array(item.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#3af04f] text-[#3af04f]" />
                      ))}
                    </div>
                    <Quote className="w-5 h-5 text-gray-600 group-hover:text-[#3af04f] transition-colors" />
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed italic">
                    "{item.text}"
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-white/10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#3af04f]/20 text-[#3af04f] font-black text-xs flex items-center justify-center border border-[#3af04f]/40">
                    {item.company.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{item.company}</p>
                    <p className="text-[10px] text-gray-400">{[item.type, item.loc].filter(Boolean).join(' • ')}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* SECTION: CONTACT & GOOGLE MAPS (KANGEYAM)            */}
      {/* ---------------------------------------------------- */}
      <section id="contact" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-16 border-t border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Direct Location & Map */}
          <div className="lg:col-span-5 space-y-6">
            <Reveal>
              <div>
                <span className="text-[11px] font-black text-[#3af04f] uppercase tracking-widest">Reach Us Directly</span>
                <h2 className="font-display font-black text-2xl sm:text-4xl text-white mt-1">Visit or Contact Our Lab</h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-2">
                  Samples can be submitted directly at our Kangeyam center or dispatched via courier.
                </p>
              </div>

              <div className="space-y-3 mt-6 text-xs sm:text-sm text-gray-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#3af04f] mt-0.5 shrink-0" />
                  <span>{contactAddress}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#3af04f] shrink-0" />
                  <span>{contactPhone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#3af04f] shrink-0" />
                  <span>{contactEmail}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#3af04f] shrink-0" />
                  <span>{contactHours}</span>
                </div>
              </div>

              {/* Map Container */}
              <div className="bg-[#111513] border border-white/10 rounded-2xl overflow-hidden shadow-xl mt-6">
                <div className="h-56 w-full">
                  <iframe
                    src={mapEmbedUrl}
                    title="Krishi Analytical Lab Location Map"
                    className="w-full h-full border-0 grayscale contrast-125"
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="p-3 bg-black/60 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-gray-300 font-bold">Krishi Analytical Lab • Kangeyam</span>
                  <a
                    href={directMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-[#3af04f] text-black font-extrabold px-3 py-1.5 rounded-lg text-xs hover:bg-[#32d944] transition-all"
                  >
                    Get Directions <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Send Direct Message Form */}
          <div className="lg:col-span-7">
            <Reveal delay={120}>
              <form onSubmit={submitContact} className="bg-[#121614] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#3af04f] to-transparent" />
                
                <div>
                  <h3 className="font-display font-black text-xl sm:text-2xl text-white">Send Direct Enquiry</h3>
                  <p className="text-xs text-gray-400 mt-1">Have custom testing requirements or contract billing questions? Write to us.</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1">Your Full Name *</label>
                  <input
                    required
                    value={contact.name}
                    onChange={e => setContact({ ...contact, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full bg-[#090c0a] border border-white/15 focus:border-[#3af04f] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">Phone Number *</label>
                    <input
                      required
                      value={contact.phone}
                      onChange={e => setContact({ ...contact, phone: e.target.value })}
                      placeholder="+91 Mobile number"
                      className="w-full bg-[#090c0a] border border-white/15 focus:border-[#3af04f] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={contact.email}
                      onChange={e => setContact({ ...contact, email: e.target.value })}
                      placeholder="name@company.com"
                      className="w-full bg-[#090c0a] border border-white/15 focus:border-[#3af04f] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1">Inquiry / Message Details</label>
                  <textarea
                    rows={4}
                    value={contact.message}
                    onChange={e => setContact({ ...contact, message: e.target.value })}
                    placeholder="Tell us what you need tested or any sample collection support..."
                    className="w-full bg-[#090c0a] border border-white/15 focus:border-[#3af04f] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactBusy}
                  className="w-full bg-[#3af04f] hover:bg-[#32d944] text-black font-extrabold py-3.5 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-[#3af04f]/25 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {contactBusy ? 'Sending Message...' : <>Send Direct Message <ArrowRight className="w-4 h-4 text-black" /></>}
                </button>

                {contactMsg.text && (
                  <p className={`text-xs font-bold text-center ${contactMsg.type === 'ok' ? 'text-[#3af04f]' : 'text-red-400'}`}>
                    {contactMsg.text}
                  </p>
                )}
              </form>
            </Reveal>
          </div>

        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* FOOTER (OBSIDIAN DARK THEME)                         */}
      {/* ---------------------------------------------------- */}
      <footer className="border-t border-white/10 bg-[#070908] text-gray-400 text-xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4 md:col-span-2">
            <div className="inline-flex items-center">
              <div className="bg-white rounded-2xl px-5 py-3 shadow-xl shadow-black/40 border border-white/80 inline-flex items-center justify-center transition-transform hover:scale-105 duration-300">
                <img
                  src="/krishi-transparent.png"
                  alt="Krishi Analytical Lab"
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-md">
              Discovering Solutions, One Test at a Time. Precision analytical testing for agro-commodities, edible oils, ghee, water, and animal feed with digital certification.
            </p>
            <p className="text-[11px] text-gray-500">
              Address: {contactAddress}
            </p>
          </div>

          <div>
            <p className="font-display font-bold text-white text-sm mb-3">Quick Navigation</p>
            <ul className="space-y-2">
              <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Analytical Services</a></li>
              <li><a href="#why" className="hover:text-white transition-colors">Quality Pillars</a></li>
              <li><a href="#reviews" className="hover:text-white transition-colors">Client Reviews</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Contact & Map</a></li>
              <li><a href="/panel" className="text-[#3af04f] hover:underline font-bold">Staff Control Panel →</a></li>
            </ul>
          </div>

          <div>
            <p className="font-display font-bold text-white text-sm mb-3">Testing Scope</p>
            <ul className="space-y-2 text-gray-400">
              <li>• Drinking & RO Water Testing</li>
              <li>• Edible & Industrial Oils FFA/IV</li>
              <li>• Pure Ghee RM & Polenske Purity</li>
              <li>• Cattle & Poultry Feed Analysis</li>
              <li>• Rice Bran Extraction Certification</li>
            </ul>
          </div>

        </div>

        <div className="border-t border-white/5 py-6 text-center text-gray-500 text-[11px]">
          © {new Date().getFullYear()} Krishi Analytical Lab. All rights reserved. Kangeyam, Tiruppur District, Tamil Nadu.
        </div>
      </footer>

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: QUICK SAMPLE ENQUIRY POPUP                  */}
      {/* ---------------------------------------------------- */}
      {sampleModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#121614] border-2 border-[#3af04f]/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl">
            <button
              onClick={() => setSampleModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <span className="text-[10px] font-black tracking-widest text-[#3af04f] uppercase">Quick Action</span>
              <h3 className="font-display font-black text-2xl text-white mt-1">Start Your Lab Project</h3>
              <p className="text-xs text-gray-400 mt-1">Submit your sample details and our team will get in touch immediately.</p>
            </div>

            <form onSubmit={submitSample} className="space-y-3.5">
              <input
                required
                value={sample.name}
                onChange={e => setSample({ ...sample, name: e.target.value })}
                placeholder="Your Name / Mill Name *"
                className="w-full bg-[#090c0a] border border-white/15 focus:border-[#3af04f] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-all"
              />
              <input
                required
                value={sample.phone}
                onChange={e => setSample({ ...sample, phone: e.target.value })}
                placeholder="Phone Number *"
                className="w-full bg-[#090c0a] border border-white/15 focus:border-[#3af04f] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-all"
              />
              <input
                type="email"
                value={sample.email}
                onChange={e => setSample({ ...sample, email: e.target.value })}
                placeholder="Email Address (optional)"
                className="w-full bg-[#090c0a] border border-white/15 focus:border-[#3af04f] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-all"
              />
              <select
                value={sample.sample_type}
                onChange={e => setSample({ ...sample, sample_type: e.target.value })}
                className="w-full bg-[#090c0a] border border-white/15 focus:border-[#3af04f] rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none transition-all"
              >
                <option value="">Select Sample Type</option>
                <option>Water</option>
                <option>Oil</option>
                <option>Ghee</option>
                <option>Animal Feed</option>
                <option>Rice Bran</option>
              </select>
              <textarea
                rows={3}
                value={sample.message}
                onChange={e => setSample({ ...sample, message: e.target.value })}
                placeholder="Specific parameters needed (e.g. FFA, RM Value, Protein, TDS)..."
                className="w-full bg-[#090c0a] border border-white/15 focus:border-[#3af04f] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-all"
              />

              <button
                type="submit"
                disabled={sampleBusy}
                className="w-full bg-[#3af04f] hover:bg-[#32d944] text-black font-extrabold py-3.5 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-[#3af04f]/25 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {sampleBusy ? 'Submitting...' : <>Submit Request <ArrowRight className="w-4 h-4 text-black" /></>}
              </button>

              {sampleMsg.text && (
                <p className={`text-xs font-bold text-center ${sampleMsg.type === 'ok' ? 'text-[#3af04f]' : 'text-red-400'}`}>
                  {sampleMsg.text}
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: "SEE HOW WE WORK" SAMPLE REPORT PREVIEW     */}
      {/* ---------------------------------------------------- */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-white text-gray-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setReportModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-gray-200 pb-4 mb-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-[#168B57] uppercase tracking-wider">Verified Certificate of Analysis</span>
                <h3 className="font-display font-black text-xl text-gray-950 mt-0.5">Sample COA: KAL-4411</h3>
              </div>
              <span className="bg-emerald-100 text-[#0B6B43] text-xs font-black px-3 py-1 rounded-full">
                PASS / CERTIFIED
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                <div><span className="font-bold text-gray-500">Party Name:</span> <span className="font-black text-gray-900">MADHESH TRADERS</span></div>
                <div><span className="font-bold text-gray-500">Sample:</span> <span className="font-black text-gray-900">RICE BRAN OIL</span></div>
                <div><span className="font-bold text-gray-500">Location:</span> <span className="font-black text-gray-900">Kangeyam</span></div>
                <div><span className="font-bold text-gray-500">Turnaround:</span> <span className="font-black text-[#168B57]">Same Day (18 hrs)</span></div>
              </div>

              <table className="w-full text-left border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-gray-100 text-gray-700 font-black text-[11px]">
                  <tr>
                    <th className="p-2.5">S.NO</th>
                    <th className="p-2.5">PARAMETER</th>
                    <th className="p-2.5">TEST RESULT</th>
                    <th className="p-2.5">STANDARD SPEC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="p-2.5">1</td>
                    <td className="p-2.5 font-bold">Oil Content (OC)</td>
                    <td className="p-2.5 font-black text-[#168B57]">8.78 %</td>
                    <td className="p-2.5 text-gray-600">Min 8.00 %</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">2</td>
                    <td className="p-2.5 font-bold">Free Fatty Acid (FFA)</td>
                    <td className="p-2.5 font-black text-[#168B57]">2.45 %</td>
                    <td className="p-2.5 text-gray-600">Max 3.00 %</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">3</td>
                    <td className="p-2.5 font-bold">Sand & Silica</td>
                    <td className="p-2.5 font-black text-[#168B57]">0.85 %</td>
                    <td className="p-2.5 text-gray-600">Max 1.50 %</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">4</td>
                    <td className="p-2.5 font-bold">Fiber Content</td>
                    <td className="p-2.5 font-black text-[#168B57]">32.05 %</td>
                    <td className="p-2.5 text-gray-600">Standard Grade</td>
                  </tr>
                </tbody>
              </table>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <span className="text-gray-700 font-semibold">Authorized Signatory: <strong className="text-gray-950">Krishi Analytical Lab</strong></span>
                <button
                  onClick={() => { setReportModalOpen(false); setSampleModalOpen(true); }}
                  className="bg-[#168B57] text-white font-extrabold px-4 py-2 rounded-xl hover:bg-[#0B6B43] transition-colors"
                >
                  Test Your Sample Now →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Landing;
