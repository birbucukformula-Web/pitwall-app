import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export const AVATARS = [
  { id: "red", label: "#7 Kırmızı", src: "/avatars/avatar_red.png" },
  { id: "blue", label: "#3 Mavi", src: "/avatars/avatar_blue.png" },
  { id: "black", label: "#1 Siyah", src: "/avatars/avatar_black.png" },
  { id: "frog", label: "Kurbağa", src: "/avatars/avatar_frog.png" },
  { id: "pink", label: "Pembe Kalp", src: "/avatars/avatar_pink.png" },
  { id: "purple", label: "Mor Şimşek", src: "/avatars/avatar_purple.png" },
  { id: "yellow", label: "Sarı Damalı", src: "/avatars/avatar_yellow.png" },
  { id: "orange", label: "Turuncu Yıldız", src: "/avatars/avatar_orange.png" },
  { id: "white", label: "Beyaz", src: "/avatars/avatar_white.png" },
];

const STORAGE_KEY = "pitwall_avatar";

type Avatar = (typeof AVATARS)[number];

type AvatarContextValue = {
  selectedAvatarId: string;
  selectedAvatar: Avatar | null;
  selectAvatar: (id: string) => void;
};

const AvatarContext =
  createContext<AvatarContextValue | null>(null);

export function AvatarProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [selectedAvatarId, setSelectedAvatarId] =
    useState<string>(
      () => localStorage.getItem(STORAGE_KEY) ?? "",
    );

  const selectedAvatar =
    AVATARS.find(
      (avatar) => avatar.id === selectedAvatarId,
    ) ?? null;

  function selectAvatar(id: string) {
    setSelectedAvatarId(id);
    localStorage.setItem(STORAGE_KEY, id);
  }

  return (
    <AvatarContext.Provider
      value={{
        selectedAvatarId,
        selectedAvatar,
        selectAvatar,
      }}
    >
      {children}
    </AvatarContext.Provider>
  );
}

export function useAvatar() {
  const context = useContext(AvatarContext);

  if (!context) {
    throw new Error(
      "useAvatar must be used inside AvatarProvider",
    );
  }

  return context;
}