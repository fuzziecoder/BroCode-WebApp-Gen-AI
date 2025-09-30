import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = 'h-8 w-8' }) => {
  return (
    <svg 
        viewBox="0 0 24 22" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className={className}
    >
        <path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M12 0L24 22H0L12 0ZM13.8 11.9L18 20H15.5L12 13L8.5 20H6L10.2 11.9H13.8Z" 
            fill="white"
        />
    </svg>
  );
};

export default Logo;