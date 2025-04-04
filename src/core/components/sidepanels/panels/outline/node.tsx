import { PlusIcon } from "@radix-ui/react-icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip";
import { atom, useAtom } from "jotai";
import { get, has } from "lodash-es";
import { ChevronRight, EyeOffIcon, FileJson, MoreVertical, Zap } from "lucide-react";
import { createElement, memo, useEffect, useMemo } from "react";
import { NodeRendererProps } from "react-arborist";
import { canvasIframeAtom } from "../../../../atoms/ui";
import { PERMISSIONS, PERMISSIONS_LIST } from "../../../../constants/PERMISSIONS";
import { ROOT_TEMP_KEY } from "../../../../constants/STRINGS";
import { CHAI_BUILDER_EVENTS } from "../../../../events";
import { canAcceptChildBlock, canAddChildBlock } from "../../../../functions/block-helpers";
import {
  useBlockHighlight,
  useBuilderProp,
  useHiddenBlockIds,
  usePermissions,
  useTranslation,
} from "../../../../hooks";
import { pubsub } from "../../../../pubsub";
import { cn } from "../../../../utils/cn";
import { BlockMoreOptions } from "./block-more-options";
import { TypeIcon } from "./block-type-icon";

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
export const Node = memo(({ node, style, dragHandle }: NodeRendererProps<any>) => {
  const outlineItems = useBuilderProp("outlineMenuItems", []);
  const { t } = useTranslation();
  const [hiddenBlocks, , toggleHidden] = useHiddenBlockIds();
  const [iframe] = useAtom<HTMLIFrameElement>(canvasIframeAtom);
  const { hasPermission } = usePermissions();
  let previousState: boolean | null = null;
  const hasChildren = node.children.length > 0;
  const { highlightBlock, clearHighlight } = useBlockHighlight();
  const { id, data, isSelected, willReceiveDrop, isDragging, isEditing, handleClick } = node;

  const handleToggle = (event: any) => {
    event.stopPropagation();
    if (hiddenBlocks.includes(id)) return;
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
    if (!node.isOpen && !hiddenBlocks.includes(id)) {
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
      if (willReceiveDrop && !node.isOpen && !isDragging && !hiddenBlocks.includes(id)) {
        node.toggle();
      }
    }, 500);

    return () => clearTimeout(timedToggle);
  }, [willReceiveDrop, node, isDragging]);

  const interactives = useMemo(() => {
    const keys = Object.keys(data);
    const alpineAttrs = [];
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].endsWith("_attrs")) {
        const attrs = data[keys[i]];
        const attrsKeys = Object.keys(attrs).join("|");
        if (attrsKeys.match(/x-data/)) {
          alpineAttrs.push("data");
        }
        if (attrsKeys.match(/x-on/)) {
          alpineAttrs.push("event");
        }
        if (attrsKeys.match(/x-show|x-if/)) {
          alpineAttrs.push("show");
        }
      }
    }
    return alpineAttrs;
  }, [data]);

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
        {hasPermission(PERMISSIONS_LIST.ADD_BLOCK) && (
          <div
            role="button"
            onClick={() => addBlockOnPosition(-1)}
            className="h-1 rounded bg-purple-500 opacity-0 duration-200 group-hover:opacity-100">
            <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 transform items-center gap-x-1 rounded-full bg-purple-500 px-3 py-1 text-[9px] leading-tight text-white hover:bg-purple-500">
              <PlusIcon className="h-2 w-2 stroke-[3]" /> {t("Add block")}
            </div>
          </div>
        )}
        <br />
      </div>
    );
  }

  const isLibBlock = useMemo(() => {
    return has(data, "_libBlock");
  }, [data]);

  return (
    <div className="w-full">
      <div
        onMouseEnter={() => highlightBlock(id)}
        onMouseLeave={() => clearHighlight()}
        onClick={handleNodeClickWithoutPropagating}
        style={style}
        data-node-id={id}
        ref={hiddenBlocks.includes(id) ? null : dragHandle}
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
                className="absolute -top-0.5 h-1 w-[90%] rounded bg-purple-500 opacity-0 delay-200 duration-200 group-hover:opacity-100">
                <div className="absolute left-1/2 top-1/2 flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full bg-purple-500 p-1 outline outline-2 outline-white hover:bg-purple-500">
                  <PlusIcon className="h-3 w-3 stroke-[4] text-white" />
                </div>
              </div>
            </div>
          )}
        <div
          className={cn(
            "group flex w-full cursor-pointer items-center justify-between space-x-px !rounded p-1 text-foreground/80 outline-none",
            isSelected ? "bg-blue-500 text-white" : "hover:bg-slate-200 dark:hover:bg-gray-800",
            willReceiveDrop && canAcceptChildBlock(data._type, "Icon") ? "bg-green-200" : "",
            node?.id === addSelectParentHighlight ? "bg-purple-100" : "",
            isDragging && "opacity-20",
            hiddenBlocks.includes(id) ? "opacity-50" : "",
          )}>
          <div className="flex items-center">
            <div
              className={`flex h-4 w-4 rotate-0 transform cursor-pointer items-center justify-center transition-transform duration-100 ${
                node.isOpen ? "rotate-90" : ""
              }`}>
              {hasChildren && (
                <button onClick={handleToggle} type="button">
                  <ChevronRight className={`h-3 w-3 stroke-[3] ${isSelected ? "text-slate-200" : "text-slate-400"}`} />
                </button>
              )}
            </div>
            <div className={cn("leading-1 flex items-center", isLibBlock && "text-orange-400")}>
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
                  <span>{data?._name || data?._type.split("/").pop()}</span>
                  {interactives.includes("data") && <FileJson className="h-3 w-3 text-orange-600" />}
                  {interactives.includes("event") && <Zap className="h-3 w-3 text-yellow-500" />}
                  {interactives.includes("show") && <EyeOffIcon className="h-3 w-3 text-orange-600" />}
                </div>
              )}
            </div>
          </div>
          <div className="invisible flex items-center space-x-1.5 pr-2 group-hover:visible">
            {!hiddenBlocks.includes(id) &&
              outlineItems.map((outlineItem) => (
                <Tooltip>
                  <TooltipTrigger
                    className="cursor-pointer rounded bg-transparent hover:bg-white hover:text-blue-500"
                    asChild>
                    {createElement(outlineItem.item, { blockId: id })}
                  </TooltipTrigger>
                  <TooltipContent className="isolate z-10">{outlineItem.tooltip}</TooltipContent>
                </Tooltip>
              ))}
            {canAddChildBlock(data?._type) && !hiddenBlocks.includes(id) && hasPermission(PERMISSIONS.ADD_BLOCK) ? (
              <Tooltip>
                <TooltipTrigger
                  onClick={() => pubsub.publish(CHAI_BUILDER_EVENTS.OPEN_ADD_BLOCK, { _id: id })}
                  className="cursor-pointer rounded bg-transparent hover:text-black"
                  asChild>
                  <PlusIcon className="h-3 w-3" />
                </TooltipTrigger>
                <TooltipContent className="isolate z-[9999]" side="left">
                  {t("Add block")}
                </TooltipContent>
              </Tooltip>
            ) : null}
            <Tooltip>
              <TooltipTrigger
                onClick={(event) => {
                  event.stopPropagation();
                  toggleHidden(id);
                  if (node.isOpen) {
                    node.toggle();
                  }
                }}
                className="cursor-pointer rounded bg-transparent hover:text-black"
                asChild>
                <EyeOffIcon size={"15"} />
              </TooltipTrigger>
              <TooltipContent className="isolate z-[9999]" side="left">
                {t("Hide block")}
              </TooltipContent>
            </Tooltip>
            <BlockMoreOptions node={node} id={id}>
              <MoreVertical size={"15"} />
            </BlockMoreOptions>
          </div>
        </div>
      </div>
    </div>
  );
});
