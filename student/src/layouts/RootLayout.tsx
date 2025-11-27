import { Outlet } from "@tanstack/react-router";
import { Toaster } from "sonner";

export const RootLayout = () => {
  return (
    <>
      <Toaster richColors position="top-center" />
      <Outlet />
    </>
  );
};
