import React from 'react';
import type { ReportData, Report } from '../types';
import Button from '../components/ui/Button';
import { EmojiRating } from '../components/ui/EmojiRating';

interface ConfirmationScreenProps {
  savedReport: Report | null;
  submitError: string | null;
  submitting: boolean;
  report: ReportData;
  onRetry: () => void;
  onNewReport: () => void;
  onGoHome: () => void;
  onRate: (rating: number) => void;
}

const STATUS_STEPS = [
  { label: 'Report received', statuses: ['Reported', 'Claimed', 'En Route', 'Collected', 'At Vet'] },
  { label: 'Rescuer assigned', statuses: ['Claimed', 'En Route', 'Collected', 'At Vet'] },
  { label: 'On the way', statuses: ['En Route', 'Collected', 'At Vet'] },
  { label: 'Animal rescued', statuses: ['Collected', 'At Vet'] },
];

const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  savedReport,
  submitError,
  submitting,
  report,
  onRetry,
  onNewReport,
  onGoHome,
  onRate,
}) => {
  // ── Loading state ─────────────────────────────────
  if (submitting) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
          <div className="absolute inset-0 rounded-full border-4 border-rescue-500 border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🐾</span>
          </div>
        </div>
        <h2 className="text-lg font-semibold text-slate-700 mb-1">
          Sending your report…
        </h2>
        <p className="text-sm text-slate-500">
          Connecting you with nearby rescuers
        </p>
      </div>
    );
  }

  // ── Success state ─────────────────────────────────
  if (savedReport) {
    const currentStatus = savedReport.status;

    return (
      <div className="flex flex-col h-full px-5 pb-6 pt-4">
        <div className="flex flex-col items-center text-center pt-8 mb-8">
          <div className="w-20 h-20 rounded-full bg-rescue-100 flex items-center justify-center mb-4 shadow-lg shadow-rescue-500/20">
            <span className="text-4xl">🎉</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Help is on the way!</h1>
          <p className="text-sm text-slate-500 max-w-[250px]">Your report has been sent to nearby rescue volunteers.</p>
        </div>

        {/* Status tracker */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Status Tracker</h3>
          <div className="flex flex-col gap-0">
            {STATUS_STEPS.map((step, i) => {
              const done = step.statuses.includes(currentStatus);
              return (
                <div key={step.label} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${done ? 'bg-rescue-100 text-rescue-600' : 'bg-slate-100 text-slate-400'}`}>
                      {done ? '✓' : '⏳'}
                    </div>
                    {i < STATUS_STEPS.length - 1 && <div className={`w-[2px] h-6 ${done ? 'bg-rescue-300' : 'bg-slate-200'}`} />}
                  </div>
                  <div className="pt-1.5">
                    <p className={`text-sm font-medium ${done ? 'text-slate-700' : 'text-slate-400'}`}>{step.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Report summary */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Report Summary</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-400 text-xs">Location</span>
              <p className="text-slate-700 font-medium truncate">{savedReport.location_label ?? report.location?.label ?? '—'}</p>
            </div>
            <div>
              <span className="text-slate-400 text-xs">Animal</span>
              <p className="text-slate-700 font-medium">{savedReport.animal_type}</p>
            </div>
            <div>
              <span className="text-slate-400 text-xs">Condition</span>
              <p className="text-slate-700 font-medium">{savedReport.condition}</p>
            </div>
            <div>
              <span className="text-slate-400 text-xs">Report ID</span>
              <p className="text-slate-700 font-medium font-mono text-xs">#{savedReport.id.slice(0, 8)}</p>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-auto">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 text-center">
            How was your rescue experience?
          </h3>
          <EmojiRating onChange={onRate} />
        </div>

        {/* Actions */}
        <div className="pt-4 flex flex-col gap-2">
          <Button label="Report Another Stray" onClick={onNewReport} />
          <Button label="Back to Home" onClick={onGoHome} variant="secondary" />
        </div>
      </div>
    );
  }

  // ── Failure state ─────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mb-5">
        <span className="text-4xl">😔</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Something went wrong</h1>
      <p className="text-sm text-slate-500 max-w-[250px] mb-8">
        {submitError ?? "We couldn't send your report right now. Please try again."}
      </p>
      <div className="w-full flex flex-col gap-2">
        <Button label="Try Again" onClick={onRetry} variant="danger" />
        <Button label="Back to Home" onClick={onGoHome} variant="secondary" />
      </div>
    </div>
  );
};

export default ConfirmationScreen;
