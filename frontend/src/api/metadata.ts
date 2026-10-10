import { fetchApi } from "./apiClient";
import type { Project, Unit } from "../types/task";

export interface Member {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
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
