import { Button } from "../../../ui";
import { ChevronRight } from "lucide-react";
import { useSelectedBlockHierarchy, useSelectedBlockIds } from "../../hooks/useSelectedBlockIds.ts";
import { reverse } from "lodash-es";
import { TypeIcon } from "../sidepanels/panels/outline/TypeIcon.tsx";
import { useHighlightBlockId } from "../../hooks";

export const Breadcrumb = () => {
  const hierarchy = useSelectedBlockHierarchy();
  const [, setSelected] = useSelectedBlockIds();
  const [, setHighlighted] = useHighlightBlockId();
  return (
    <div className="-mx-2 border-t border-border bg-background px-2 py-1 text-xs text-muted-foreground">
      <ol className="flex items-center whitespace-nowrap">
        <li className="inline-flex items-center">
          <Button onClick={() => setSelected([])} variant={"ghost"} className="h-fit p-1 text-xs font-normal">
            Body
          </Button>
          <ChevronRight className="rtl:rotate-180" size={16} />
        </li>
        {reverse(hierarchy).map((block, index) => (
          <li key={index} className="inline-flex items-center">
            <Button
              onMouseEnter={() => {
                setHighlighted(block?._id);
              }}
              onClick={() => setSelected([block?._id])}
              variant={"ghost"}
              className="h-fit gap-x-1 p-1 text-xs font-normal">
              <TypeIcon type={block?._type} />
              {block._name || block._type}
            </Button>
            {index !== hierarchy.length - 1 && <ChevronRight className="rtl:rotate-180" size={16} />}
          </li>
        ))}
      </ol>
    </div>
  );
};
