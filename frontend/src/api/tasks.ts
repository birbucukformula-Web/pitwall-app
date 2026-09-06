import { fetchApi } from "./apiClient";
import type { Task } from "../types/task";

export interface TaskListParams {
  status?: string;
  unit?: number;
  project?: number;
  assignee?: number;
  overdue?: boolean;
}

export const tasksApi = {
  getTasks: async (params?: TaskListParams): Promise<Task[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.status) searchParams.append("status", params.status);
      if (params.unit) searchParams.append("unit", params.unit.toString());
      if (params.project) searchParams.append("project", params.project.toString());
      if (params.assignee) searchParams.append("assignee", params.assignee.toString());
      if (params.overdue) searchParams.append("overdue", "true");
    }
    
    const query = searchParams.toString();
    const endpoint = query ? `/tasks/?${query}` : "/tasks/";
    
    return fetchApi(endpoint);
  },
  
  // İleride kullanılacak (Adım 12 ve 13)
  createTask: async (taskData: Partial<Task>): Promise<Task> => {
    return fetchApi("/tasks/", {
      method: "POST",
      body: JSON.stringify(taskData),
    });
  },
  
  updateTask: async (taskId: number, updates: Partial<Task>): Promise<Task> => {
    return fetchApi(`/tasks/${taskId}/`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },
  
  deleteTask: async (taskId: number): Promise<void> => {
    return fetchApi(`/tasks/${taskId}/`, {
      method: "DELETE",
    });
  },

  getActivities: async (taskId: number): Promise<any[]> => {
    return fetchApi(`/tasks/${taskId}/activities/`);
  },

  createActivity: async (taskId: number, content: string): Promise<any> => {
    return fetchApi(`/tasks/${taskId}/activities/`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },
};
