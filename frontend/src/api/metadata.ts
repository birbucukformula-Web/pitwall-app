import { fetchApi } from "./apiClient";

export interface Project {
  id: number;
  name: string;
  description?: string;
  color?: string;
}

export interface Unit {
  id: number;
  name: string;
  code?: string;
  color?: string;
}

export interface Member {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

export const metadataApi = {
  getProjects: async (): Promise<Project[]> => {
    return fetchApi("/projects/");
  },
  getUnits: async (): Promise<Unit[]> => {
    return fetchApi("/units/");
  },
  getMembers: async (): Promise<Member[]> => {
    return fetchApi("/members/");
  },
};
