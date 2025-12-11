import { useCallback, useMemo, useState } from "react";
import { createContainer } from "unstated-next";
import { studentApi } from "@/lib/api";

interface AuthStoreValue {
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
  check: () => Promise<string>;
}

function useAuthStoreInternal(): AuthStoreValue {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => localStorage.getItem("_t") !== null);

  const setToken = useCallback((token: string) => {
    localStorage.setItem("_t", token);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("_t");
    setIsAuthenticated(false);
  }, []);

  const value = useMemo<AuthStoreValue>(
    () => ({
      isAuthenticated,
      setToken,
      logout,
      check: () => studentApi.check(),
    }),
    [isAuthenticated, logout, setToken]
  );

  return value;
}

const AuthStore = createContainer(useAuthStoreInternal);

type UseAuthStore = {
  (): AuthStoreValue;
};

export const AuthProvider = AuthStore.Provider;
export const useAuthStore: UseAuthStore = () => AuthStore.useContainer();
