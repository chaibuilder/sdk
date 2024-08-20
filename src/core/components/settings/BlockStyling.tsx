import { isEmpty } from "lodash-es";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import { useSelectedBlocksDisplayChild, useSelectedStylingBlocks } from "../../hooks";
import { FLEX_CHILD_SECTION, GRID_CHILD_SECTION, SETTINGS_SECTIONS } from "../../constants/STYLING_GROUPS.ts";
import { StylingGroup } from "./new-panel/SettingSection";
import { StylingHelpers } from "./StylingHelpers.tsx";
import { Accordion } from "../../../ui";

export default function BlockStyling() {
  const { flexChild, gridChild } = useSelectedBlocksDisplayChild();
  const { t } = useTranslation();
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
      <Accordion defaultValue={["Styles"]} type="multiple" className="w-full">
        {flexChild && <StylingGroup section={FLEX_CHILD_SECTION} />}
        {gridChild ? <StylingGroup section={GRID_CHILD_SECTION} /> : null}
        {SETTINGS_SECTIONS.map((section) => (
          <StylingGroup key={section.heading} section={section} />
        ))}
      </Accordion>
    </div>
  );
}
