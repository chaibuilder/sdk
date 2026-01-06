import { usePermissions } from "@/core/main";

export const PermissionChecker = ({
  permission,
  permissions,
  children,
  fallback = null,
}: {
  permission?: string;
  permissions?: string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const { hasPermission } = usePermissions();

  if (permission && !hasPermission(permission)) {
    return fallback;
  }

  if (permissions && !permissions.some((p) => hasPermission(p))) {
    return fallback;
  }

  return children;
};

export default PermissionChecker;
