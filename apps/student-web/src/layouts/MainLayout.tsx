import { Header } from "@/components/business/Header";
import { Outlet } from "react-router-dom";
import { LoadingPage } from "@/components/business/LoadingSpinner";
import { useGradeTheme } from "@/hooks/useGradeTheme";
import { ProfileModel, useProfileModel } from "@/models/ProfileModel";

const MainContainer = () => {
  const { student, loading } = useProfileModel();
  useGradeTheme(student?.grade);

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
