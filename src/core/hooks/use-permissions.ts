import { useBuilderProp } from "@/core/hooks/use-builder-prop";
import { useCallback } from "react";

export const usePermissions = () => {
  const permissions = useBuilderProp("permissions", undefined);
  const hasPermission = useCallback(
    (permission: string) => {
      if (!permissions) return true;
      return permissions.includes(permission);
    },
    [permissions],
  );

  return { hasPermission };
};
