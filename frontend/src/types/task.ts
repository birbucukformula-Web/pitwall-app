export type TaskStatus =
  | "todo"
  | "in_progress"
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

export type Unit = {
  id: number;
  name: string;
  code?: string;
  color?: string;

  parent?: number | null;
  parent_name?: string | null;
  task_count?: number;
  member_count?: number;
  description?: string;
};

export type Project = {
  id: number;
  name: string;
  description?: string;
  color?: string;
  is_archived?: boolean;
};

export type Task = {
  id: number;

  title: string;
  description: string;

  status: TaskStatus;
  priority: TaskPriority;

  unit: Unit | null;
  project: Project | null;

  assignees: Assignee[];

  start_date?: string | null;
  due_date: string;

  order: number;
};