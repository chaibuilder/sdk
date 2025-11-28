import { useStructureValidation } from "@/core/hooks/use-structure-validation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/ui";
import { ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons";

export const PageValidation = () => {
  const { hasErrors, hasWarnings, errorCount, warningCount, errors } = useStructureValidation();

  if (!hasErrors && !hasWarnings) {
    return null;
  }

  const getSeverityColor = () => {
    if (hasErrors) return "text-red-500";
    if (hasWarnings) return "text-orange-500";
    return "text-gray-500";
  };

  const getIcon = () => {
    if (hasErrors) return <ExclamationTriangleIcon className="h-4 w-4" />;
    if (hasWarnings) return <InfoCircledIcon className="h-4 w-4" />;
    return null;
  };

  const getMessage = () => {
    if (hasErrors && hasWarnings) {
      return `${errorCount} error${errorCount > 1 ? "s" : ""}, ${warningCount} warning${warningCount > 1 ? "s" : ""}`;
    }
    if (hasErrors) {
      return `${errorCount} error${errorCount > 1 ? "s" : ""}`;
    }
    if (hasWarnings) {
      return `${warningCount} warning${warningCount > 1 ? "s" : ""}`;
    }
    return "";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className={`flex cursor-pointer items-center gap-2 ${getSeverityColor()}`}>
          {getIcon()}
          <span className="text-xs font-medium">{getMessage()}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" className="max-w-xs" align="end">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Structure Validation Issues</h4>

          {errors.length === 0 ? (
            <p className="text-xs">No validation issues found.</p>
          ) : (
            <div className="space-y-1">
              {errors.slice(0, 5).map((error) => (
                <div
                  key={error.id}
                  className={`rounded p-2 text-xs ${
                    error.severity === "error"
                      ? "border border-red-200 bg-red-50 text-red-700"
                      : "border border-orange-200 bg-orange-50 text-orange-700"
                  }`}>
                  <div className="font-medium">{error.severity === "error" ? "Error:" : "Warning:"}</div>
                  <div>{error.message}</div>
                </div>
              ))}

              {errors.length > 5 && (
                <p className="text-xs italic text-gray-500">... and {errors.length - 5} more issues</p>
              )}
            </div>
          )}

          <div className="border-t pt-2 text-xs text-gray-500">
            Check the outline panel for detailed error locations
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
