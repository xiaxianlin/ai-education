import { history } from "@ai-education/shared-web";
import { createRoot } from "react-dom/client";
import { unstable_HistoryRouter as HistoryRouter } from "react-router-dom";
import "./index.css";
import { Router } from "./lib/router";

createRoot(document.getElementById("root") as HTMLElement).render(
  <HistoryRouter history={history as any}>
    <Router />
  </HistoryRouter>
);
