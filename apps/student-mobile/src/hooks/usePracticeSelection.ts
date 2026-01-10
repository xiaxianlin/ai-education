import { useQuery } from "@tanstack/react-query";
import { studentApi } from "../api/client";
import { useAuthStore } from "../stores/useAuthStore";

export function usePracticeSelection() {
  const { user } = useAuthStore();

  const abilitiesQuery = useQuery({
    queryKey: ["abilities", user?.subject, user?.grade],
    queryFn: () => studentApi.getAbilityAtomics(user?.subject || "English", user?.grade || 1),
    enabled: !!user,
  });

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => studentApi.getProfile(),
    enabled: !!user,
  });

  // Example: if profile contains textbook_id
  const textbookId = profileQuery.data?.settings?.textbook_id;

  const unitsQuery = useQuery({
    queryKey: ["units", textbookId],
    queryFn: () => studentApi.getTextbookUnits(textbookId),
    enabled: !!textbookId,
  });

  return {
    abilities: abilitiesQuery.data || [],
    units: unitsQuery.data || [],
    isLoading: abilitiesQuery.isLoading || unitsQuery.isLoading || profileQuery.isLoading,
    user,
  };
}
