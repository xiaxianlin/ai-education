import { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { unstable_HistoryRouter as HistoryRouter } from "react-router-dom";
import { history, Router } from "./lib/router";
import { LoadingPage } from "./components/business/LoadingSpinner";
import "@ai-education/shared-web/types"; // 导入全局类型
import "./index.css";

import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "./stores/auth-store";
import { ProfileProvider } from "./stores/profile-store";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
    <AuthProvider>
      <ProfileProvider>
        <Suspense fallback={<LoadingPage />}>
          <HistoryRouter history={history as any}>
            <Router />
          </HistoryRouter>
        </Suspense>
      </ProfileProvider>
    </AuthProvider>
  </ThemeProvider>
);
