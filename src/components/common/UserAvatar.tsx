import React from 'react';

interface UserAvatarProps {
  name?: string;
  username?: string;
  isStaff?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = '',
  username = '',
  isStaff = false,
  size = 'md',
  className = '',
}) => {
  const displayName = name || username || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-2xl',
  }[size];

  const svgSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-10 h-10',
  }[size];

  // Deterministic logo shape based on username / name hash
  let hash = 0;
  for (let i = 0; i < displayName.length; i++) {
    hash = (hash << 5) - hash + displayName.charCodeAt(i);
    hash |= 0;
  }
  const logoVariant = Math.abs(hash) % 4;

  if (isStaff) {
    // Admin Logo Insignia: Official Authority Shield/Core Mark
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-xl bg-[#3D766D] text-[#FDFDFE] shadow-xs select-none shrink-0 border border-[#2D5851] overflow-hidden ${sizeClasses} ${className}`}
        title={`Admin: ${displayName}`}
      >
        {/* Geometric emblem vector background */}
        <div className="absolute inset-0 opacity-15 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-full h-full p-1">
            <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
          </svg>
        </div>

        {/* Central Logo Glyph */}
        <div className="relative z-10 flex items-center justify-center font-extrabold tracking-tighter">
          {size === 'xs' || size === 'sm' ? (
            <span>{initial}</span>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={svgSizes}
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
          )}
        </div>

        {/* Premium emblem accent corner */}
        <div className="absolute top-0 right-0 w-2 h-2 bg-[#2D5851] rounded-bl-sm" />
      </div>
    );
  }

  // Member Logo Insignia: Modern Geometric Brand Token
  const renderMemberLogo = () => {
    switch (logoVariant) {
      case 0:
        // Hexagonal Tech Emblem with Monogram
        return (
          <div className="relative flex items-center justify-center w-full h-full">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D6D9DF"
              strokeWidth="1.8"
              className="absolute inset-0 w-full h-full p-0.5"
            >
              <polygon points="12 2 21 7.5 21 16.5 12 22 3 16.5 3 7.5 12 2" />
            </svg>
            <span className="relative z-10 font-bold text-[#3D766D] tracking-tight">{initial}</span>
          </div>
        );
      case 1:
        // Interlocking Geometric Rings with Monogram
        return (
          <div className="relative flex items-center justify-center w-full h-full">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D6D9DF"
              strokeWidth="1.5"
              className="absolute inset-0 w-full h-full p-1"
            >
              <circle cx="9" cy="12" r="6" />
              <circle cx="15" cy="12" r="6" />
            </svg>
            <span className="relative z-10 font-bold text-[#2D5851] tracking-tight">{initial}</span>
          </div>
        );
      case 2:
        // Diamond Facet Emblem
        return (
          <div className="relative flex items-center justify-center w-full h-full">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D6D9DF"
              strokeWidth="1.8"
              className="absolute inset-0 w-full h-full p-0.5"
            >
              <rect x="5" y="5" width="14" height="14" rx="2" transform="rotate(45 12 12)" />
            </svg>
            <span className="relative z-10 font-bold text-[#3D766D] tracking-tight">{initial}</span>
          </div>
        );
      default:
        // Dual Orbit Stack
        return (
          <div className="relative flex items-center justify-center w-full h-full">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D6D9DF"
              strokeWidth="1.8"
              className="absolute inset-0 w-full h-full p-1"
            >
              <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-30 12 12)" />
            </svg>
            <span className="relative z-10 font-bold text-[#3D766D] tracking-tight">{initial}</span>
          </div>
        );
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl bg-[#EBF3F1] border border-[#D6D9DF] shadow-2xs select-none shrink-0 ${sizeClasses} ${className}`}
      title={displayName}
    >
      {renderMemberLogo()}
      {/* Brand anchor indicator */}
      <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-[#3D766D]" />
    </div>
  );
};
