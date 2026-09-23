import React, { useState } from 'react';
import { Instagram, Youtube, Facebook, Linkedin, ArrowRight, CheckCircle2 } from 'lucide-react';
import { XylemLogo } from './XylemLogo';
import { useShop } from '../context/ShopContext';
import { ExamCategory } from '../types';

export const Footer: React.FC = () => {
  const { setCurrentView, navigateToCatalog, setIsContactModalOpen, showToast } = useShop();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const val = email.trim();
    if (!val) return;

    setSubscribed(true);
    showToast('Thank you for subscribing to Xylem Bookstore updates!');
    setEmail('');
  };

  return (
    <footer className="bg-[#0b1f33] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-5">
            <div className="inline-block bg-white/95 p-3 rounded-xl shadow-md">
              <XylemLogo size="md" showTagline={true} />
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Xylem Bookstore is your dedicated preparation partner for global language and professional licensing examinations. Trusted by over 50,000+ learners across India and abroad.
            </p>
            <div className="pt-2">
              <div className="text-xs text-emerald-400 font-semibold tracking-wider uppercase mb-1">
                Customer Care & Inquiries
              </div>
              <p className="text-sm text-slate-300 font-medium">support@xylembookstore.com</p>
              <p className="text-xs text-slate-400">+91 98765 43210 (Mon - Sat, 9 AM - 7 PM IST)</p>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-['Plus_Jakarta_Sans',sans-serif]">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => setCurrentView('home')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToCatalog('IELTS')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  IELTS
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToCatalog('OET')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  OET
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToCatalog('PTE')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  PTE
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToCatalog('German')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  German
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Shop */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-['Plus_Jakarta_Sans',sans-serif]">
              Shop
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => navigateToCatalog('All')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Study Materials
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToCatalog('All')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Books
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToCatalog('All')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Bundle Offers
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('orders')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Track Order / My PDFs
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: About & Join Community */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-['Plus_Jakarta_Sans',sans-serif]">
              About
            </h4>
            <ul className="space-y-2.5 text-sm mb-6">
              <li>
                <button
                  onClick={() => setCurrentView('about')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Our Story
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('about')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Why Xylem
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsContactModalOpen(true)}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Contact Us
                </button>
              </li>
            </ul>

            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 font-['Plus_Jakarta_Sans',sans-serif]">
              Join Our Community
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Get updates, offers, and free exam tips.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-800/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Subscribed! Check your inbox soon.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex items-center">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  autoComplete="email"
                  className="w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded-l-lg text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="bg-[#00875a] hover:bg-[#00734c] text-white px-3 py-2 rounded-r-lg transition-colors cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Social Icons */}
            <div className="flex items-center space-x-3 mt-5">
              <a
                href="#instagram"
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-emerald-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#youtube"
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-emerald-600 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="#facebook"
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-emerald-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#linkedin"
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-emerald-600 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright & policies bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            © 2025 Xylem Bookstore. All rights reserved.
          </div>
          <div className="flex items-center space-x-6">
            <button
              onClick={() => showToast('Privacy Policy: All customer information is encrypted & never shared.')}
              className="hover:text-emerald-400 transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => showToast('Terms: Instant digital delivery upon payment confirmation.')}
              className="hover:text-emerald-400 transition-colors"
            >
              Terms & Conditions
            </button>
            <button
              onClick={() => showToast('Shipping: Digital items arrive instantly. Physical books ship in 3-5 days.')}
              className="hover:text-emerald-400 transition-colors"
            >
              Shipping & Returns
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
