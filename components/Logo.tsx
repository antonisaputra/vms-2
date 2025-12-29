import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className, showText = true }) => {
  return (
    <div className={`flex items-center ${className} ${showText ? 'justify-start' : 'justify-center'}`}>
      <div className="flex-shrink-0 text-green-600 dark:text-green-500 transition-all duration-300">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
           <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      
      <div className={`ml-3 text-left overflow-hidden whitespace-nowrap transition-all duration-300 ${showText ? 'w-auto opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-4 hidden'}`}>
        <span className="block text-lg font-bold text-gray-800 dark:text-white leading-tight">Universitas</span>
        <span className="block text-sm font-semibold text-green-600 dark:text-green-400 leading-tight">Hamzanwadi</span>
      </div>
    </div>
  );
};

export default Logo;
