import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`glass rounded-[32px] p-6 sm:p-8 transition-all duration-300 hover:shadow-md ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
