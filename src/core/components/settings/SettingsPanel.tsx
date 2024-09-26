import React, { useState } from "react";
import { isNull, noop } from "lodash-es";
import { useTranslation } from "react-i18next";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import BlockSettings from "./BlockSettings";
import BlockStyling from "./BlockStyling";
import { useBuilderProp, useSelectedBlock } from "../../hooks";
import { ErrorBoundary } from "react-error-boundary";
import { BlockAttributesEditor } from "./new-panel/BlockAttributesEditor.tsx";
import { ChevronDown } from "lucide-react";
import { FallbackError } from "../FallbackError.tsx";

const SettingsPanel: React.FC = () => {
  const selectedBlock = useSelectedBlock();
  const { t } = useTranslation();
  const [showAttributes, setShowAttributes] = useState(true);
  const onErrorFn = useBuilderProp("onError", noop);

  if (isNull(selectedBlock))
    return (
      <div className="p-4 text-center">
        <div className="space-y-4 rounded-xl p-4">
          <MixerHorizontalIcon className="mx-auto text-3xl" />
          <h1>{t("please_select_a_block_to_edit")}</h1>
        </div>
      </div>
    );

  return (
    <ErrorBoundary fallback={<FallbackError />} onError={onErrorFn}>
      <div className={"relative flex max-h-full w-full flex-col"}>
        <BlockSettings />
        <br />
        <BlockStyling />

        <div
          onClick={() => setShowAttributes(!showAttributes)}
          className="flex cursor-default items-center justify-between border-b border-gray-300 py-2 text-sm font-bold hover:bg-gray-50">
          <span>{t("Attributes")}</span>
          <span>
            <ChevronDown className={"h-4 w-4 text-gray-500 " + (showAttributes ? "rotate-180" : "")} />
          </span>
        </div>
        {showAttributes && <BlockAttributesEditor />}
        <br />
        <br />
        <br />
      </div>
    </ErrorBoundary>
  );
};

export default SettingsPanel;
