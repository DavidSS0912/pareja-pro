import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}: {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  [key: string]: any;
}) {
  const baseClasses = "inline-flex items-center justify-center font-semibold transition-colors duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants: Record<ButtonVariant, string> = {
    primary: "bg-[#111319] hover:bg-[#1A1D26] text-white shadow-sm focus:ring-slate-900/50",
    secondary: "bg-[#F1F5F9] text-[#64748B] hover:bg-slate-200/70 border border-[#EEF0F4] focus:ring-slate-400/50",
    danger: "bg-[#F97316] hover:bg-[#ea580c] text-white shadow-sm focus:ring-[#F97316]/50",
    outline: "bg-white text-slate-700 border border-[#EEF0F4] hover:bg-slate-50 focus:ring-slate-300",
    ghost: "bg-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-100 focus:ring-slate-300",
  };

  const sizes: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
