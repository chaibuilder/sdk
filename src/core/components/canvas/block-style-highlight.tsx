import { useInlineEditing } from "@/core/hooks/hooks";
import { ChaiBlock } from "@/types/chai-block";
import { flip } from "@floating-ui/dom";
import { shift, useFloating } from "@floating-ui/react-dom";
import { useResizeObserver } from "@react-hookz/web";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";

// NOTE: this component is not used anymore, but keeping it for now. Might remove it later.
// Author: surajair
export const BlockStyleHighlight = ({
  block,
  selectedStyleElement,
}: {
  block: ChaiBlock;
  selectedStyleElement: HTMLElement | null;
}) => {
  const { editingBlockId } = useInlineEditing();
  const { floatingStyles, refs, update } = useFloating({
    placement: "top-start",
    middleware: [shift(), flip()],
    elements: { reference: selectedStyleElement },
  });

  useResizeObserver(selectedStyleElement as HTMLElement, () => update(), selectedStyleElement !== null);
  if (!selectedStyleElement || editingBlockId) return null;
  const sameBlock = selectedStyleElement.getAttribute("data-block-id") === block?._id;
  if (sameBlock) return null;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        ref={refs.setFloating}
        style={floatingStyles}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onMouseEnter={(e) => {
          e.stopPropagation();
        }}
        onKeyDown={(e) => e.stopPropagation()}
        className="isolate z-[999] flex items-center rounded-t bg-orange-500 p-px text-xs text-white">
        <MixerHorizontalIcon className="h-3 w-3" />
      </div>
    </>
  );
};
