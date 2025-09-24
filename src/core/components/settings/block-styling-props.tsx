import {
  useSelectedBlock,
  useSelectedStylingBlocks,
  useTranslation,
  useRemoveClassesFromBlocks,
  useSelectedBlockIds,
} from "@/core/hooks";
import { useResetBlockStyles } from "@/core/hooks/use-reset-block-styles";
import { Badge } from "@/ui/shadcn/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/shadcn/components/ui/dropdown-menu";
import { find, get, isEmpty, map, startCase } from "lodash-es";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { getSplitChaiClasses } from "@/core/hooks/get-split-classes";

export const BlockStylingProps = () => {
  const selectedBlock = useSelectedBlock();
  const [stylingBlocks, setStylingBlocks] = useSelectedStylingBlocks();
  const removeClassesFromBlocks = useRemoveClassesFromBlocks();
  const [selectedIds] = useSelectedBlockIds();
  const { t } = useTranslation();
  if (!selectedBlock) return null;
  // find all styles props of selected block by checking for value of each prop as string and starts with #styles:
  const stylesProps = Object.keys(selectedBlock).filter(
    (prop) => typeof selectedBlock[prop] === "string" && selectedBlock[prop].startsWith("#styles:"),
  );
  const { reset } = useResetBlockStyles();
  const hasStyles = !isEmpty(stylesProps) && stylesProps.length > 1;
  const prop = get(selectedBlock, stylingBlocks[0]?.prop, "");
  const { classes: classesString = "" } = getSplitChaiClasses(prop) || {};
  const classes = classesString ? classesString.split(" ").filter((cls) => !isEmpty(cls)) : [];

  const isSelected = (prop: string) => {
    return find(stylingBlocks, (block) => block.prop === prop);
  };

  return (
    <>
      {hasStyles && (
        <div className="flex flex-wrap gap-1">
          <label htmlFor="block-styling-props" className="py-1 text-xs">
            {t("Style element")}:
          </label>
          <div className="flex flex-wrap gap-2">
            {map(stylesProps, (prop) => {
              return (
                <Badge
                  key={prop}
                  className="flex cursor-pointer items-center gap-1 pr-1"
                  variant={isSelected(prop) ? "default" : "secondary"}
                  onClick={() => {
                    setStylingBlocks([{ id: `${prop}-${selectedBlock._id}`, blockId: selectedBlock._id, prop }]);
                  }}>
                  {startCase(prop)}
                  {
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="ml-1 rounded-sm p-0.5 hover:bg-blue-300 hover:text-blue-600"
                          onClick={(e) => e.stopPropagation()}>
                          <DotsVerticalIcon className="h-3 w-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="bottom" className="border-border text-xs">
                        <DropdownMenuItem
                          className="text-xs"
                          onClick={() => {
                            reset(prop);
                          }}>
                          {t("Reset style")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-xs"
                          onClick={() => {
                            removeClassesFromBlocks(selectedIds, classes, true);
                          }}>
                          {t("Clear styles")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  }
                </Badge>
              );
            })}
          </div>
          <div className="my-2 h-[1px] w-full bg-border" />
        </div>
      )}
    </>
  );
};
