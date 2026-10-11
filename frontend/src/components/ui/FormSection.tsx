import React from 'react';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ title, children }) => {
  return (
    <div className="rounded-xl bg-white/95 p-5 shadow-sm border border-slate-100">
      <h3 className="mb-4 text-base font-semibold text-slate-700">{title}</h3>
      <div className="flex flex-col gap-4">
        {children}
      </div>
    </div>
  );
};

export default FormSection;
