import { useRegisteredChaiBlocks } from "@chaibuilder/runtime";
import { filter, groupBy, map, uniq } from "lodash-es";
import { useBuilderProp } from "../../../../hooks";
import { ChaiBuilderBlocks } from "./AddBlocks.tsx";

export const DefaultChaiBlocks = ({
  parentId,
  position,
  gridCols = "grid-cols-2",
}: {
  parentId?: string;
  position?: number;
  gridCols?: string;
}) => {
  const allChaiBlocks = useRegisteredChaiBlocks();
  const filterChaiBlock = useBuilderProp("filterChaiBlock", () => true);
  const chaiBlocks = filter(allChaiBlocks, filterChaiBlock);

  const groupedBlocks = groupBy(chaiBlocks, "category") as Record<string, any[]>;
  const uniqueTypeGroup = uniq(map(groupedBlocks.core, "group"));

  return (
    <ChaiBuilderBlocks
      gridCols={gridCols}
      parentId={parentId}
      position={position}
      groups={uniqueTypeGroup}
      blocks={groupedBlocks.core}
    />
  );
};
