import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface InstructorAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showExperienceBadge?: boolean;
  showMrmBadge?: boolean;
  className?: string;
  onClick?: () => void;
}

export const InstructorAvatar: React.FC<InstructorAvatarProps> = ({
  size = 'lg',
  showExperienceBadge = true,
  showMrmBadge = true,
  className = '',
  onClick,
}) => {
  const photoUrl = 'https://res.cloudinary.com/ru3hghyn/image/upload/v1793028848/1000030687-removebg-preview.png';

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-20 h-20',
    lg: 'w-48 h-48 sm:w-56 sm:h-56',
    xl: 'w-56 h-56 sm:w-64 sm:h-64',
  };

  const ringPadding = {
    sm: 'p-0.5',
    md: 'p-1',
    lg: 'p-1.5',
    xl: 'p-2',
  };

  return (
    <div
      onClick={onClick}
      className={`relative group inline-block ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Ambient Pulsing Glow Aura */}
      <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-cyan-500 via-sky-400 to-blue-600 opacity-60 blur-xl group-hover:opacity-85 transition duration-500 pointer-events-none" />

      {/* Circular Gradient Ring */}
      <div
        className={`relative ${sizeClasses[size]} rounded-full bg-gradient-to-tr from-cyan-400 via-sky-300 to-blue-500 ${ringPadding[size]} shadow-2xl shadow-cyan-500/30 transition duration-500 group-hover:scale-105`}
      >
        {/* Inner Circle Frame */}
        <div className="w-full h-full rounded-full bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 overflow-hidden relative flex items-center justify-center border-2 border-slate-900">
          {/* Circular Cyber Light Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.25),transparent_70%)] pointer-events-none" />

          {/* Instructor Transparent Image */}
          <img
            src={photoUrl}
            alt="Mahfuzur Rahman Mahdi (MRM)"
            className="w-full h-full object-cover object-top scale-105 group-hover:scale-110 transition duration-500 relative z-10"
            loading="eager"
          />
        </div>
      </div>

      {/* Floating MRM Monogram Chip */}
      {showMrmBadge && size !== 'sm' && (
        <div className="absolute top-1.5 right-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/90 border border-cyan-400/80 text-cyan-300 text-[11px] font-black shadow-lg z-20 flex items-center gap-1 backdrop-blur-md">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>MRM</span>
        </div>
      )}

      {/* Bottom Experience Badge */}
      {showExperienceBadge && (size === 'lg' || size === 'xl') && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold shadow-xl shadow-cyan-500/25 whitespace-nowrap z-20 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-950 fill-current" />
          <span>অভিজ্ঞতা: ২০১৮ সাল থেকে</span>
        </div>
      )}
    </div>
  );
};
