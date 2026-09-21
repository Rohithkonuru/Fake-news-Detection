import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { LandingPage } from './pages/LandingPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { DashboardPage } from './pages/DashboardPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { authService } from './services/auth';
import { apiService } from './services/api';
import type { User, FullVerificationResponse, StreamStage, StreamStageEvent } from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<'landing' | 'workspace' | 'dashboard' | 'how-it-works'>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getUser());
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // Verification workflow state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<StreamStage>('IDLE');
  const [stageMessage, setStageMessage] = useState<string>('');
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [verificationResult, setVerificationResult] = useState<FullVerificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Attempt auto-login if token exists
    authService.fetchMe().then((u) => {
      if (u) setCurrentUser(u);
    });
  }, []);

  const handleVerify = async (type: 'claim' | 'article' | 'url', content: string) => {
    setIsLoading(true);
    setError(null);
    setVerificationResult(null);
    setCurrentStage('READING_CONTENT');
    setStageMessage('Reading submission and inspecting safety...');
    setProgressPercentage(10);
    setCurrentTab('workspace');

    try {
      // Use live SSE streaming
      const result = await apiService.streamVerification(type, content, (event: StreamStageEvent) => {
        setCurrentStage(event.stage);
        setStageMessage(event.message);
        setProgressPercentage(event.progress_percentage);
      });
      setVerificationResult(result);
    } catch (err: any) {
      console.error('Verification error:', err);
      // If streaming fails due to browser environment, try direct endpoint fallback
      try {
        setStageMessage('Connecting to verification engine...');
        const directResult = await apiService.verifyDirect(type, content);
        setVerificationResult(directResult);
        setCurrentStage('COMPLETE');
        setProgressPercentage(100);
      } catch (fallbackErr: any) {
        setError(fallbackErr.message || err.message || 'Verification could not be completed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemo = async (demoId: string) => {
    setIsLoading(true);
    setError(null);
    setVerificationResult(null);
    setCurrentStage('READING_CONTENT');
    setStageMessage('Loading verified benchmark case...');
    setProgressPercentage(40);
    setCurrentTab('workspace');

    try {
      const demoResult = await apiService.getDemoExample(demoId);
      setProgressPercentage(100);
      setCurrentStage('COMPLETE');
      setVerificationResult(demoResult);
    } catch (err: any) {
      setError(err.message || 'Failed to load demo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectReport = (report: FullVerificationResponse) => {
    setVerificationResult(report);
    setCurrentTab('workspace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setVerificationResult(null);
    setError(null);
    setCurrentStage('IDLE');
    setProgressPercentage(0);
    setStageMessage('');
  };

  const handleLogout = () => {
    authService.clearSession();
    setCurrentUser(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main View Area */}
      <main style={{ flex: 1, paddingTop: '1.5rem' }}>
        <div className="container">
          {currentTab === 'landing' && (
            <LandingPage
              onVerify={handleVerify}
              onSelectDemo={handleSelectDemo}
              isLoading={isLoading}
            />
          )}

          {currentTab === 'workspace' && (
            <WorkspacePage
              onVerify={handleVerify}
              onSelectDemo={handleSelectDemo}
              isLoading={isLoading}
              currentStage={currentStage}
              stageMessage={stageMessage}
              progressPercentage={progressPercentage}
              verificationResult={verificationResult}
              error={error}
              onReset={handleReset}
            />
          )}

          {currentTab === 'dashboard' && (
            <DashboardPage
              currentUser={currentUser}
              onOpenAuth={() => setIsAuthOpen(true)}
              onSelectReport={handleSelectReport}
            />
          )}

          {currentTab === 'how-it-works' && <HowItWorksPage />}
        </div>
      </main>

      {/* Footer */}
      <Footer onNavigate={setCurrentTab} />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthOpen(false);
        }}
      />
    </div>
  );
}

export default App;
