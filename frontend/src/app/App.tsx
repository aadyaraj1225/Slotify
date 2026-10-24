import * as React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { LandingPage } from "./pages/landing";
import { OverviewPage } from "./pages/overview";
import { ShowcasePage } from "./pages/showcase";
import { GetStartedPage } from "./pages/get-started";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/showcase" element={<ShowcasePage />} />
          <Route path="/get-started" element={<GetStartedPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
};

export default App;
