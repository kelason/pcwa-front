import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  icon, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-semibold active:scale-95 disabled:opacity-50";
  const variants = {
    primary: "bg-[#2C5EAD] text-white hover:bg-[#4BB8FA] shadow-sm shadow-[#C4E2F5]/50",
    secondary: "text-slate-600 bg-slate-100 hover:bg-slate-200",
    danger: "text-red-600 hover:bg-red-50",
    ghost: "text-slate-400 hover:text-[#4BB8FA] hover:bg-[#C4E2F5]/10"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {icon}
      {children}
    </button>
  );
};