import * as React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { CoordinatorProvider } from "@/context/coordinator-context";
import { CandidateProvider } from "@/context/candidate-context";
import { AuthProvider } from "@/context/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { CandidateLayout } from "@/components/candidate/candidate-layout";
import { InterviewerLayout } from "@/components/interviewer/interviewer-layout";

// Public Pages
import { LandingPage } from "./pages/landing";
import { OverviewPage } from "./pages/overview";
import { ShowcasePage } from "./pages/showcase";
import { GetStartedPage } from "./pages/get-started";
import { LoginPage } from "./pages/auth/login";
import { SignUpPage } from "./pages/auth/signup";

// Coordinator Dashboard Pages
import { CoordinatorOverviewPage } from "./pages/coordinator/overview";
import { DrivesPage } from "./pages/coordinator/drives";
import { CandidatesPage } from "./pages/coordinator/candidates";
import { InterviewersPage } from "./pages/coordinator/interviewers";
import { RoomsPage } from "./pages/coordinator/rooms";
import { SchedulePage } from "./pages/coordinator/schedule";
import { EvaluationsPage } from "./pages/coordinator/evaluations";
import { SettingsPage } from "./pages/coordinator/settings";

// Candidate Dashboard Pages
import { CandidateOverviewPage } from "./pages/candidate/overview";
import { CandidateInterviewsPage } from "./pages/candidate/interviews";
import { CandidateAvailableSlotsPage } from "./pages/candidate/available-slots";
import { CandidateNotificationsPage } from "./pages/candidate/notifications";

// Interviewer Dashboard Pages
import { InterviewerOverviewPage } from "./pages/interviewer/overview";
import { InterviewerSchedulePage } from "./pages/interviewer/schedule";
import { InterviewerInterviewsPage } from "./pages/interviewer/interviews";
import { InterviewerAvailabilityPage } from "./pages/interviewer/availability";
import { InterviewerEvaluationsPage } from "./pages/interviewer/evaluations";

const PublicWrapper: React.FC = () => (
  <AppLayout>
    <Outlet />
  </AppLayout>
);

const CoordinatorWrapper: React.FC = () => (
  <ProtectedRoute allowedRole="coordinator">
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  </ProtectedRoute>
);

const CandidateWrapper: React.FC = () => (
  <ProtectedRoute allowedRole="candidate">
    <CandidateProvider>
      <CandidateLayout>
        <Outlet />
      </CandidateLayout>
    </CandidateProvider>
  </ProtectedRoute>
);

const InterviewerWrapper: React.FC = () => (
  <ProtectedRoute allowedRole="interviewer">
    <InterviewerLayout>
      <Outlet />
    </InterviewerLayout>
  </ProtectedRoute>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CoordinatorProvider>
          <Routes>
            {/* Public Website Routes */}
            <Route element={<PublicWrapper />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/overview" element={<OverviewPage />} />
              <Route path="/showcase" element={<ShowcasePage />} />
              <Route path="/get-started" element={<GetStartedPage />} />
            </Route>

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            {/* Coordinator Dashboard Routes (Protected) */}
            <Route path="/coordinator" element={<CoordinatorWrapper />}>
              <Route index element={<Navigate to="/coordinator/overview" replace />} />
              <Route path="overview" element={<CoordinatorOverviewPage />} />
              <Route path="drives" element={<DrivesPage />} />
              <Route path="candidates" element={<CandidatesPage />} />
              <Route path="interviewers" element={<InterviewersPage />} />
              <Route path="rooms" element={<RoomsPage />} />
              <Route path="schedule" element={<SchedulePage />} />
              <Route path="evaluations" element={<EvaluationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Candidate Dashboard Routes (Protected) */}
            <Route path="/candidate" element={<CandidateWrapper />}>
              <Route index element={<Navigate to="/candidate/overview" replace />} />
              <Route path="overview" element={<CandidateOverviewPage />} />
              <Route path="interviews" element={<CandidateInterviewsPage />} />
              <Route path="available-slots" element={<CandidateAvailableSlotsPage />} />
              <Route path="notifications" element={<CandidateNotificationsPage />} />
            </Route>

            {/* Interviewer Dashboard Routes (Protected) */}
            <Route path="/interviewer" element={<InterviewerWrapper />}>
              <Route index element={<Navigate to="/interviewer/overview" replace />} />
              <Route path="overview" element={<InterviewerOverviewPage />} />
              <Route path="schedule" element={<InterviewerSchedulePage />} />
              <Route path="interviews" element={<InterviewerInterviewsPage />} />
              <Route path="availability" element={<InterviewerAvailabilityPage />} />
              <Route path="evaluations" element={<InterviewerEvaluationsPage />} />
            </Route>

            {/* Wildcard Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CoordinatorProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
