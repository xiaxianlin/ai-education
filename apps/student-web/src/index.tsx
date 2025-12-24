import { history } from "@ai-education/shared-web";
import { createRoot } from "react-dom/client";
import { unstable_HistoryRouter as HistoryRouter } from "react-router-dom";
import { Router } from "./common/router";
import "./index.css";

import { ThemeProvider } from "./components/theme-provider";

createRoot(document.getElementById("root") as HTMLElement).render(
  <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
    <HistoryRouter history={history as any}>
      <Router />
    </HistoryRouter>
  </ThemeProvider>
);
