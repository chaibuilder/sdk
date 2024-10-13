import { ChaiBlock } from "../../../main";
import { useRSCBlocksStore } from "../../../hooks/useWatchRSCBlocks.ts";
import { Skeleton } from "../../../../ui/index.ts";

export const RSCBlock = ({ blockProps, block }: { blockProps: Record<string, string>; block: ChaiBlock }) => {
  const { getRSCBlockMarkup, getRSCBlockState } = useRSCBlocksStore();
  const html = getRSCBlockMarkup(block);
  const { loading, error } = getRSCBlockState(block._id);
  if (loading)
    return (
      <div {...blockProps} className="h-10 w-full">
        <Skeleton className="h-full w-full rounded-md border" />
      </div>
    );
  if (error) return <div {...blockProps}>Error: {error}</div>;
  return <div {...blockProps} dangerouslySetInnerHTML={{ __html: html }} />;
};
