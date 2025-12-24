import { apiClient, studentApi } from "@/lib/api";
import { useRequest } from "ahooks";
import { useLocation, useNavigate } from "react-router-dom";
import { createContainer } from "unstated-next";

const useContainer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useRequest(() => studentApi.check(), {
    onSuccess: () => {
      // 如果当前是登录页就调整到 /home
      if (location.pathname === "/login") {
        navigate("/home", { replace: true });
      }
    },
  });

  const setToken = (token: string) => {
    apiClient.setToken(token);
  };

  const logout = () => {
    apiClient.removeToken();
    navigate("/login");
  };

  return { setToken, logout };
};

export const AuthModel = createContainer(useContainer);
export const useAuthModel = AuthModel.useContainer;
