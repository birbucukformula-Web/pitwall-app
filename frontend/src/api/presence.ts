import { fetchApi } from "./apiClient";

export interface ActiveUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

export interface PresenceResponse {
  count: number;
  users: ActiveUser[];
}

export const presenceApi = {
  ping: () => {
    return fetchApi("/presence/ping/", {
      method: "POST",
      requireAuth: true,
    }) as Promise<PresenceResponse>;
  },

  leave: () => {
    return fetchApi("/presence/leave/", {
      method: "POST",
      requireAuth: true,
    }).catch(() => null) as Promise<{ status: string } | null>;
  },
};
