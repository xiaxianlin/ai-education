import { useEffect, useState } from "react";
import { http } from "@/services/api";

export const useDeviceList = () => {
  const [data, setData] = useState<Device[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const query = async () => {
    setError(false);
    setLoading(true);
    try {
      const res = await http.get<Device[]>("/device/all");
      if (res?.ok) {
        setData(res.data || []);
      } else {
        setData([]);
        setError(true);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    query();
  }, []);

  return { data, error, loading };
};
