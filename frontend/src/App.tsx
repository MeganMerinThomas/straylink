import React, { useState, useCallback, useEffect } from 'react';
import type {
  Screen,
  Profile,
  AuthResponse,
  ReportData,
  ReportStatus,
  LocationData,
} from './types';
import { getStoredToken, getStoredUser, storeAuth, clearAuth } from './api/client';
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

  // ── Submission status ────────────────────────────────
  const [reportStatus, setReportStatus] = useState<ReportStatus>('idle');

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
    setReportStatus('idle');
  }, []);

  // ── Report handlers ──────────────────────────────────

  const handleReport = useCallback(() => {
    setReport(INITIAL_REPORT);
    setReportStatus('idle');
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

  const handleSubmitReport = useCallback(() => {
    setScreen('confirmation');
    setReportStatus('sending');

    // Simulate a backend call — 70 % success, 30 % failure
    setTimeout(() => {
      const ok = Math.random() < 0.7;
      setReportStatus(ok ? 'success' : 'failure');
    }, 1200 + Math.random() * 800);
  }, []);

  const handleRetry = useCallback(() => {
    setReportStatus('sending');
    setTimeout(() => {
      const ok = Math.random() < 0.7;
      setReportStatus(ok ? 'success' : 'failure');
    }, 1200 + Math.random() * 800);
  }, []);

  const handleGoHome = useCallback(() => {
    setScreen('home');
    setReportStatus('idle');
  }, []);

  const handleNewReport = useCallback(() => {
    setReport(INITIAL_REPORT);
    setReportStatus('idle');
    setScreen('report-location');
  }, []);

  const handleBackToHome = useCallback(() => {
    setScreen('home');
  }, []);

  const handleBackToLocation = useCallback(() => {
    setScreen('report-location');
  }, []);

  const handleNavigate = useCallback((target: Screen) => {
    if (target === 'report-location') {
      setReport(INITIAL_REPORT);
      setReportStatus('idle');
    }
    setScreen(target);
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
            status={reportStatus}
            report={report}
            onRetry={handleRetry}
            onNewReport={handleNewReport}
            onGoHome={handleGoHome}
          />
        );
    }
  };

  return <PhoneFrame>{renderScreen()}</PhoneFrame>;
};

export default App;
