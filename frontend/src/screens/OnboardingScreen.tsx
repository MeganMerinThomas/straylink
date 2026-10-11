import React, { useState } from 'react';
import type { UserData, UserRole } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import FormSection from '../components/ui/FormSection';

interface OnboardingScreenProps {
  user: UserData;
  onUserChange: (data: Partial<UserData>) => void;
  onContinue: () => void;
}

const ROLES: { value: UserRole; label: string; icon: string }[] = [
  { value: 'reporter',   label: 'Reporter',   icon: '📍' },
  { value: 'rescuer',    label: 'Rescuer',    icon: '🚑' },
  { value: 'pet-owner',  label: 'Pet Owner',  icon: '🐾' },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  user,
  onUserChange,
  onContinue,
}) => {
  const [error, setError] = useState('');

  const handleContinue = () => {
    if (!user.phoneOrEmail.trim()) {
      setError('Please enter your phone number or email.');
      return;
    }
    if (!user.password.trim() || user.password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    setError('');
    onContinue();
  };

  return (
    <div className="flex flex-col h-full px-5 pb-6 pt-4">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="text-5xl mb-3">🐾</div>
        <h1 className="text-2xl font-bold text-slate-800">StrayLink</h1>
        <p className="text-sm text-slate-500 mt-1">
          Connecting stray animals with rescuers
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 flex flex-col gap-4">
        <FormSection title="Your Details">
          <Input
            label="Phone or Email"
            type="text"
            value={user.phoneOrEmail}
            onChange={(v) => onUserChange({ phoneOrEmail: v })}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={user.password}
            onChange={(v) => onUserChange({ password: v })}
            placeholder="Min 4 characters"
            required
          />
        </FormSection>

        <FormSection title="I want to">
          <div className="grid grid-cols-3 gap-2">
            {ROLES.map((r) => (
              <button
                key={r.value}
                onClick={() => onUserChange({ role: r.value })}
                className={[
                  'flex flex-col items-center gap-1.5 rounded-xl border-2 py-3 px-2 transition-all duration-150',
                  user.role === r.value
                    ? 'border-rescue-500 bg-rescue-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300',
                ].join(' ')}
              >
                <span className="text-2xl">{r.icon}</span>
                <span
                  className={[
                    'text-xs font-medium',
                    user.role === r.value ? 'text-rescue-700' : 'text-slate-600',
                  ].join(' ')}
                >
                  {r.label}
                </span>
              </button>
            ))}
          </div>
        </FormSection>

        {error && (
          <p className="text-sm text-rose-500 text-center -mt-1">{error}</p>
        )}
      </div>

      {/* CTA */}
      <div className="mt-auto pt-4">
        <Button label="Continue" onClick={handleContinue} />
      </div>
    </div>
  );
};

export default OnboardingScreen;
