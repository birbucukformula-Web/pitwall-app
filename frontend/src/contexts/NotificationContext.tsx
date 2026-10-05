import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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
};

const initialNotifications: NotificationItem[] = [];

type NotificationContextValue = {
  notifications: NotificationItem[];
  unreadNotifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: number) => void;
  markManyAsRead: (ids: number[]) => void;
  markAllAsRead: () => void;
};

const NotificationContext =
  createContext<NotificationContextValue | null>(null);

export function NotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);

  const unreadNotifications = useMemo(
    () => notifications.filter((item) => !item.isRead),
    [notifications],
  );

  function markAsRead(id: number) {
    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, isRead: true } : item,
      ),
    );
  }

  function markManyAsRead(ids: number[]) {
    setNotifications((current) =>
      current.map((item) =>
        ids.includes(item.id)
          ? { ...item, isRead: true }
          : item,
      ),
    );
  }

  function markAllAsRead() {
    setNotifications((current) =>
      current.map((item) => ({ ...item, isRead: true })),
    );
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadNotifications,
        unreadCount: unreadNotifications.length,
        markAsRead,
        markManyAsRead,
        markAllAsRead,
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
