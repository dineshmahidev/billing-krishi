import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';

export const Footer = () => (
  <footer className="bg-white border-t border-[#D1D5DB] mt-auto no-print">
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <img src="/krishi-transparent.png" alt="Krishi Analytical Lab" className="h-10 w-auto" />
        <p className="text-xs text-[#6B7280] mt-2">“Discovering Solutions, One Test at a Time”</p>
        <p className="text-[11px] text-[#6B7280] mt-1">© {new Date().getFullYear()} Krishi Analytical Lab</p>
      </div>
      <div>
        <h4 className="text-xs font-bold text-[#1F2937] flex items-center gap-1"><MapPin className="w-4 h-4 text-[#168B57]"/> Address</h4>
        <p className="text-xs text-[#6B7280] mt-1">182-B, Reliance Trends Near, Tiruppur Road, Kangeyam - 638701, Tiruppur Dist, Tamil Nadu</p>
        <p className="text-[11px] text-[#6B7280]">GSTIN: 33AAAFK8921B1Z2</p>
      </div>
      <div>
        <h4 className="text-xs font-bold text-[#1F2937] flex items-center gap-1"><Phone className="w-4 h-4 text-[#168B57]"/> Contact</h4>
        <p className="text-xs text-[#1F2937] mt-1">+91 63793 12357 / +91 94433 12345</p>
        <p className="text-xs text-[#6B7280] flex items-center gap-1"><Mail className="w-3 h-3"/> info@krishianalyticallab.com</p>
      </div>
    </div>
  </footer>
);
