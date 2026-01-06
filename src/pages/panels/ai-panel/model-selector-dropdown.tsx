"use client";

import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/pages/components/ai-elements/model-selector";
import { Button } from "@/ui";
import { Cpu } from "lucide-react";
import { useState } from "react";
import { AI_MODELS, getDefaultModel, getModelById } from "./models";

interface ModelSelectorDropdownProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  disabled?: boolean;
}

export const ModelSelectorDropdown = ({
  selectedModel,
  onModelChange,
  disabled = false,
}: ModelSelectorDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const currentModel = getModelById(selectedModel) || getDefaultModel();

  const filteredModels = AI_MODELS.filter(
    (model) =>
      model.name.toLowerCase().includes(search.toLowerCase()) ||
      model.provider.toLowerCase().includes(search.toLowerCase()),
  );

  const groupedModels = filteredModels.reduce(
    (acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = [];
      }
      acc[model.provider].push(model);
      return acc;
    },
    {} as Record<string, typeof AI_MODELS>,
  );

  const handleModelSelect = (modelId: string) => {
    onModelChange(modelId);
    setOpen(false);
    setSearch("");
  };

  return (
    <ModelSelector open={open} onOpenChange={setOpen}>
      <ModelSelectorTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled} className="h-8 gap-1 px-2 text-xs">
          <Cpu size={14} />
          <span className="max-w-20 truncate">{currentModel.name}</span>
        </Button>
      </ModelSelectorTrigger>

      <ModelSelectorContent className="w-96 p-0">
        <ModelSelectorInput placeholder="Search models..." value={search} onValueChange={setSearch} />

        <ModelSelectorList>
          {Object.entries(groupedModels).map(([provider, models]) => (
            <ModelSelectorGroup key={provider} heading={provider.charAt(0).toUpperCase() + provider.slice(1)}>
              {models.map((model) => (
                <ModelSelectorItem
                  key={model.id}
                  value={model.id}
                  onSelect={() => handleModelSelect(model.id)}
                  className="flex cursor-pointer items-center gap-2 p-2">
                  <ModelSelectorLogo provider={model.provider} />
                  <div className="flex flex-1 flex-col">
                    <ModelSelectorName>{model.name}</ModelSelectorName>
                    <span className="text-xs text-muted-foreground">{model.description}</span>
                  </div>
                  {selectedModel === model.id && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                </ModelSelectorItem>
              ))}
            </ModelSelectorGroup>
          ))}
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  );
};
