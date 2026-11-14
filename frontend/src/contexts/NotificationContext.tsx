import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "../api/notifications";

export type NotificationType =
  | "task_assigned"
  | "comment"
  | "due_date"
  | "task_updated"
  | "announcement";

export type NotificationItem = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  link: string;
  taskId?: number;
  actor_name?: string | null;
};

type NotificationContextValue = {
  notifications: NotificationItem[];
  unreadNotifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: number) => void;
  markManyAsRead: (ids: number[]) => void;
  markAllAsRead: () => void;
  refetch: () => void;
};

const NotificationContext =
  createContext<NotificationContextValue | null>(null);

export function NotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const queryClient = useQueryClient();
  const hasAuth = !!localStorage.getItem("access");

  const {
    data: notifications = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.getNotifications(),
    enabled: hasAuth,
    refetchInterval: 30000, // 30 saniyede bir arka planda kontrol et
    refetchOnWindowFocus: true,
  });

  const unreadNotifications = useMemo(
    () => notifications.filter((item) => !item.isRead),
    [notifications],
  );

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markAsRead(id),
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previous = queryClient.getQueryData<NotificationItem[]>(["notifications"]);
      if (previous) {
        queryClient.setQueryData<NotificationItem[]>(
          ["notifications"],
          previous.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["notifications"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previous = queryClient.getQueryData<NotificationItem[]>(["notifications"]);
      if (previous) {
        queryClient.setQueryData<NotificationItem[]>(
          ["notifications"],
          previous.map((n) => ({ ...n, isRead: true }))
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["notifications"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  function markAsRead(id: number) {
    markAsReadMutation.mutate(id);
  }

  async function markManyAsRead(ids: number[]) {
    if (!ids || ids.length === 0) return;
    queryClient.setQueryData<NotificationItem[]>(["notifications"], (old) => {
      if (!old) return [];
      return old.map((n) => (ids.includes(n.id) ? { ...n, isRead: true } : n));
    });
    await Promise.allSettled(ids.map((id) => notificationsApi.markAsRead(id)));
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }

  function markAllAsRead() {
    markAllAsReadMutation.mutate();
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadNotifications,
        unreadCount: unreadNotifications.length,
        isLoading,
        markAsRead,
        markManyAsRead,
        markAllAsRead,
        refetch,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider",
    );
  }

  return context;
}

