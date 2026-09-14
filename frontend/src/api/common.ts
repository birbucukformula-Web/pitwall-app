import { fetchApi } from "./apiClient";
import type { Project, Unit } from "../types/task";

export const projectsApi = {
  getProjects: async (): Promise<Project[]> => {
    return fetchApi("/projects/");
  },
};

export const unitsApi = {
  getUnits: async (): Promise<Unit[]> => {
    return fetchApi("/units/");
  },
};
