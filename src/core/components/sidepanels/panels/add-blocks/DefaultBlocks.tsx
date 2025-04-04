import { useRegisteredChaiBlocks } from "@chaibuilder/runtime";
import { groupBy, map, uniq } from "lodash-es";
import { ChaiBuilderBlocks } from "./add-blocks.tsx";

export const DefaultChaiBlocks = ({
  parentId,
  position,
  gridCols = "grid-cols-2",
}: {
  parentId?: string;
  position?: number;
  gridCols?: string;
}) => {
  const chaiBlocks = useRegisteredChaiBlocks();

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
