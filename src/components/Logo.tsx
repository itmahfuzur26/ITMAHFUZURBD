import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
  logoUrl?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = false, // User requested: "লোগোর নাম শুধু ব্যবহার করবে, স্লোগান ফোটারে ব্যবহার করবে"
  className = '',
  logoUrl = 'https://res.cloudinary.com/ru3hghyn/image/upload/v1793023123/FB_IMG_1792469317535.jpg'
}) => {
  const { language } = useLanguage();
  const [imageError, setImageError] = useState(false);

  const imgSizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  };

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Uploaded Brand Logo Image */}
      <div className={`relative shrink-0 ${imgSizes[size]} rounded-xl overflow-hidden border border-cyan-500/40 shadow-lg shadow-cyan-500/20 bg-slate-900 flex items-center justify-center`}>
        {!imageError && logoUrl ? (
          <img
            src={logoUrl}
            alt="ITMahfuzur Logo"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          /* High-fidelity Vector Fallback */
          <div className="w-full h-full p-1.5 flex items-center justify-center bg-gradient-to-br from-slate-900 via-cyan-950 to-blue-950">
            <svg viewBox="0 0 44 44" fill="none" className="w-full h-full">
              <circle cx="22" cy="22" r="18" stroke="#0284c7" strokeWidth="0.8" strokeDasharray="2 3" opacity="0.4" />
              <path d="M10 14H16M13 14V30M10 30H16" stroke="#38bdf8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M18 16L24 28L30 16" stroke="#06b6d4" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M30 16L34 28" stroke="#0ea5e9" strokeWidth="2.4" strokeLinecap="round" />
              <circle cx="34" cy="14" r="2.5" fill="#38bdf8" />
            </svg>
          </div>
        )}
      </div>

      {/* Brand Name Typography - matching the exact brand name colors */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center">
          <span className={`font-black tracking-tight ${textSizes[size]} text-white`}>
            IT<span className="text-cyan-400">Mahfuzur</span>
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[11px] text-slate-400 font-medium mt-1">
            {language === 'bn' ? 'আইটি মাহফুজুর' : 'IT Education & Digital Skills'}
          </span>
        )}
      </div>
    </div>
  );
};
