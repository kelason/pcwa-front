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
    primary: "bg-[#65B891] text-white hover:bg-[#93E5AB] shadow-sm shadow-[#4E878C]/50",
    secondary: "text-slate-600 bg-slate-100 hover:bg-slate-200",
    danger: "text-red-600 hover:bg-red-50",
    ghost: "text-slate-400 hover:text-[#4E878C] hover:bg-[#65B891]/10"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {icon}
      {children}
    </button>
  );
};