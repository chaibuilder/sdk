import { Label, Switch } from "../../../../ui";
import { useAtom } from "jotai";
import { aiAssistantActiveAtom } from "../../../atoms/ui.ts";
import { SparklesIcon } from "lucide-react";

export const AiAssistant = () => {
  const [active, setAiAssistantActive] = useAtom(aiAssistantActiveAtom);
  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="ai-assistant" className="flex items-center gap-x-1 text-sm text-yellow-600">
        <SparklesIcon className="w-4" />
        {"AI Assistant"}
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
