import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyles = "font-semibold rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-linear-to-r from-amber-light to-amber-medium text-white text-outline-black hover:from-amber-light hover:to-amber-medium-dark shadow-lg hover:shadow-xl hover:scale-105",
    secondary: "bg-white text-amber-ink hover:bg-amber-lightest border-2 border-amber-light",
    outline: "border-2 border-amber-medium text-amber-ink hover:bg-amber-lightest",
  };
  
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-10 py-4 text-lg",
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
