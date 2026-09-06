import { fetchApi } from "./apiClient";

export interface TaskSummaryStats {
  todo: number;
  in_progress: number;
  review: number;
  done: number;
  overdue: number;
  total: number;
}

export const statsApi = {
  getSummary: async (): Promise<TaskSummaryStats> => {
    return fetchApi("/stats/summary/");
  },
};
