import { useCallback } from "react";
import { useBuilderProp } from "./useBuilderProp";

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
