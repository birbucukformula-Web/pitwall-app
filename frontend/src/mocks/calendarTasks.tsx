
import type { Task } from "../types/task";

export function isCalendarMockEnabled(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const params = new URLSearchParams(
    window.location.search
  );

  return params.get("calendarMock") === "1";
}

function dayOffset(offset: number): string {
  const date = new Date();

  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const mockProject = {
  id: -1,
  name: "Pitwall Demo",
};

const mockUnit = {
  id: -1,
  name: "Yazılım",
};

function createMockTask(
  id: number,
  title: string,
  startOffset: number,
  endOffset: number,
  status: Task["status"]
): Task {
  return {
    id,
    title,
    description:
      "Proje takvimi şerit görünümü için örnek görev.",
    status,
    priority: "medium",
    start_date: dayOffset(startOffset),
    due_date: dayOffset(endOffset),
    project: mockProject,
    unit: mockUnit,
    assignees: [],
  } as unknown as Task;
}

export const calendarMockTasks: Task[] = [
  createMockTask(
    -901,
    "Frontend geliştirme",
    -3,
    4,
    "in_progress"
  ),
  createMockTask(
    -902,
    "API entegrasyonu",
    1,
    9,
    "todo"
  ),
  createMockTask(
    -903,
    "Kod incelemesi",
    0,
    0,
    "review"
  ),
  createMockTask(
    -904,
    "Mobil görünüm testi",
    5,
    7,
    "done"
  ),
  createMockTask(
    -905,
    "Sprint planlaması",
    10,
    15,
    "todo"
  ),
  createMockTask(
    -906,
    "Takvim kontrolü",
    1,
    1,
    "in_progress"
  ),
  createMockTask(
    -907,
    "Backend testleri",
    -5,
    2,
    "review"
  ),
  createMockTask(
    -908,
    "Veritabanı optimizasyonu",
    3,
    12,
    "in_progress"
  ),
  createMockTask(
    -909,
    "UI iyileştirmeleri",
    8,
    16,
    "todo"
  ),
  createMockTask(
    -910,
    "Sürüm hazırlığı",
    14,
    20,
    "done"
  ),
];
