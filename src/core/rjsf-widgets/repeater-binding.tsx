import { WidgetProps } from "@rjsf/utils";
import { Database, File, X } from "lucide-react";
import { Button } from "@/ui/shadcn/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/shadcn/components/ui/tooltip";
import { COLLECTION_PREFIX } from "@/core/constants/STRINGS";

export const RepeaterBindingWidget = ({ value, onChange }: WidgetProps) => {
  if (!value) {
    return (
      <div className="mt-1 flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs text-gray-500 text-gray-600">
        <File className="h-4 w-4" /> Choose a collection
      </div>
    );
  }

  const prefixWithBracket = `{{${COLLECTION_PREFIX}`;
  const isCollection = value?.startsWith(prefixWithBracket);
  let displayValue = value;
  if (isCollection) {
    displayValue = value?.replace(prefixWithBracket, "")?.replace("}}", "");
  }

  return (
    <div className="mt-1 flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-600">
        <span className="flex items-center gap-2 truncate">
          {" "}
          {isCollection ? <Database className="h-4 w-4" /> : null}
          {displayValue}
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 rounded-full bg-gray-200 text-gray-900 hover:bg-gray-300"
              onClick={() => onChange("")}>
              <X className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Remove binding</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};
