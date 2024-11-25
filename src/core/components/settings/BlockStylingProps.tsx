import { isEmpty } from "lodash-es";
import { useSelectedBlock, useSelectedStylingBlocks, useTranslation } from "../../hooks";
import { map } from "lodash-es";
import { startCase } from "lodash-es";
import { Badge } from "../../../ui";
import { find } from "lodash-es";

export const BlockStylingProps = () => {
  const selectedBlock = useSelectedBlock();
  const [stylingBlocks, setStylingBlocks] = useSelectedStylingBlocks();
  const { t } = useTranslation();
  if (!selectedBlock) return null;
  // find all styles props of selected block by checking for value of each prop as string and starts with #styles:
  const stylesProps = Object.keys(selectedBlock).filter(
    (prop) => typeof selectedBlock[prop] === "string" && selectedBlock[prop].startsWith("#styles:"),
  );
  if (isEmpty(stylesProps) || stylesProps.length <= 1) return null;

  const isSelected = (prop: string) => {
    return find(stylingBlocks, (block) => block.prop === prop);
  };
  return (
    <div className="flex flex-wrap gap-1">
      <label htmlFor="block-styling-props" className="py-1 text-xs">
        {t("Style element")}:
      </label>
      <div className="flex flex-wrap gap-2">
        {map(stylesProps, (prop) => {
          return (
            <Badge
              className="cursor-pointer"
              onClick={() => {
                setStylingBlocks([{ id: `${prop}-${selectedBlock._id}`, blockId: selectedBlock._id, prop }]);
              }}
              variant={isSelected(prop) ? "default" : "secondary"}
              key={prop}>
              {startCase(prop)}
            </Badge>
          );
        })}
      </div>
      <div className="my-2 h-[1px] w-full bg-border" />
    </div>
  );
};
