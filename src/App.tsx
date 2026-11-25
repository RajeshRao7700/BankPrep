import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { SyllabusPage } from './pages/SyllabusPage';
import { TopicDetailPage } from './pages/TopicDetailPage';
import { VideoTrackerPage } from './pages/VideoTrackerPage';
import { BulkSetupPage } from './pages/BulkSetupPage';
import { StudyPlannerPage } from './pages/StudyPlannerPage';
import { PracticeTrackerPage } from './pages/PracticeTrackerPage';
import { RevisionCenterPage } from './pages/RevisionCenterPage';
import { MockTestsPage } from './pages/MockTestsPage';
import { NotesFormulaPage } from './pages/NotesFormulaPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { DailyGoalsPage } from './pages/DailyGoalsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090d16]">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Main App Layout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/syllabus" element={<SyllabusPage />} />
            <Route path="/syllabus/:topicId" element={<TopicDetailPage />} />
            <Route path="/videos" element={<VideoTrackerPage />} />
            <Route path="/bulk-setup" element={<BulkSetupPage />} />
            <Route path="/planner" element={<StudyPlannerPage />} />
            <Route path="/practice" element={<PracticeTrackerPage />} />
            <Route path="/revisions" element={<RevisionCenterPage />} />
            <Route path="/mock-tests" element={<MockTestsPage />} />
            <Route path="/notes" element={<NotesFormulaPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/daily-goals" element={<DailyGoalsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
