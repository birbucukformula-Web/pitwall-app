import { fetchApi } from "./apiClient";
import type { NotificationItem } from "../contexts/NotificationContext";

export interface UnreadCountResponse {
  unread_count: number;
}

export const notificationsApi = {
  getNotifications: async (status?: "unread"): Promise<NotificationItem[]> => {
    const url = status === "unread" ? "/notifications/?status=unread" : "/notifications/";
    const data = await fetchApi(url);
    // Gelen veriyi NotificationItem formatına normalize edelim
    return data.map((item: any) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      message: item.message,
      createdAt: item.createdAt || item.created_at,
      isRead: typeof item.isRead === "boolean" ? item.isRead : item.is_read,
      link: item.link || "",
      taskId: item.taskId || item.task_id,
      actor_name: item.actor_name,
    }));
  },

  getUnreadCount: async (): Promise<number> => {
    const data: UnreadCountResponse = await fetchApi("/notifications/unread-count/");
    return data.unread_count || 0;
  },

  markAsRead: async (id: number): Promise<void> => {
    await fetchApi(`/notifications/${id}/read/`, {
      method: "PATCH",
      body: JSON.stringify({ is_read: true }),
    });
  },

  markAllAsRead: async (): Promise<void> => {
    await fetchApi("/notifications/mark-all-read/", {
      method: "POST",
    });
  },
};
