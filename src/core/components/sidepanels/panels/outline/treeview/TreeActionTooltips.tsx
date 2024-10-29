import { forwardRef } from "react";
import { EyeOpenIcon } from "@radix-ui/react-icons";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "../../../../../../ui";
import { BiCollapseVertical, BiExpandVertical } from "react-icons/bi";
import { useTranslation } from "react-i18next";

import { useHiddenBlockIds } from "../../../../../hooks";

const CollapseAllTooltip = forwardRef((props, ref: any) => {
  const { t } = useTranslation();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className="h-fit p-1"
          onClick={() => {
            if (ref && ref.current) {
              ref.current.closeAll();
            }
          }}
          variant="outline"
          size="sm">
          <BiCollapseVertical size={"14"} />
        </Button>
      </TooltipTrigger>
      <TooltipContent className="isolate z-[9999]">{t("Collapse all")}</TooltipContent>
    </Tooltip>
  );
});

const ExpandAllTooltip = forwardRef((props, ref: any) => {
  const { t } = useTranslation();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button className="h-fit p-1" onClick={() => ref?.current?.openAll()} variant="outline" size="sm">
          <BiExpandVertical size={"14"} />
        </Button>
      </TooltipTrigger>
      <TooltipContent className="isolate z-[9999]">{t("Expand all")}</TooltipContent>
    </Tooltip>
  );
});

const HideHiddenBlocksTooltip = () => {
  const { t } = useTranslation();
  const [, setHiddenBlocks] = useHiddenBlockIds();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={() => setHiddenBlocks([])}
          variant="outline"
          className="h-fit p-1 disabled:cursor-not-allowed disabled:opacity-50"
          size="sm">
          <EyeOpenIcon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent className="isolate z-[9999]">{t("Show hidden blocks")}</TooltipContent>
    </Tooltip>
  );
};

export { CollapseAllTooltip, ExpandAllTooltip, HideHiddenBlocksTooltip };
