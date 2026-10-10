import type {
  UserResponse,
  UserRole,
} from "../api/auth";

export type AppPermissions = {
  role: UserRole | null;

  canCreateTask: boolean;
  canEditTask: boolean;
  canDeleteTask: boolean;

  canChangeTaskStatus: boolean;
  canComment: boolean;

  canManageMembers: boolean;

  canAccessUnit: (unitId: number) => boolean;
};

export function getPermissions(
  user: UserResponse | null
): AppPermissions {
  const role = user?.role ?? null;

  const isCaptain =
    role === "captain";

  const isLead =
    role === "lead";

  const isMember =
    role === "member";

  const accessibleUnitIds =
    user?.accessible_unit_ids ?? [];

  return {
    role,

    canCreateTask:
      isCaptain || isLead,

    canEditTask:
      isCaptain || isLead,

    canDeleteTask:
      isCaptain || isLead,

    canChangeTaskStatus:
      isCaptain ||
      isLead ||
      isMember,

    canComment:
      isCaptain ||
      isLead ||
      isMember,

    canManageMembers:
      isCaptain,

    canAccessUnit: (
      unitId: number
    ) => {
      if (isCaptain) {
        return true;
      }

      return accessibleUnitIds.includes(
        unitId
      );
    },
  };
}