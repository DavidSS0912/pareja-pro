import React from 'react';

export const Card = ({ children, className = '', ...props }: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <div
      className={`bg-white rounded-3xl p-6 border border-[#EEF0F4] shadow-bento transition-all duration-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
