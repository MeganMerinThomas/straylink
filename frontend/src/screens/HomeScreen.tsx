import React from 'react';
import type { Profile } from '../types';
import Button from '../components/ui/Button';

interface HomeScreenProps {
  profile: Profile;
  onReport: () => void;
  onLogout: () => void;
}

const roleGreeting: Record<string, string> = {
  reporter: 'Spot a stray? Report it and we\'ll send help.',
  rescuer: 'Thank you for being a rescuer! Report a stray you\'ve found.',
  'pet-owner': 'Find shelters and services near you, or report a stray.',
};

const roleIcon: Record<string, string> = {
  reporter: '📍',
  rescuer: '🚑',
  'pet-owner': '🐾',
};

const HomeScreen: React.FC<HomeScreenProps> = ({ profile, onReport, onLogout }) => {
  return (
    <div className="flex flex-col h-full px-5 pb-6 pt-4">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-slate-800">StrayLink</h1>
          <p className="text-xs text-slate-500">
            {profile.full_name ? `Welcome, ${profile.full_name}` : 'Welcome back 👋'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-rescue-100 flex items-center justify-center">
            <span className="text-lg">{roleIcon[profile.role] ?? '📍'}</span>
          </div>
          <button
            onClick={onLogout}
            className="text-xs text-slate-400 hover:text-rose-500 transition-colors font-medium"
            title="Log out"
          >
            Log out
          </button>
        </div>
      </div>

      {/* Empty state */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-5">
          <span className="text-5xl">🐕</span>
        </div>
        <h2 className="text-lg font-semibold text-slate-700 mb-2">
          No active reports
        </h2>
        <p className="text-sm text-slate-500 max-w-[240px] leading-relaxed">
          {roleGreeting[profile.role] ?? roleGreeting.reporter}
        </p>
      </div>

      {/* Primary CTA */}
      <div className="mt-auto pt-4 flex flex-col gap-3">
        <Button label="📍  Report a Stray" onClick={onReport} />

        {/* Secondary actions (non-functional placeholders) */}
        <div className="grid grid-cols-2 gap-2">
          <button
            className="flex items-center justify-center gap-1.5 rounded-xl bg-white border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            onClick={() => {}}
          >
            🏠 Shelters
          </button>
          <button
            className="flex items-center justify-center gap-1.5 rounded-xl bg-white border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            onClick={() => {}}
          >
            🩺 Services
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
