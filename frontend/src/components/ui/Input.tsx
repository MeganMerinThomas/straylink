import React from 'react';

interface InputProps {
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  options,
  required = false,
}) => {
  const baseClasses =
    'w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-800 placeholder-slate-400 transition-colors focus:border-rescue-500 focus:outline-none focus:ring-2 focus:ring-rescue-500/20';

  const renderField = () => {
    switch (type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className={baseClasses + ' appearance-none'}
          >
            {options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            rows={4}
            className={baseClasses + ' resize-none'}
          />
        );
      default:
        return (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            className={baseClasses}
          />
        );
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-600">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {renderField()}
    </div>
  );
};

export default Input;
