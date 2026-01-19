import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AiIcon } from "@/core/components/ai/ai-icon";
import { useAiAssistant } from "@/core/hooks/use-ask-ai";
import { useBuilderProp } from "@/core/hooks/use-builder-prop";
import { usePermissions } from "@/core/hooks/use-permissions";
import { useRightPanel } from "@/core/hooks/use-theme";
import { PERMISSIONS } from "@/core/main";
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
        <AiIcon className="h-4 w-4" />
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
