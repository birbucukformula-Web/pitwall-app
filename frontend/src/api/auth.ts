import { fetchApi } from "./apiClient";

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface UserResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  organization: {
    id: number;
    name: string;
  };
}

export const authApi = {
  login: (credentials: Record<string, string>) => {
    return fetchApi("/auth/login/", {
      method: "POST",
      body: JSON.stringify(credentials),
      requireAuth: false, // Login için token'a ihtiyaç yok
    }) as Promise<LoginResponse>;
  },

  getMe: () => {
    return fetchApi("/auth/me/", {
      method: "GET",
      requireAuth: true,
    }) as Promise<UserResponse>;
  },
};
