import { ProfileModel, useProfileModel } from "@/common/models/ProfileModel";
import { Header, LoadingPage, SettingsDialog } from "@/components/biz";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

const MainContainer = () => {
  const { loading, activeTextbook } = useProfileModel();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // 检查是否需要设置
  useEffect(() => {
    if (!loading && !activeTextbook) {
      setSettingsOpen(true);
    }
  }, [loading, activeTextbook]);

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
      <SettingsDialog required open={settingsOpen} onOpenChange={setSettingsOpen} />
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
