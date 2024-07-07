import { isEmpty, map } from "lodash-es";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import { useSelectedBlocksDisplayChild, useSelectedStylingBlocks, useStylingState } from "../../hooks";
import { FLEX_CHILD_SECTION, GRID_CHILD_SECTION, SETTINGS_SECTIONS } from "../../constants/STYLING_GROUPS.ts";
import { StylingGroup } from "./new-panel/SettingSection";
import {
  Accordion,
  Label,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui";
import { BrushIcon } from "lucide-react";
import { StylingHelpers } from "./StylingHelpers.tsx";
import { useSelectedBlockCustomStylingStates } from "../../hooks/useSelectedBlockIds.ts";

export default function BlockStyling() {
  const [state, setState] = useStylingState();
  const { flexChild, gridChild } = useSelectedBlocksDisplayChild();
  const { t } = useTranslation();
  const styleStates = useSelectedBlockCustomStylingStates();
  const [stylingBlocks] = useSelectedStylingBlocks();

  if (isEmpty(stylingBlocks)) {
    return (
      <div className="p-4 text-center">
        <div className="space-y-4 rounded-xl p-4">
          <MixerHorizontalIcon className="mx-auto text-3xl" />
          <h1>{t("no_styling_block_selected")}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <StylingHelpers />
      <div className="flex h-12 flex-col space-x-4 px-4 py-1">
        <div className="flex items-center justify-end gap-x-1.5">
          <Label htmlFor="" className="flex gap-x-1.5 text-xs italic">
            State
          </Label>
          <Select defaultValue={state as string} onValueChange={(value) => setState(value)}>
            <SelectTrigger className="h-auto w-fit p-1 px-3">
              <SelectValue placeholder={t("State")} />
            </SelectTrigger>
            <SelectContent>
              {map(styleStates, (state: string, key: string) => (
                <SelectItem key={key} value={key}>
                  {t(state)}
                </SelectItem>
              ))}
              <hr />
              <SelectItem value="">{t("Normal")}</SelectItem>
              <SelectItem value="hover">{t("Hover")}</SelectItem>
              <SelectItem value="active">{t("Active")}</SelectItem>
              <SelectItem value="focus">{t("Focus")}</SelectItem>
              <SelectItem value="before">{t("Before")}</SelectItem>
              <SelectItem value="after">{t("After")}</SelectItem>
              <SelectItem value="only">{t("Only")}</SelectItem>
              <SelectItem value="first">{t("First")}</SelectItem>
              <SelectItem value="last">{t("Last")}</SelectItem>
              <SelectItem value="first-letter">{t("First Letter")}</SelectItem>
              <SelectItem value="first-line">{t("First Line")}</SelectItem>
              <SelectItem value="disabled">{t("Disabled")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {state !== "" ? (
        <div className="m-1 flex items-center space-x-1 rounded border border-orange-500 bg-orange-200 p-px px-2 text-xs text-orange-900">
          <BrushIcon className="w-3" />
          <span>{t(`Styles will be applied for (:${state}) state`)}</span>
        </div>
      ) : null}
      <ScrollArea className="no-scrollbar -mx-1 max-h-full flex-1 overflow-x-hidden overflow-y-hidden border-t border-border">
        <Accordion defaultValue={["Layout"]} type="multiple" className="w-full">
          {flexChild && <StylingGroup section={FLEX_CHILD_SECTION} />}
          {gridChild ? <StylingGroup section={GRID_CHILD_SECTION} /> : null}
          {SETTINGS_SECTIONS.map((section) => (
            <StylingGroup key={section.heading} section={section} />
          ))}
        </Accordion>
      </ScrollArea>
    </div>
  );
}
