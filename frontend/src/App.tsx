import React, { useState, useCallback } from 'react';
import type {
  Screen,
  UserData,
  UserRole,
  ReportData,
  ReportStatus,
  LocationData,
} from './types';
import PhoneFrame from './components/PhoneFrame';
import BottomNav from './components/BottomNav';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import ReportLocationScreen from './screens/ReportLocationScreen';
import ReportDetailsScreen from './screens/ReportDetailsScreen';
import ConfirmationScreen from './screens/ConfirmationScreen';

const INITIAL_USER: UserData = {
  phoneOrEmail: '',
  password: '',
  role: 'reporter' as UserRole,
};

const INITIAL_REPORT: ReportData = {
  location: null,
  condition: 'Healthy',
  animalType: 'Dog',
  description: '',
};

const App: React.FC = () => {
  // ── Navigation state ────────────────────────────────
  const [screen, setScreen] = useState<Screen>('onboarding');

  // ── User state (onboarding data) ───────────────────
  const [user, setUser] = useState<UserData>(INITIAL_USER);

  // ── Report form state ──────────────────────────────
  const [report, setReport] = useState<ReportData>(INITIAL_REPORT);

  // ── Submission status ──────────────────────────────
  const [reportStatus, setReportStatus] = useState<ReportStatus>('idle');

  // ── Handlers ───────────────────────────────────────

  const handleUserChange = useCallback((partial: Partial<UserData>) => {
    setUser((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleOnboardingContinue = useCallback(() => {
    setScreen('home');
  }, []);

  const handleReport = useCallback(() => {
    setReport(INITIAL_REPORT);        // reset form for a new report
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

  // ── Screen renderer ────────────────────────────────
  const renderScreen = () => {
    switch (screen) {
      case 'onboarding':
        return (
          <OnboardingScreen
            user={user}
            onUserChange={handleUserChange}
            onContinue={handleOnboardingContinue}
          />
        );

      case 'home':
        return (
          <HomeScreen
            role={user.role}
            onReport={handleReport}
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
