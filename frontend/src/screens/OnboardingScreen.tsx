import React, { useState } from 'react';
import type { UserRole, AuthResponse } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import FormSection from '../components/ui/FormSection';
import { apiSignup, apiLogin } from '../api/client';

interface OnboardingScreenProps {
  onAuth: (data: AuthResponse) => void;
}

const ROLES: { value: UserRole; label: string; icon: string }[] = [
  { value: 'reporter',  label: 'Reporter',  icon: '📍' },
  { value: 'rescuer',   label: 'Rescuer',   icon: '🚑' },
  { value: 'pet-owner', label: 'Pet Owner', icon: '🐾' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onAuth }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('reporter');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');

    // ── Validation ───────────────────────────────────────
    if (!EMAIL_RE.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (mode === 'signup' && !fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);
    try {
      let data: AuthResponse;
      if (mode === 'signup') {
        data = await apiSignup(email, password, fullName.trim(), role);
      } else {
        data = await apiLogin(email, password);
      }
      onAuth(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full px-5 pb-6 pt-4">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-5">
        <div className="text-5xl mb-3">🐾</div>
        <h1 className="text-2xl font-bold text-slate-800">StrayLink</h1>
        <p className="text-sm text-slate-500 mt-1">
          Connecting stray animals with rescuers
        </p>
      </div>

      {/* Toggle */}
      <div className="flex rounded-xl bg-slate-200 p-1 mb-4">
        {(['login', 'signup'] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(''); }}
            className={[
              'flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-150',
              mode === m
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700',
            ].join(' ')}
          >
            {m === 'login' ? 'Log in' : 'Sign up'}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
        <FormSection title={mode === 'login' ? 'Welcome back' : 'Create account'}>
          {mode === 'signup' && (
            <Input
              label="Full Name"
              type="text"
              value={fullName}
              onChange={setFullName}
              placeholder="Jane Doe"
              required
            />
          )}
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Min 8 characters"
            required
          />
        </FormSection>

        {mode === 'signup' && (
          <FormSection title="I want to">
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={[
                    'flex flex-col items-center gap-1.5 rounded-xl border-2 py-3 px-2 transition-all duration-150',
                    role === r.value
                      ? 'border-rescue-500 bg-rescue-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300',
                  ].join(' ')}
                >
                  <span className="text-2xl">{r.icon}</span>
                  <span
                    className={[
                      'text-xs font-medium',
                      role === r.value ? 'text-rescue-700' : 'text-slate-600',
                    ].join(' ')}
                  >
                    {r.label}
                  </span>
                </button>
              ))}
            </div>
          </FormSection>
        )}

        {error && (
          <p className="text-sm text-rose-500 text-center -mt-1">{error}</p>
        )}
      </div>

      {/* CTA */}
      <div className="mt-auto pt-4">
        <Button
          label={loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          onClick={handleSubmit}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default OnboardingScreen;
