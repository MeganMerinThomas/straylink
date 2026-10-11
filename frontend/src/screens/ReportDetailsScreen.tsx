import React from 'react';
import type { ReportData } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import FormSection from '../components/ui/FormSection';

interface ReportDetailsScreenProps {
  report: ReportData;
  onFieldChange: (field: Partial<ReportData>) => void;
  onSubmit: () => void;
  onBack: () => void;
}

const ReportDetailsScreen: React.FC<ReportDetailsScreenProps> = ({
  report,
  onFieldChange,
  onSubmit,
  onBack,
}) => {
  return (
    <div className="flex flex-col h-full px-5 pb-6 pt-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300 transition-colors"
        >
          ←
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-800">Step 2 of 2</h1>
          <p className="text-xs text-slate-500">Tell us about the animal</p>
        </div>
      </div>

      {/* Location summary */}
      {report.location && (
        <div className="mb-4 flex items-center gap-2 bg-rescue-50 border border-rescue-200 rounded-xl px-4 py-2.5">
          <span className="text-sm">📍</span>
          <p className="text-xs text-rescue-700 font-medium truncate">
            {report.location.label}
          </p>
        </div>
      )}

      {/* Form */}
      <div className="flex-1 flex flex-col gap-4">
        <FormSection title="Animal Details">
          <Input
            label="Condition"
            type="select"
            value={report.condition}
            onChange={(v) => onFieldChange({ condition: v as ReportData['condition'] })}
            options={['Injured', 'Sick', 'Healthy']}
            required
          />
          <Input
            label="Animal Type"
            type="select"
            value={report.animalType}
            onChange={(v) => onFieldChange({ animalType: v as ReportData['animalType'] })}
            options={['Dog', 'Cat', 'Other']}
            required
          />
        </FormSection>

        <FormSection title="Description">
          <Input
            label="What do you see?"
            type="textarea"
            value={report.description}
            onChange={(v) => onFieldChange({ description: v })}
            placeholder="E.g. Small brown dog limping near the park entrance, seems scared..."
            required
          />
        </FormSection>
      </div>

      {/* Submit */}
      <div className="mt-auto pt-4">
        <Button label="Submit Report 🚀" onClick={onSubmit} disabled={!report.description.trim()} />
      </div>
    </div>
  );
};

export default ReportDetailsScreen;
