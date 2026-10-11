import React, { useState, useCallback, useEffect } from 'react';
import type {
  Screen,
  Profile,
  AuthResponse,
  ReportData,
  LocationData,
  Report,
} from './types';
import {
  getStoredToken, getStoredUser, storeAuth, clearAuth,
  onSessionExpired, apiCreateReport, apiRateReport,
} from './api/client';
import PhoneFrame from './components/PhoneFrame';
import BottomNav from './components/BottomNav';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import ReportLocationScreen from './screens/ReportLocationScreen';
import ReportDetailsScreen from './screens/ReportDetailsScreen';
import ConfirmationScreen from './screens/ConfirmationScreen';

const INITIAL_REPORT: ReportData = {
  location: null,
  condition: 'Healthy',
  animalType: 'Dog',
  description: '',
};

const App: React.FC = () => {
  // ── Auth state ────────────────────────────────────────
  const [profile, setProfile] = useState<Profile | null>(() => {
    const token = getStoredToken();
    const user = getStoredUser();
    return token && user ? user : null;
  });

  // ── Navigation state ──────────────────────────────────
  const [screen, setScreen] = useState<Screen>(
    () => (getStoredToken() ? 'home' : 'onboarding'),
  );

  // ── Report form state ────────────────────────────────
  const [report, setReport] = useState<ReportData>(INITIAL_REPORT);

  // ── Submission state ─────────────────────────────────
  const [savedReport, setSavedReport] = useState<Report | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ── Register 401 handler ─────────────────────────────
  useEffect(() => {
    onSessionExpired(() => {
      setProfile(null);
      setScreen('onboarding');
    });
  }, []);

  // ── Auth handlers ────────────────────────────────────

  const handleAuth = useCallback((data: AuthResponse) => {
    storeAuth(data);
    setProfile(data.user);
    setScreen('home');
  }, []);

  const handleLogout = useCallback(() => {
    clearAuth();
    setProfile(null);
    setScreen('onboarding');
    setReport(INITIAL_REPORT);
    setSavedReport(null);
    setSubmitError(null);
    setSubmitting(false);
  }, []);

  const handleSessionExpired = useCallback(() => {
    setProfile(null);
    setScreen('onboarding');
  }, []);

  // ── Submit report ────────────────────────────────────

  const doSubmit = useCallback(async () => {
    if (!report.location) return;
    setScreen('confirmation');
    setSavedReport(null);
    setSubmitError(null);
    setSubmitting(true);

    try {
      const saved = await apiCreateReport({
        animal_type: report.animalType,
        condition: report.condition,
        description: report.description,
        location_label: report.location.label,
        latitude: report.location.lat,
        longitude: report.location.lng,
      });
      setSavedReport(saved);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }, [report]);

  const handleSubmitReport = useCallback(() => {
    doSubmit();
  }, [doSubmit]);

  const handleRetry = useCallback(() => {
    doSubmit();
  }, [doSubmit]);

  const handleRateReport = useCallback(async (rating: number) => {
    if (!savedReport) return;
    try {
      const updated = await apiRateReport(savedReport.id, rating);
      setSavedReport(updated);
    } catch {
      // rating failure is non-critical
    }
  }, [savedReport]);

  const handleGoHome = useCallback(() => {
    setScreen('home');
    setSavedReport(null);
    setSubmitError(null);
    setSubmitting(false);
  }, []);

  const handleNewReport = useCallback(() => {
    setReport(INITIAL_REPORT);
    setSavedReport(null);
    setSubmitError(null);
    setSubmitting(false);
    setScreen('report-location');
  }, []);

  // ── Navigation helpers ───────────────────────────────

  const handleReport = useCallback(() => {
    setReport(INITIAL_REPORT);
    setSavedReport(null);
    setSubmitError(null);
    setSubmitting(false);
    setScreen('report-location');
  }, []);

  const handleLocationConfirm = useCallback((loc: LocationData) => {
    setReport((prev) => ({ ...prev, location: loc }));
    setScreen('report-details');
  }, []);

  const handleReportFieldChange = useCallback(
    (partial: Partial<ReportData>) => {
      setReport((prev) => ({ ...prev, ...partial }));
    },
    [],
  );

  const handleBackToHome = useCallback(() => {
    setScreen('home');
  }, []);

  const handleBackToLocation = useCallback(() => {
    setScreen('report-location');
  }, []);

  // ── Screen renderer ──────────────────────────────────
  const renderScreen = () => {
    switch (screen) {
      case 'onboarding':
        return <OnboardingScreen onAuth={handleAuth} />;

      case 'home':
        if (!profile) return <OnboardingScreen onAuth={handleAuth} />;
        return (
          <HomeScreen
            profile={profile}
            onReport={handleReport}
            onLogout={handleLogout}
            onSessionExpired={handleSessionExpired}
          />
        );

      case 'report-location':
        return (
          <ReportLocationScreen
            location={report.location}
            onLocationConfirm={handleLocationConfirm}
            onBack={handleBackToHome}
          />
        );

      case 'report-details':
        return (
          <ReportDetailsScreen
            report={report}
            onFieldChange={handleReportFieldChange}
            onSubmit={handleSubmitReport}
            onBack={handleBackToLocation}
          />
        );

      case 'confirmation':
        return (
          <ConfirmationScreen
            savedReport={savedReport}
            submitError={submitError}
            submitting={submitting}
            report={report}
            onRetry={handleRetry}
            onNewReport={handleNewReport}
            onGoHome={handleGoHome}
            onRate={handleRateReport}
          />
        );
    }
  };

  return <PhoneFrame>{renderScreen()}</PhoneFrame>;
};

export default App;
