import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthModel } from "@/models/AuthModel";

export const RootLayout = () => {
  return (
    <AuthModel.Provider>
      <Toaster richColors position="top-center" />
      <Outlet />
    </AuthModel.Provider>
  );
};
