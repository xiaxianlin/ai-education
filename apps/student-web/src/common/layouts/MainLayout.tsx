import { ProfileModel, useProfileModel } from "@/common/models/ProfileModel";
import { Header, LoadingPage } from "@/components/biz";
import { Outlet } from "react-router-dom";

const MainContainer = () => {
  const { loading } = useProfileModel();

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="flex min-h-screen bg-background bg-pattern">
      <Header />
      <main className="flex-1 min-w-0 pb-12 overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-8">
          <Outlet />
        </div>
      </main>
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
