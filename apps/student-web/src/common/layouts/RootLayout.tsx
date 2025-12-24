import { AuthModel } from "@/common/models/AuthModel";
import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";

export const RootLayout = () => {
  return (
    <AuthModel.Provider>
      <Toaster richColors position="top-center" />
      <Outlet />
    </AuthModel.Provider>
  );
};
