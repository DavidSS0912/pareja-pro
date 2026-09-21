import React from 'react';

export const Card = ({ children, className = '', ...props }: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <div
      className={`bg-white border border-[#E5E5E5] rounded-xl p-6 transition-all duration-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
