import { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { unstable_HistoryRouter as HistoryRouter } from "react-router-dom";
import { history, Router } from "./lib/router";
import { LoadingPage } from "./components/business/LoadingSpinner";
import "./index.css";

import { ThemeProvider } from "./components/theme-provider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
    <Suspense fallback={<LoadingPage />}>
      <HistoryRouter history={history as any} >
        <Router />
      </HistoryRouter>
    </Suspense>
  </ThemeProvider>
);
