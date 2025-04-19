import { useBuilderProp } from "@/core/hooks";
import { useAiAssistant } from "@/core/hooks/useAskAi";
import { useRightPanel } from "@/core/hooks/useTheme";
import { PERMISSIONS, usePermissions } from "@/core/main";
import { Label } from "@/ui/shadcn/components/ui/label";
import { Switch } from "@/ui/shadcn/components/ui/switch";
import { SparklesIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

export const AiAssistant = () => {
  const setAiAssistantActive = useAiAssistant();
  const [panel] = useRightPanel();
  const askAiCallBack = useBuilderProp("askAiCallBack", null);
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  if (!askAiCallBack || !hasPermission(PERMISSIONS.EDIT_BLOCK)) return null;
  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="ai-assistant" className="flex items-center gap-x-1 text-sm text-yellow-600">
        <SparklesIcon className="w-4" />
        {t("AI Assistant")}
      </Label>
      <Switch
        className={"scale-90"}
        checked={panel === "ai"}
        onCheckedChange={(state) => {
          setAiAssistantActive(state);
        }}
        id="ai-assistant"
      />
    </div>
  );
};
