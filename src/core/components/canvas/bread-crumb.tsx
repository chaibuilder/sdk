import { TypeIcon } from "@/core/components/sidepanels/panels/outline/block-type-icon";
import { useBlockHighlight } from "@/core/hooks/use-block-highlight";
import { useSelectedBlockHierarchy, useSelectedBlockIds } from "@/core/hooks/use-selected-blockIds";
import { Button } from "@/ui/shadcn/components/ui/button";
import { reverse } from "lodash-es";
import { ChevronRightIcon } from "@radix-ui/react-icons";

export const Breadcrumb = () => {
  const hierarchy = useSelectedBlockHierarchy();
  const [, setSelected] = useSelectedBlockIds();
  const { highlightBlock } = useBlockHighlight();

  return (
    <div className="-mx-2 border-t border-border bg-background px-2 py-1 text-xs text-muted-foreground">
      <ol className="flex items-center whitespace-nowrap">
        <li className="inline-flex items-center">
          <Button onClick={() => setSelected([])} variant={"ghost"} className="h-fit p-1 text-xs font-normal">
            Body
          </Button>
          <ChevronRightIcon className="rtl:rotate-180 h-4 w-4" />
        </li>
        {reverse(hierarchy).map((block, index) => (
          <li key={index} className="inline-flex items-center">
            <Button
              onMouseEnter={() => {
                highlightBlock(block?._id);
              }}
              onClick={() => setSelected([block?._id])}
              variant={"ghost"}
              className="h-fit gap-x-1 p-1 text-xs font-normal">
              <TypeIcon type={block?._type} />
              {block._name || block._type}
            </Button>
            {index !== hierarchy.length - 1 && <ChevronRightIcon className="rtl:rotate-180 h-4 w-4" />}
          </li>
        ))}
      </ol>
    </div>
  );
};
