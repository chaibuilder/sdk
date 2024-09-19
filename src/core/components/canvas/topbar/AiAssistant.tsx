import { Label, Switch } from "../../../../ui";
import { useAtom } from "jotai";
import { aiAssistantActiveAtom } from "../../../atoms/ui.ts";
import { SparklesIcon } from "lucide-react";
import { useBuilderProp } from "../../../hooks";
import { useTranslation } from "react-i18next";

export const AiAssistant = () => {
  const [active, setAiAssistantActive] = useAtom(aiAssistantActiveAtom);
  const askAiCallBack = useBuilderProp("askAiCallBack", null);
  const { t } = useTranslation();
  if (!askAiCallBack) return null;
  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="ai-assistant" className="flex items-center gap-x-1 text-sm text-yellow-600">
        <SparklesIcon className="w-4" />
        {t("ai_assistant")}
      </Label>
      <Switch
        className={"scale-90"}
        checked={active}
        onCheckedChange={(state) => {
          setAiAssistantActive(state);
        }}
        id="ai-assitantt"
      />
    </div>
  );
};
