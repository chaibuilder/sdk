import { filter, has, isArray, isEmpty, map } from "lodash-es";
import { RenderBlock } from "./block-renderer";
import { RenderChaiBlocksProps } from "./render-chai-blocks";

export const RenderBlocks = (props: RenderChaiBlocksProps & { repeaterData?: { index: number; dataKey: string } }) => {
  const { blocks, parent, repeaterData } = props;
  const filteredBlocks = filter(
    blocks,
    (block) => has(block, "_id") && (!isEmpty(parent) ? block._parent === parent : !block._parent),
  );
  const hasChildren = (blockId: string) => filter(blocks, (b) => b._parent === blockId).length > 0;

  return map(filteredBlocks, (block) => {
    if (!block) return null;
    return (
      <RenderBlock {...props} key={block._id} block={block}>
        {({ _id, _type, repeaterItems, repeaterItemsBinding }) => {
          return _type === "Repeater" ? (
            isArray(repeaterItems) &&
              repeaterItems.map((_, index) => (
                <RenderBlocks {...props} parent={block._id} repeaterData={{ index, dataKey: repeaterItemsBinding }} />
              ))
          ) : hasChildren(_id) ? (
            <RenderBlocks {...props} parent={block._id} repeaterData={repeaterData} />
          ) : null;
        }}
      </RenderBlock>
    );
  });
};
