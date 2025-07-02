import { FallbackError } from "@/core/components/fallback-error";
import BlockSettings from "@/core/components/settings/block-settings";
import BlockStyling from "@/core/components/settings/block-styling";
import { BlockAttributesEditor } from "@/core/components/settings/new-panel/block-attributes-editor";
import { useBuilderProp, useResetBlockStyles, useSelectedBlock, useSelectedStylingBlocks } from "@/core/hooks";
import { PERMISSIONS, usePermissions } from "@/core/main";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/shadcn/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/shadcn/components/ui/tabs";
import { MixerHorizontalIcon, ResetIcon } from "@radix-ui/react-icons";
import { isEmpty, isNull, noop } from "lodash-es";
import { ChevronDown, MoreVertical } from "lucide-react";
import React, { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const onErrorFn = useBuilderProp("onError", noop);
  const { hasPermission } = usePermissions();
  const { resetAll } = useResetBlockStyles();

  const resetButton = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="ml-1 rounded-sm p-0.5 hover:bg-blue-300 hover:text-blue-600"
          onClick={(e) => e.stopPropagation()}>
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" className="border-border text-xs">
        <DropdownMenuItem
          className="flex items-center gap-1 text-xs"
          onClick={() => {
            resetAll();

          }}>
          <ResetIcon className="h-4 w-4" />
          {t("Reset styles")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  let isSettingsDisabled = !hasPermission(PERMISSIONS.EDIT_BLOCK);
  const isStylesDisabled = !hasPermission(PERMISSIONS.EDIT_STYLES);

  if (isNull(selectedBlock)) {
    return (
      <div className="p-4 text-center">
        <div className="space-y-4 rounded-xl p-4 text-muted-foreground">
          <MixerHorizontalIcon className="mx-auto text-3xl" />
          <h1>{t("Please select a block to edit settings or styles")}</h1>
        </div>
      </div>
    );
  }

  if (isSettingsDisabled && isStylesDisabled) {
    return (
      <div className="p-4 text-center">
        <div className="space-y-4 rounded-xl p-4 text-muted-foreground">
          <MixerHorizontalIcon className="mx-auto text-3xl" />
          <h1>{t("You don't have permission to edit settings or styles")}</h1>
          <p>{t("Please contact your administrator to get access")}</p>
        </div>
      </div>
    );
  }

  // Show only settings panel if styles are disabled
  if (isStylesDisabled) {
    return (
      <ErrorBoundary fallback={<FallbackError />} onError={onErrorFn}>
        <div className="no-scrollbar h-full max-h-min w-full overflow-y-auto">
          <BlockSettings />
          <br />
          <br />
        </div>
      </ErrorBoundary>
    );
  }

  // Show only styles panel if settings are disabled
  if (isSettingsDisabled) {
    return (
      <ErrorBoundary fallback={<FallbackError />} onError={onErrorFn}>
        <div className="no-scrollbar h-full max-h-min w-full overflow-y-auto overflow-x-hidden">
          <div className="flex items-center w-full justify-end">
            {resetButton}
          </div>
          <BlockStyling />
          <BlockAttributesToggle />
          <br />
          <br />
          <br />
        </div>
      </ErrorBoundary>
    );
  }

  // Show both tabs if both permissions are enabled
  return (
    <ErrorBoundary fallback={<FallbackError />} onError={onErrorFn}>
      <Tabs defaultValue="settings" className="flex flex-1 flex-col">
        <div className="flex justify-between items-center">
        <TabsList className="grid h-auto w-full grid-cols-2 p-1 py-1">
          <TabsTrigger value="settings" className="text-xs">
            Settings
          </TabsTrigger>
          <TabsTrigger value="styles" className="text-xs">
            Styles
          </TabsTrigger>
        </TabsList>
        {resetButton}
        </div>
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
