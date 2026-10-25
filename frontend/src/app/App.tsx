import * as React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { CoordinatorProvider } from "@/context/coordinator-context";
import { CandidateProvider } from "@/context/candidate-context";
import { CandidateLayout } from "@/components/candidate/candidate-layout";

// Public Pages
import { LandingPage } from "./pages/landing";
import { OverviewPage } from "./pages/overview";
import { ShowcasePage } from "./pages/showcase";
import { GetStartedPage } from "./pages/get-started";

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

const PublicWrapper: React.FC = () => (
  <AppLayout>
    <Outlet />
  </AppLayout>
);

const CoordinatorWrapper: React.FC = () => (
  <CoordinatorProvider>
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  </CoordinatorProvider>
);

const CandidateWrapper: React.FC = () => (
  <CoordinatorProvider>
    <CandidateProvider>
      <CandidateLayout>
        <Outlet />
      </CandidateLayout>
    </CandidateProvider>
  </CoordinatorProvider>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Website Routes */}
        <Route element={<PublicWrapper />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/showcase" element={<ShowcasePage />} />
          <Route path="/get-started" element={<GetStartedPage />} />
        </Route>

        {/* Coordinator Dashboard Routes */}
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

        {/* Candidate Dashboard Routes */}
        <Route path="/candidate" element={<CandidateWrapper />}>
          <Route index element={<Navigate to="/candidate/overview" replace />} />
          <Route path="overview" element={<CandidateOverviewPage />} />
          <Route path="interviews" element={<CandidateInterviewsPage />} />
          <Route path="available-slots" element={<CandidateAvailableSlotsPage />} />
          <Route path="notifications" element={<CandidateNotificationsPage />} />
        </Route>

        {/* Wildcard Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
