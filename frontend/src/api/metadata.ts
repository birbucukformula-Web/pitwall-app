import { fetchApi } from "./apiClient";
import type { Project, Unit } from "../types/task";

export interface Member {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  unit_id?: number | null;
  unit_name?: string | null;
  is_active?: boolean;
  date_joined?: string;
}

export interface CreateUnitPayload {
  name: string;
  code?: string;
  color?: string;
  parent?: number | null;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  color?: string;
}

export const metadataApi = {
  // Projeler
  getProjects: async (includeArchived: boolean = false): Promise<Project[]> => {
    const url = includeArchived ? "/projects/?include_archived=true" : "/projects/";
    return fetchApi(url);
  },
  createProject: async (data: CreateProjectPayload): Promise<Project> => {
    return fetchApi("/projects/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  updateProject: async (id: number, data: Partial<CreateProjectPayload & { is_archived: boolean }>): Promise<Project> => {
    return fetchApi(`/projects/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  deleteProject: async (id: number): Promise<void> => {
    return fetchApi(`/projects/${id}/`, {
      method: "DELETE",
    });
  },

  // Birimler
  getUnits: async (): Promise<Unit[]> => {
    return fetchApi("/units/");
  },
  createUnit: async (data: CreateUnitPayload): Promise<Unit> => {
    return fetchApi("/units/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  updateUnit: async (id: number, data: Partial<CreateUnitPayload>): Promise<Unit> => {
    return fetchApi(`/units/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  deleteUnit: async (id: number): Promise<void> => {
    return fetchApi(`/units/${id}/`, {
      method: "DELETE",
    });
  },

  // Üyeler
  getMembers: async (status?: "pending" | "all"): Promise<Member[]> => {
    const url = status ? `/members/?status=${status}` : "/members/";
    return fetchApi(url);
  },
  updateMember: async (
    id: number,
    data: { role?: string; unit_id?: number | null; is_active?: boolean; first_name?: string; last_name?: string }
  ): Promise<Member> => {
    return fetchApi(`/members/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  deleteMember: async (id: number): Promise<void> => {
    return fetchApi(`/members/${id}/`, {
      method: "DELETE",
    });
  },
};
