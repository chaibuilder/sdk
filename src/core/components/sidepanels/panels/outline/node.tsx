import { canvasIframeAtom } from "@/core/atoms/ui";
import { BlockMoreOptions } from "@/core/components/sidepanels/panels/outline/block-more-options";
import { TypeIcon } from "@/core/components/sidepanels/panels/outline/block-type-icon";
import { PERMISSIONS } from "@/core/constants/PERMISSIONS";
import { ROOT_TEMP_KEY } from "@/core/constants/STRINGS";
import { CHAI_BUILDER_EVENTS } from "@/core/events";
import { canAcceptChildBlock, canAddChildBlock } from "@/core/functions/block-helpers";
import { useBlockHighlight, usePermissions, useTranslation, useUpdateBlocksProps } from "@/core/hooks";
import { pubsub } from "@/core/pubsub";
import { cn } from "@/core/utils/cn";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/shadcn/components/ui/tooltip";
import { ChevronRightIcon, DotsVerticalIcon, EyeClosedIcon, EyeOpenIcon, PlusIcon } from "@radix-ui/react-icons";
import { atom, useAtom } from "jotai";
import { get, has, isEmpty, startCase } from "lodash-es";
import { memo, useEffect, useMemo } from "react";
import { NodeRendererProps } from "react-arborist";

const Input = ({ node }) => {
  return (
    <input
      autoFocus
      className={cn(
        "ml-2 !h-4 w-full rounded-sm border border-border bg-background px-1 text-[11px] leading-tight outline-none",
        node.isSelected ? "text-black dark:text-white" : "",
      )}
      type="text"
      defaultValue={node.data?._name || node.data?._type}
      onFocus={(e) => e.currentTarget.select()}
      onBlur={(e) => node.submit(e.currentTarget.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") node.submit(e.currentTarget.value);
      }}
    />
  );
};

const currentAddSelection = atom<any>(null);

export const getBlockDisplayName = (data: any): string => {
  if (data?._name) return data._name;
  if (data?._type === "Box" && data?.tag && data?.tag !== "div") {
    return startCase(data.tag);
  }
  return data?._type?.split("/").pop() || "";
};

const truncateText = (text: string, maxLength: number) => {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + "...";
  }
  return text;
};

export const Node = memo(({ node, style, dragHandle }: NodeRendererProps<any>) => {
  const { t } = useTranslation();
  const updateBlockProps = useUpdateBlocksProps();
  const [iframe] = useAtom<HTMLIFrameElement>(canvasIframeAtom);
  const { hasPermission } = usePermissions();
  let previousState: boolean | null = null;
  const hasChildren = node.children.length > 0;
  const { highlightBlock, clearHighlight } = useBlockHighlight();
  const { id, data, isSelected, willReceiveDrop, isDragging, isEditing, handleClick } = node;
  const isShown = get(data, "_show", true);
  const handleToggle = (event: any) => {
    event.stopPropagation();
    if (!isShown) return;
    /*Toggle the node open and close State*/
    node.toggle();
  };

  const handleDragStart = (node: any) => {
    if (node.isInternal) {
      previousState = node.isOpen;
      if (node.isOpen) {
        node.close();
      }
    }
  };

  const handleDragEnd = (node: any) => {
    if (node.isInternal && previousState !== null) {
      if (previousState) {
        node.open();
      } else {
        node.close();
      }
      previousState = null; // Reset the previous state
    }
  };

  const [addSelectParentHighlight, setAddSelectParentHighlight]: any = useAtom(currentAddSelection);
  const onMouseEnter = () => {
    onMouseLeave();
    if (!node.parent.isSelected) {
      setAddSelectParentHighlight(node?.parent?.id as any);
    }
  };

  const onMouseLeave = () => {
    setAddSelectParentHighlight(null);
  };

  const handleNodeClickWithoutPropagating = (e: any) => {
    onMouseLeave();
    /**
     * To stop propagation of the event to the parent
     * Tree Component to avoid clearing the selection of blocks
     * and allowing to select current block.
     */
    e.stopPropagation();
    if (!node.isOpen && isShown) {
      node.toggle();
    }
    /**
     * It will work when a node is clicked.
     * The onSelect in the parent Tree Component
     * will also trigger the selection of the node.
     */
    handleClick(e);
  };

  useEffect(() => {
    //TODO: Come back to this later. Might lead to a performance issue
    const timedToggle = setTimeout(() => {
      if (willReceiveDrop && !node.isOpen && !isDragging && isShown) {
        node.toggle();
      }
    }, 500);

    return () => clearTimeout(timedToggle);
  }, [willReceiveDrop, node, isDragging]);

  const setDropAttribute = (id: string, value: string) => {
    const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
    const dropTarget = innerDoc.querySelector(`[data-block-id=${id}]`) as HTMLElement;

    if (dropTarget) {
      dropTarget.setAttribute("data-drop", value);
    }

    const rect = dropTarget.getBoundingClientRect();
    const iframeRect = iframe.getBoundingClientRect();
    const isInViewport =
      rect.top >= iframeRect.top &&
      rect.left >= iframeRect.left &&
      rect.bottom <= iframeRect.bottom &&
      rect.right <= iframeRect.right;
    if (!isInViewport) {
      innerDoc.documentElement.scrollTop = dropTarget.offsetTop - iframeRect.top;
    }
  };

  const addBlockOnPosition = (position: number) => {
    onMouseLeave();
    const parentId = get(node, "parent.id");
    if (parentId !== "__REACT_ARBORIST_INTERNAL_ROOT__") {
      pubsub.publish(CHAI_BUILDER_EVENTS.OPEN_ADD_BLOCK, { _id: parentId, position });
    } else {
      pubsub.publish(CHAI_BUILDER_EVENTS.OPEN_ADD_BLOCK, { position });
    }
  };

  if (id === ROOT_TEMP_KEY) {
    return (
      <div className="group relative w-full cursor-pointer">
        <br />
        {hasPermission(PERMISSIONS.ADD_BLOCK) && (
          <div
            role="button"
            onClick={() => addBlockOnPosition(-1)}
            className="h-1 rounded bg-primary opacity-0 duration-200 group-hover:opacity-100">
            <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 transform items-center gap-x-1 rounded-full bg-primary px-3 py-1 text-[9px] leading-tight text-white hover:bg-primary">
              <PlusIcon className="h-2 w-2 stroke-[3]" /> {t("Add block")}
            </div>
          </div>
        )}
        <br />
      </div>
    );
  }

  const isLibBlock = useMemo(() => {
    return (
      has(data, "_libBlockId") &&
      !isEmpty(data._libBlockId) &&
      (hasPermission(PERMISSIONS.CREATE_LIBRARY_BLOCK) || hasPermission(PERMISSIONS.EDIT_LIBRARY_BLOCK))
    );
  }, [data, hasPermission]);

  const isPartialBlock = useMemo(() => {
    return data?._type === "PartialBlock" || data?._type === "GlobalBlock";
  }, [data]);

  return (
    <div className="w-full">
      <div
        onMouseEnter={() => highlightBlock(id)}
        onMouseLeave={() => clearHighlight()}
        onClick={handleNodeClickWithoutPropagating}
        style={style}
        data-node-id={id}
        ref={dragHandle}
        onDragStart={() => handleDragStart(node)}
        onDragEnd={() => handleDragEnd(node)}
        onDragOver={(e) => {
          e.preventDefault();
          setDropAttribute(id, "yes");
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDropAttribute(id, "no");
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDropAttribute(id, "no");
        }}>
        {hasPermission(PERMISSIONS.ADD_BLOCK) &&
          node?.rowIndex > 0 &&
          ((node.parent.isOpen && canAddChildBlock(get(node, "parent.data._type"))) ||
            node?.parent?.id === "__REACT_ARBORIST_INTERNAL_ROOT__") && (
            <div className="group relative ml-5 h-full w-full cursor-pointer">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  addBlockOnPosition(node.childIndex);
                }}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                className="absolute -top-0.5 h-0.5 w-[90%] rounded bg-primary/80 opacity-0 delay-200 duration-200 group-hover:opacity-100">
                <div className="absolute left-1/2 top-1/2 flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full bg-primary/80 p-1 outline outline-2 outline-white hover:bg-primary/80">
                  <PlusIcon className="h-2 w-2 stroke-[2] text-white" />
                </div>
              </div>
            </div>
          )}
        <div
          className={cn(
            "group flex w-full cursor-pointer items-center justify-between space-x-px !rounded p-1 py-0 outline-none",
            isSelected ? "bg-primary/20" : "hover:bg-primary/10 dark:hover:bg-gray-800",
            willReceiveDrop && canAcceptChildBlock(data._type, "Icon") ? "bg-green-200" : "",
            node?.id === addSelectParentHighlight ? "bg-primary/10" : "",
            isDragging && "opacity-20",
            !isShown ? "line-through opacity-50" : "",
            isLibBlock && isSelected && "bg-primary/20 text-primary",
          )}>
          <div className="flex items-center">
            <div
              className={`flex h-4 w-4 rotate-0 transform cursor-pointer items-center justify-center transition-transform duration-100 ${
                node.isOpen ? "rotate-90" : ""
              }`}>
              {hasChildren && (
                <button onClick={handleToggle} type="button">
                  <ChevronRightIcon className={`h-3 w-3`} />
                </button>
              )}
            </div>
            <div
              className={cn(
                "leading-1 flex items-center",
                isLibBlock && "text-orange-600/90",
                isLibBlock && isSelected && "text-orange-600",
                isPartialBlock && "text-purple-600/90",
                isPartialBlock && isSelected && "text-purple-100",
              )}>
              <TypeIcon type={data?._type} />
              {isEditing ? (
                <Input node={node} />
              ) : (
                <div
                  className={"ml-1.5 flex items-center gap-x-1 truncate text-[13px]"}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    node.edit();
                    node.deselect();
                  }}>
                  <span title={getBlockDisplayName(data).length > 17 ? getBlockDisplayName(data) : ""}>
                    {truncateText(getBlockDisplayName(data), 17)}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="invisible flex items-center space-x-1.5 pr-px group-hover:visible">
            {canAddChildBlock(data?._type) && isShown && hasPermission(PERMISSIONS.ADD_BLOCK) ? (
              <Tooltip>
                <TooltipTrigger
                  onClick={() => pubsub.publish(CHAI_BUILDER_EVENTS.OPEN_ADD_BLOCK, { _id: id })}
                  className="cursor-pointer rounded bg-transparent p-px hover:bg-primary/10"
                  asChild>
                  <PlusIcon className="h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent className="isolate z-[9999]" side="bottom">
                  {t("Add block inside")}
                </TooltipContent>
              </Tooltip>
            ) : null}
            <Tooltip>
              <TooltipTrigger
                onClick={(event) => {
                  event.stopPropagation();
                  updateBlockProps([id], { _show: !isShown });
                  if (node.isOpen) {
                    node.toggle();
                  }
                }}
                className="cursor-pointer rounded bg-transparent p-0.5 hover:bg-primary/10"
                asChild>
                {isShown ? <EyeClosedIcon className="h-4 w-4" /> : <EyeOpenIcon className="h-4 w-4" />}
              </TooltipTrigger>
              <TooltipContent className="isolate z-[9999] text-xs" side="bottom">
                {t(isShown ? "Hide the block from page" : "Show the block on page")}
              </TooltipContent>
            </Tooltip>
            <BlockMoreOptions node={node} id={id}>
              <div className="cursor-pointer rounded bg-transparent p-px hover:bg-primary/10">
                <DotsVerticalIcon className="h-3 w-3" />
              </div>
            </BlockMoreOptions>
          </div>
        </div>
      </div>
    </div>
  );
});
