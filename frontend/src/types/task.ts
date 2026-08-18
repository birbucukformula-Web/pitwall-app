export type TaskStatus =
  | "todo"
  | "progress"
  | "review"
  | "done";

export type TaskPriority =
  | "low"
  | "medium"
  | "high";

export type Assignee = {
  id: number;
  name: string;
  initials: string;
};

export type Task = {
  id: number;
  title: string;
  description: string;

  project: string;
  department: string;

  status: TaskStatus;
  priority: TaskPriority;

  startDate?: string;
  dueDate: string;

  assignees: Assignee[];
};