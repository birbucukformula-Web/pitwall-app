import type {
  Project,
  Task,
  Unit,
} from "../types/task";

/*
  Şimdilik fixture/mock veri.

  Backend bağlandığında:
  GET /api/v1/units/
  GET /api/v1/projects/
  GET /api/v1/tasks/

  üzerinden gerçek veriler gelecek.
*/

export const mockUnits: Unit[] = [
  {
    id: 1,
    name: "Web & Yazılım",
    code: "WEB",
  },
  {
    id: 2,
    name: "Elektronik",
    code: "ELEKTRONIK",
  },
  {
    id: 3,
    name: "Sponsorluk",
    code: "SPONSORLUK",
  },
  {
    id: 4,
    name: "Finans",
    code: "FINANS",
  },
];

export const mockProjects: Project[] = [
  {
    id: 1,
    name: "Pitwall App",
  },
  {
    id: 2,
    name: "Sponsorluk",
  },
  {
    id: 3,
    name: "Araç Geliştirme",
  },
];

export const mockTasks: Task[] = [
  {
    id: 1,

    title:
      "Telemetri dashboard arayüzü",

    description:
      "Telemetri ekranının ana dashboard arayüzü hazırlanacak ve responsive görünüm kontrol edilecek.",

    project: mockProjects[0],

    unit: mockUnits[0],

    status: "todo",

    priority: "high",

    start_date: "2026-08-18",

    due_date: "2026-08-20",

    order: 1,

    assignees: [
      {
        id: 1,
        name: "Lidya Su",
        initials: "LS",
      },
      {
        id: 2,
        name: "Mert",
        initials: "MK",
      },
    ],
  },

  {
    id: 2,

    title:
      "Sponsor dosyalarının düzenlenmesi",

    description:
      "Sponsor sunumunda kullanılacak dokümanlar güncellenecek.",

    project: mockProjects[1],

    unit: mockUnits[2],

    status: "todo",

    priority: "medium",

    start_date: null,

    due_date: "2026-08-22",

    order: 2,

    assignees: [
      {
        id: 3,
        name: "Ece",
        initials: "EA",
      },
    ],
  },

  {
    id: 3,

    title:
      "Araç veri API bağlantısı",

    description:
      "Telemetri verilerinin frontend tarafına aktarılması için API bağlantıları hazırlanacak.",

    project: mockProjects[0],

    unit: mockUnits[0],

    status: "in_progress",

    priority: "high",

    start_date: null,

    due_date: "2026-08-18",

    order: 1,

    assignees: [
      {
        id: 4,
        name: "Furkan",
        initials: "FK",
      },
      {
        id: 1,
        name: "Lidya Su",
        initials: "LS",
      },
    ],
  },

  {
    id: 4,

    title:
      "Elektrik sistemi dokümantasyonu",

    description:
      "Elektrik sistemine ait teknik dökümanlar hazırlanacak.",

    project: mockProjects[2],

    unit: mockUnits[1],

    status: "in_progress",

    priority: "medium",

    start_date: null,

    due_date: "2026-08-24",

    order: 2,

    assignees: [
      {
        id: 5,
        name: "Tolga",
        initials: "TA",
      },
    ],
  },

  {
    id: 5,

    title:
      "Görev takip ekranı tasarımı",

    description:
      "Görev panosunun temel kullanıcı arayüzü ve task kartları tamamlanacak.",

    project: mockProjects[0],

    unit: mockUnits[0],

    status: "review",

    priority: "medium",

    start_date: null,

    due_date: "2026-08-19",

    order: 1,

    assignees: [
      {
        id: 1,
        name: "Lidya Su",
        initials: "LS",
      },
    ],
  },

  {
    id: 6,

    title:
      "Parça maliyet tablosu",

    description:
      "Araç parçalarının mevcut maliyetleri kontrol edilecek.",

    project: mockProjects[2],

    unit: mockUnits[3],

    status: "done",

    priority: "low",

    start_date: null,

    due_date: "2026-08-17",

    order: 1,

    assignees: [
      {
        id: 6,
        name: "Naz",
        initials: "NK",
      },
    ],
  },
];