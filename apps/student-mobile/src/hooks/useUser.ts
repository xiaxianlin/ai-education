import { useQuery } from "@tanstack/react-query";
import client from "../api/client";

export const useUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      return await client.get("/check");
    },
    enabled: false, // Only fetch when needed or authenticated
  });
};
