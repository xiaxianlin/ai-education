import { Header, LoadingPage } from "@/components/biz";
import { useGradeTheme } from "@/hooks/useGradeTheme";
import { ProfileModel, useProfileModel } from "@/models/ProfileModel";
import { Outlet } from "react-router-dom";

const MainContainer = () => {
  const { profile, loading } = useProfileModel();
  useGradeTheme(profile?.grade);

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

export const MainLayout = () => {
  return (
    <ProfileModel.Provider>
      <MainContainer />
    </ProfileModel.Provider>
  );
};
