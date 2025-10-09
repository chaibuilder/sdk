import { adjustSpacingInContentBlocks } from "@/core/components/canvas/static/adjust-spacing-in-blocks";
import { filter, get, has, isArray, isEmpty, map, uniqBy } from "lodash-es";
import { RenderBlock } from "./block-renderer";
import { RenderChaiBlocksProps } from "./render-chai-blocks";

export const RenderBlocks = (
  props: RenderChaiBlocksProps & { repeaterData?: { index: number; dataKey: string }; type?: string },
) => {
  const { blocks, parent, repeaterData, type } = props;
  let filteredBlocks = uniqBy(
    filter(blocks, (block) => has(block, "_id") && (!isEmpty(parent) ? block._parent === parent : !block._parent)),
    "_id",
  );
  const hasChildren = (blockId: string) => filter(blocks, (b) => b._parent === blockId).length > 0;

  if (hasChildren && (type === "Heading" || type === "Paragraph" || type === "Link")) {
    filteredBlocks = adjustSpacingInContentBlocks(filteredBlocks);
  }

  return map(filteredBlocks, (block) => {
    if (!block) return null;
    return (
      <RenderBlock {...props} key={block._id} block={block}>
        {({ _id, _type, repeaterItems, $repeaterItemsKey }) => {
          return _type === "Repeater" ? (
            isArray(repeaterItems) &&
              repeaterItems.map((_, index) => (
                <RenderBlocks
                  {...props}
                  parent={block._id}
                  key={`${get(block, "_parent", "root")}-${block._id}-${index}`}
                  repeaterData={{ index, dataKey: $repeaterItemsKey }}
                />
              ))
          ) : hasChildren(_id) ? (
            <RenderBlocks
              {...props}
              parent={block._id}
              key={`${get(block, "_parent", "root")}-${block._id}`}
              repeaterData={repeaterData}
              type={block._type}
            />
          ) : null;
        }}
      </RenderBlock>
    );
  });
};
