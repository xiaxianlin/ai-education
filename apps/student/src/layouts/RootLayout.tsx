import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";

export const RootLayout = () => {
  return (
    <>
      <Toaster richColors position="top-center" />
      <Outlet />
    </>
  );
};
