import { Header } from "@/components/business/Header";
import { useRequest } from "ahooks";
import { Outlet } from "react-router-dom";
import { profileService } from "@/services/profile";
import { useProfileStore } from "@/stores/profile-store";
import { LoadingPage } from "@/components/business/LoadingSpinner";

export const MainLayout = () => {
  const { setProfile } = useProfileStore();

  const { loading } = useRequest(profileService.getProfile, {
    onSuccess: setProfile,
  });

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Outlet />
      </div>
    </div>
  );
};
