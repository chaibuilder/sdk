import { useChaiBlocks } from "@chaibuilder/runtime";
import { useBuilderProp } from "../../../../hooks";
import { ChaiBuilderBlocks } from "./AddBlocks.tsx";
import { filter, groupBy, map, uniq } from "lodash-es";

export const DefaultChaiBlocks = ({
  parentId,
  position,
  gridCols = "grid-cols-2",
}: {
  parentId?: string;
  position: number;
  gridCols?: string;
}) => {
  const allChaiBlocks = useChaiBlocks();
  const filterChaiBlock = useBuilderProp("filterChaiBlock", () => true);
  const chaiBlocks = filter(allChaiBlocks, filterChaiBlock);

  const groupedBlocks = groupBy(chaiBlocks, "category") as Record<string, any[]>;
  const uniqueTypeGroup = uniq(map(groupedBlocks.core, "group"));

  return (
    <ChaiBuilderBlocks
      gridCols={gridCols}
      position={position}
      parentId={parentId}
      groups={uniqueTypeGroup}
      blocks={groupedBlocks.core}
    />
  );
};
