import type { Task } from "../types/task";

export const mockTasks: Task[] = [
  {
    id: 1,
    title: "Telemetri dashboard arayüzü",
    description:
      "Telemetri ekranının ana dashboard arayüzü hazırlanacak ve responsive görünüm kontrol edilecek.",
    project: "Pitwall App",
    department: "Web & Yazılım",
    status: "todo",
    priority: "high",
    startDate: "2026-08-18",
    dueDate: "2026-08-20",
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
    title: "Sponsor dosyalarının düzenlenmesi",
    description:
      "Sponsor sunumunda kullanılacak dokümanlar güncellenecek.",
    project: "Sponsorluk",
    department: "Sponsorluk",
    status: "todo",
    priority: "medium",
    dueDate: "2026-08-22",
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
    title: "Araç veri API bağlantısı",
    description:
      "Telemetri verilerinin frontend tarafına aktarılması için API bağlantıları hazırlanacak.",
    project: "Pitwall App",
    department: "Web & Yazılım",
    status: "progress",
    priority: "high",
    dueDate: "2026-08-18",
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
    title: "Elektrik sistemi dokümantasyonu",
    description:
      "Elektrik sistemine ait teknik dökümanlar hazırlanacak.",
    project: "Araç Geliştirme",
    department: "Elektronik",
    status: "progress",
    priority: "medium",
    dueDate: "2026-08-24",
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
    title: "Görev takip ekranı tasarımı",
    description:
      "Görev panosunun temel kullanıcı arayüzü ve task kartları tamamlanacak.",
    project: "Pitwall App",
    department: "Web & Yazılım",
    status: "review",
    priority: "medium",
    dueDate: "2026-08-19",
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
    title: "Parça maliyet tablosu",
    description:
      "Araç parçalarının mevcut maliyetleri kontrol edilecek.",
    project: "Araç Geliştirme",
    department: "Finans",
    status: "done",
    priority: "low",
    dueDate: "2026-08-17",
    assignees: [
      {
        id: 6,
        name: "Naz",
        initials: "NK",
      },
    ],
  },
];