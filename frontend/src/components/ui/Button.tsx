import React from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<string, string> = {
  primary:
    'bg-rescue-600 hover:bg-rescue-700 active:bg-rescue-800 text-white shadow-lg shadow-rescue-600/25',
  secondary:
    'bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-800',
  danger:
    'bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white shadow-lg shadow-rose-500/25',
};

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = 'primary',
  disabled = false,
  fullWidth = true,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'rounded-xl px-6 py-3 text-base font-semibold transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rescue-400',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
        variantClasses[variant],
        fullWidth ? 'w-full' : 'w-auto',
      ].join(' ')}
    >
      {label}
    </button>
  );
};

export default Button;
