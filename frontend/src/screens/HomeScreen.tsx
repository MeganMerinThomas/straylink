import React, { useState, useEffect, useCallback } from 'react';
import type { Profile, Report } from '../types';
import { apiGetReports, apiUpdateReportStatus } from '../api/client';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

interface HomeScreenProps {
  profile: Profile;
  onReport: () => void;
  onLogout: () => void;
  onSessionExpired: () => void;
}

const roleGreeting: Record<string, string> = {
  reporter: 'Spot a stray? Report it and we\'ll send help.',
  rescuer: 'Thank you for being a rescuer! Report a stray you\'ve found.',
  'pet-owner': 'Find shelters and services near you, or report a stray.',
};

const roleIcon: Record<string, string> = { reporter: '📍', rescuer: '🚑', 'pet-owner': '🐾' };
const animalIcon: Record<string, string> = { Dog: '🐕', Cat: '🐱', Other: '🐾' };

const STATUS_COLORS: Record<string, string> = {
  Reported: 'bg-blue-100 text-blue-700',
  Claimed: 'bg-yellow-100 text-yellow-700',
  'En Route': 'bg-orange-100 text-orange-700',
  Collected: 'bg-emerald-100 text-emerald-700',
  'At Vet': 'bg-purple-100 text-purple-700',
};

const STATUS_OPTIONS = ['Claimed', 'En Route', 'Collected', 'At Vet'];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ profile, onReport, onLogout, onSessionExpired }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReports(await apiGetReports());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load reports';
      if (msg !== 'Your session has expired') setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadReports(); }, [loadReports]);

  const handleStatusChange = useCallback(async (id: string, status: string) => {
    try {
      await apiUpdateReportStatus(id, status);
      await loadReports();
    } catch { /* 401 handled by client */ }
  }, [loadReports]);

  const isRescuer = profile.role === 'rescuer';

  return (
    <div className="flex flex-col h-full px-5 pb-6 pt-4">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">StrayLink</h1>
          <p className="text-xs text-slate-500">
            {profile.full_name ? `Welcome, ${profile.full_name}` : 'Welcome back 👋'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadReports} className="text-xs text-slate-400 hover:text-rescue-600 transition-colors" title="Refresh">🔄</button>
          <div className="w-10 h-10 rounded-full bg-rescue-100 flex items-center justify-center">
            <span className="text-lg">{roleIcon[profile.role] ?? '📍'}</span>
          </div>
          <button onClick={onLogout} className="text-xs text-slate-400 hover:text-rose-500 transition-colors font-medium" title="Log out">Log out</button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-rescue-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <p className="text-sm text-rose-500 mb-3">{error}</p>
          <button onClick={loadReports} className="text-sm text-rescue-600 font-medium underline">Try again</button>
        </div>
      )}

      {/* Report list */}
      {!loading && !error && (
        <div className="flex-1 overflow-y-auto pb-2">
          {reports.length > 0 ? (
            <>
              <h2 className="text-sm font-semibold text-slate-500 mb-3">
                {isRescuer ? '🚑 Rescue Dashboard' : '📋 My Reports'}
              </h2>
              <div className="flex flex-col gap-3">
                {reports.map((r) => (
                  <div key={r.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{animalIcon[r.animal_type] ?? '🐾'}</span>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{r.animal_type} — {r.condition}</p>
                          {isRescuer && r.reporter_name && <p className="text-xs text-slate-400">by {r.reporter_name}</p>}
                        </div>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status] ?? 'bg-slate-100 text-slate-600'}`}>{r.status}</span>
                    </div>
                    {r.location_label && <p className="text-xs text-slate-500 mb-1">📍 {r.location_label}</p>}
                    {r.description && <p className="text-xs text-slate-400 line-clamp-2 mb-2">{r.description}</p>}
                    <p className="text-[10px] text-slate-300">{timeAgo(r.created_at)}</p>
                    {isRescuer && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <Input
                          label="Update rescue status"
                          type="select"
                          value={r.status}
                          onChange={(v) => handleStatusChange(r.id, v)}
                          options={[r.status, ...STATUS_OPTIONS.filter((s) => s !== r.status)]}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-16">
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-5">
                <span className="text-5xl">🐕</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-700 mb-2">No active reports</h2>
              <p className="text-sm text-slate-500 max-w-[240px] leading-relaxed">
                {roleGreeting[profile.role] ?? roleGreeting.reporter}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Primary CTA */}
      <div className="mt-auto pt-4 flex flex-col gap-3">
        <Button label="📍  Report a Stray" onClick={onReport} />
        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center justify-center gap-1.5 rounded-xl bg-white border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">🏠 Shelters</button>
          <button className="flex items-center justify-center gap-1.5 rounded-xl bg-white border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">🩺 Services</button>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
