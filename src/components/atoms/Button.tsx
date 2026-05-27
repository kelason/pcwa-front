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
  const baseStyles = "flex items-center gap-2 px-3 py-2 rounded transition-colors text-sm font-medium";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "text-gray-600 hover:bg-gray-100",
    danger: "text-red-500 hover:text-red-700",
    ghost: "text-blue-600 hover:text-blue-800"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {icon}
      {children}
    </button>
  );
};