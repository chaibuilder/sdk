import React, { useState } from "react";
import { isEmpty, isNull, noop } from "lodash-es";
import { useTranslation } from "react-i18next";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import BlockSettings from "./BlockSettings";
import BlockStyling from "./BlockStyling";
import { useBuilderProp, useSelectedBlock, useSelectedStylingBlocks, useSelectedBlockIds } from "../../hooks";
import { ErrorBoundary } from "react-error-boundary";
import { BlockAttributesEditor } from "./new-panel/BlockAttributesEditor.tsx";
import { ChevronDown } from "lucide-react";
import { FallbackError } from "../FallbackError.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/index.ts";

function BlockAttributesToggle() {
  const { t } = useTranslation();
  const [showAttributes, setShowAttributes] = useState(true);
  const [stylingBlocks] = useSelectedStylingBlocks();
  if (isEmpty(stylingBlocks)) {
    return null;
  }
  return (
    <>
      <div
        onClick={() => setShowAttributes(!showAttributes)}
        className="flex cursor-pointer items-center justify-between border-t border-border py-3 text-xs font-medium hover:underline">
        <span>{t("Attributes")}</span>
        <span>
          <ChevronDown className={"h-4 w-4 text-gray-500 " + (showAttributes ? "rotate-180" : "")} />
        </span>
      </div>
      {showAttributes && <BlockAttributesEditor />}
    </>
  );
}

const SettingsPanel: React.FC = () => {
  const selectedBlock = useSelectedBlock();
  const [ids] = useSelectedBlockIds();
  const { t } = useTranslation();
  const onErrorFn = useBuilderProp("onError", noop);

  if (isNull(selectedBlock) || ids.length > 1)
    return (
      <div className="p-4 text-center">
        <div className="space-y-4 rounded-xl p-4 text-muted-foreground">
          <MixerHorizontalIcon className="mx-auto text-3xl" />
          <h1>{t("Please select a block to edit settings or styles")}</h1>
        </div>
      </div>
    );

  return (
    <ErrorBoundary fallback={<FallbackError />} onError={onErrorFn}>
      <Tabs defaultValue="settings" className="flex flex-1 flex-col">
        <TabsList className="grid h-auto w-full grid-cols-2 p-1 py-1">
          <TabsTrigger value="settings" className="text-xs">
            Settings
          </TabsTrigger>
          <TabsTrigger value="styles" className="text-xs">
            Styles
          </TabsTrigger>
        </TabsList>
        <TabsContent value="settings" className="no-scrollbar h-full max-h-min overflow-y-auto">
          <BlockSettings />
          <br />
          <br />
        </TabsContent>
        <TabsContent
          value="styles"
          className="no-scrollbar h-full max-h-min max-w-full overflow-y-auto overflow-x-hidden">
          <BlockStyling />
          <BlockAttributesToggle />
          <br />
          <br />
          <br />
        </TabsContent>
      </Tabs>
    </ErrorBoundary>
  );
};

export default SettingsPanel;
