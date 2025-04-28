import { RepeaterContext } from "@/core/components/canvas/static/new-blocks-renderer";
import { filter, has, isArray, isEmpty, map } from "lodash-es";
import { RenderBlock } from "./block-renderer";
import { RenderChaiBlocksProps } from "./render-chai-blocks";

export const RenderBlocks = (props: RenderChaiBlocksProps) => {
  const { blocks, parent } = props;
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
                <RepeaterContext.Provider value={{ index, key: repeaterItemsBinding }}>
                  <RenderBlocks {...props} parent={block._id} />
                </RepeaterContext.Provider>
              ))
          ) : hasChildren(_id) ? (
            <RenderBlocks {...props} parent={block._id} />
          ) : null;
        }}
      </RenderBlock>
    );
  });
};
