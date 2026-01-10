import { useQuery } from "@tanstack/react-query";
import client from "../api/client";

export const useUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data } = await client.get("/check");
      return data;
    },
    enabled: false, // Only fetch when needed or authenticated
  });
};
