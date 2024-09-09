import { isEmpty } from "lodash-es";
import { useSelectedBlocksDisplayChild, useSelectedStylingBlocks } from "../../hooks";
import { FLEX_CHILD_SECTION, GRID_CHILD_SECTION, SETTINGS_SECTIONS } from "../../constants/STYLING_GROUPS.ts";
import { StylingGroup } from "./new-panel/SettingSection";
import { StylingHelpers } from "./StylingHelpers.tsx";
import { Accordion } from "../../../ui";

export default function BlockStyling() {
  const { flexChild, gridChild } = useSelectedBlocksDisplayChild();
  const [stylingBlocks] = useSelectedStylingBlocks();

  if (isEmpty(stylingBlocks)) {
    return null;
  }

  return (
    <div className="flex flex-col">
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
