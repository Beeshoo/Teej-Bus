
import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "w-12 h-12" }) => {
  return (
    <div className={`relative flex items-center justify-center`}>
      <svg 
        className={className}
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Royal Crown Shape */}
        <path d="M20 70L10 40L35 55L50 25L65 55L90 40L80 70H20Z" fill="#f59e0b" />
        {/* Bus Body Integrated */}
        <rect x="25" y="65" width="50" height="15" rx="4" fill="#1e3a8a" />
        {/* Wheels */}
        <circle cx="35" cy="80" r="5" fill="#111827" />
        <circle cx="65" cy="80" r="5" fill="#111827" />
        {/* Royal Accents */}
        <circle cx="50" cy="25" r="4" fill="#f59e0b" />
        <circle cx="10" cy="40" r="3" fill="#f59e0b" />
        <circle cx="90" cy="40" r="3" fill="#f59e0b" />
      </svg>
    </div>
  );
};

export default Logo;