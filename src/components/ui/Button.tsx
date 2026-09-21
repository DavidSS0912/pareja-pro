import React from 'react';

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  type = 'button',
  ...props 
}) {
  const baseClasses = "inline-flex items-center justify-center font-bold transition-all duration-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500 shadow-md hover:shadow-lg hover:-translate-y-0.5",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-500 border border-slate-200",
    danger: "bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-500 shadow-md hover:shadow-lg hover:-translate-y-0.5",
    outline: "bg-transparent text-slate-700 border-2 border-slate-200 hover:border-slate-300 focus:ring-slate-500",
    ghost: "bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100 focus:ring-slate-500"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <button 
      type={type as any} 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
}
