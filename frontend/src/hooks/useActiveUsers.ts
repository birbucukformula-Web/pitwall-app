import { useQuery } from "@tanstack/react-query";
import { presenceApi } from "../api/presence";
import { useAuth } from "../contexts/AuthContext";

export function useActiveUsers() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["presence", "activeUsers"],
    queryFn: () => presenceApi.ping(),
    enabled: isAuthenticated,
    refetchInterval: 35000,
    refetchIntervalInBackground: false,
    staleTime: 30000,
    retry: 1,
  });
}
