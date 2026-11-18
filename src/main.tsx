import "@/styles/global.css";

import type { ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
// @ts-ignore
import { isLoggedIn } from "@/api";

import HomePage from "@/pages/guest/home/index";
import StudentsPage from "@/pages/guest/students/index";
import LoginPage from "@/pages/auth/login";

function Protected({ children }: { children: ReactElement }) {
  return isLoggedIn() ? children : <Navigate to="/" replace />;
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<Protected><HomePage /></Protected>} />
        <Route path="/students" element={<Protected><StudentsPage /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  </BrowserRouter>
);