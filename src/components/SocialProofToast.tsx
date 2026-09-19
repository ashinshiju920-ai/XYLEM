import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Award, Zap, TrendingUp } from 'lucide-react';
import { useShop } from '../context/ShopContext';

interface Activity {
  name: string;
  location: string;
  item: string;
  timeAgo: string;
  score?: string;
  iconType: 'purchase' | 'score' | 'active';
}

const ACTIVITIES: Activity[] = [
  {
    name: 'Ananya Nair',
    location: 'Kochi, Kerala',
    item: 'OET Full Preparation (500+ Mocks)',
    timeAgo: '2 minutes ago',
    score: 'Grade A Target',
    iconType: 'purchase',
  },
  {
    name: 'Rahul Mathew',
    location: 'Bangalore, India',
    item: 'IELTS Full Prep 2026 Edition',
    timeAgo: '4 minutes ago',
    score: 'Band 8.5 Achieved',
    iconType: 'score',
  },
  {
    name: 'Stephan Thomas',
    location: 'Trivandrum',
    item: 'German A1–B2 Masterclass',
    timeAgo: '7 minutes ago',
    score: 'Goethe B1 Target',
    iconType: 'purchase',
  },
  {
    name: 'Pooja Menon',
    location: 'Calicut, Kerala',
    item: 'PTE Academic 500+ Practice',
    timeAgo: '12 minutes ago',
    score: 'PTE 79+ Target',
    iconType: 'purchase',
  },
  {
    name: 'Dr. Arun Kumar',
    location: 'Chennai, India',
    item: 'OET Medicine Clinical Guide',
    timeAgo: '18 minutes ago',
    score: 'NHS UK Placed',
    iconType: 'score',
  },
];

export const SocialProofToast: React.FC = () => {
  const { currentView, navigateToProduct, books } = useShop();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Only show on home, catalog, and product pages; hide on checkout to avoid distraction
    if (dismissed || currentView === 'checkout' || currentView === 'admin') {
      setIsVisible(false);
      return;
    }

    // Initial delay before first popup
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 4000);

    // Rotation interval
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % ACTIVITIES.length);
        setIsVisible(true);
      }, 1000);
    }, 11000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [dismissed, currentView]);

  if (dismissed || !isVisible || currentView === 'checkout' || currentView === 'admin') {
    return null;
  }

  const current = ACTIVITIES[currentIndex];

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-30 max-w-[340px] sm:max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-xl border border-slate-200/80 flex items-start gap-3 relative group hover:shadow-2xl transition-all">
        {/* Animated Status Icon */}
        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100 shadow-inner mt-0.5">
          {current.iconType === 'score' ? (
            <Award className="w-4 h-4 text-amber-500 animate-pulse" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-emerald-700 font-bold uppercase tracking-wider">Verified Learner</span>
            <span>•</span>
            <span>{current.timeAgo}</span>
          </div>

          <p className="text-xs font-bold text-slate-900 truncate mt-0.5 font-['Plus_Jakarta_Sans',sans-serif]">
            {current.name} <span className="text-slate-500 font-normal font-['DM_Sans',sans-serif]">from {current.location}</span>
          </p>

          <p className="text-[11px] text-slate-700 font-medium truncate mt-0.5">
            Purchased <span className="font-semibold text-emerald-800">{current.item}</span>
          </p>

          {current.score && (
            <div className="inline-block mt-1 bg-emerald-50 text-emerald-800 text-[9px] font-extrabold px-2 py-0.5 rounded-md border border-emerald-200">
              {current.score}
            </div>
          )}
        </div>

        {/* Dismiss 'x' button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDismissed(true);
          }}
          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
