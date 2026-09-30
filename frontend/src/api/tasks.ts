import { fetchApi } from "./apiClient";
import type { Task, TaskStatus, TaskPriority } from "../types/task";

export interface TaskListParams {
  status?: string;
  unit?: number;
  project?: number;
  assignee?: number;
  overdue?: boolean;
}

/** API'ye gönderilecek payload tipi: project/unit/assignees ID olarak gönderilir */
export interface TaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  project?: number | null;
  unit?: number | null;
  assignees?: number[];
  due_date?: string;
  order?: number;
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
  
  createTask: async (taskData: TaskPayload): Promise<Task> => {
    return fetchApi("/tasks/", {
      method: "POST",
      body: JSON.stringify(taskData),
    });
  },
  
  updateTask: async (taskId: number, updates: TaskPayload): Promise<Task> => {
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
