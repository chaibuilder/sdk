import React, { memo, MouseEvent, useEffect, useMemo, useRef } from "react";
import { useAtom } from "jotai";
import { useDebouncedCallback } from "@react-hookz/web";
import { MoveHandler, NodeRendererProps, RenameHandler, Tree } from "react-arborist";
import { treeDSBlocks } from "../../../../../atoms/blocks.ts";
import { cn } from "../../../../../functions/Functions.ts";
import {
  useBlocksStore,
  useBuilderProp,
  useCutBlockIds,
  useHiddenBlockIds,
  useHighlightBlockId,
  useSelectedBlockIds,
  useSelectedStylingBlocks,
  useUpdateBlocksProps,
} from "../../../../../hooks";
import { EyeOpenIcon, TriangleRightIcon } from "@radix-ui/react-icons";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "../../../../../../ui";
import { TypeIcon } from "../TypeIcon.tsx";
import { DefaultCursor } from "./DefaultCursor.tsx";
import { DefaultDragPreview } from "./DefaultDragPreview.tsx";
import { useBlocksStoreUndoableActions } from "../../../../../history/useBlocksStoreUndoableActions.ts";
import { BlockContextMenu } from "../BlockContextMenu.tsx";
import { canAcceptChildBlock, canAddChildBlock } from "../../../../../functions/block-helpers.ts";
import { find, first, isEmpty } from "lodash-es";
import { canvasIframeAtom, treeRefAtom } from "../../../../../atoms/ui.ts";
import {
  close,
  defaultShortcuts,
  open,
  selectFirst,
  selectLast,
  selectNext,
  selectParent,
  selectPrev,
} from "./DefaultShortcuts.tsx";
import { useTranslation } from "react-i18next";
import { VscJson } from "react-icons/vsc";
import { BsLightningFill } from "react-icons/bs";
import { TbEyeDown } from "react-icons/tb";
import { ROOT_TEMP_KEY } from "../../../../../constants/STRINGS.ts";
import { EyeOff, PlusIcon } from "lucide-react";
import { CHAI_BUILDER_EVENTS, emitChaiBuilderMsg } from "../../../../../events.ts";
import { BiCollapseVertical, BiExpandVertical } from "react-icons/bi";

const Node = memo(({ node, style, dragHandle }: NodeRendererProps<any>) => {
  const outlineItems = useBuilderProp("outlineMenuItems", []);
  const { t } = useTranslation();
  const [hiddenBlocks, , toggleHidden] = useHiddenBlockIds();
  const [, setHighlighted] = useHighlightBlockId();
  const [iframe] = useAtom<HTMLIFrameElement>(canvasIframeAtom);

  let previousState: boolean | null = null;
  const hasChildren = node.children.length > 0;

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

  const handleNodeClickWithoutPropagating = (e: any) => {
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

  if (id === ROOT_TEMP_KEY) {
    return (
      <button
        onClick={() => emitChaiBuilderMsg({ name: CHAI_BUILDER_EVENTS.OPEN_ADD_BLOCK })}
        className="mb-10 mt-5 w-full rounded bg-gray-100 p-1 hover:bg-gray-200 dark:bg-gray-800">
        + {t("add_block")}
      </button>
    );
  }

  return (
    <BlockContextMenu id={id}>
      <div
        onMouseEnter={() => setHighlighted(id)}
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
        }}
        className={cn(
          "group flex !h-full w-full items-center justify-between space-x-px !rounded py-px text-foreground/80 outline-none",
          isSelected ? "bg-blue-500 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-800",
          willReceiveDrop && canAcceptChildBlock(data._type, "Icon") ? "bg-green-200" : "",
          isDragging && "opacity-20",
          hiddenBlocks.includes(id) ? "opacity-50" : "",
        )}>
        <div className="flex items-center">
          <div
            className={`flex h-4 w-4 rotate-0 transform cursor-pointer items-center justify-center text-xs transition-transform duration-100 ${
              node.isOpen ? "rotate-90" : ""
            }`}>
            {hasChildren && (
              <button onClick={handleToggle} type="button">
                <TriangleRightIcon />
              </button>
            )}
          </div>
          <div className="flex items-center">
            <div className="-mt-0.5 h-3 w-3">
              <TypeIcon type={data?._type} />
            </div>
            {isEditing ? (
              <Input node={node} />
            ) : (
              <div
                className={"ml-2 flex items-center gap-x-1 truncate text-[11px]"}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  node.edit();
                  node.deselect();
                }}>
                <span>{data?._name || data?._type.split("/").pop()}</span>
                {interactives.includes("data") && <VscJson className="h-3 w-3 text-orange-600" />}
                {interactives.includes("event") && <BsLightningFill className="h-3 w-3 text-yellow-500" />}
                {interactives.includes("show") && <TbEyeDown className="h-3 w-3 text-orange-600" />}
              </div>
            )}
          </div>
        </div>
        <div className="invisible flex items-center space-x-1 pr-2 group-hover:visible">
          {!hiddenBlocks.includes(id) &&
            outlineItems.map((outlineItem) => (
              <Tooltip>
                <TooltipTrigger
                  className="cursor-pointer rounded bg-transparent hover:bg-white hover:text-blue-500"
                  asChild>
                  {React.createElement(outlineItem.item, { blockId: id })}
                </TooltipTrigger>
                <TooltipContent className="isolate z-10">{outlineItem.tooltip}</TooltipContent>
              </Tooltip>
            ))}
          {canAddChildBlock(data?._type) && !hiddenBlocks.includes(id) ? (
            <Tooltip>
              <TooltipTrigger
                onClick={() => emitChaiBuilderMsg({ name: CHAI_BUILDER_EVENTS.OPEN_ADD_BLOCK, data: { _id: id } })}
                className="cursor-pointer rounded bg-transparent hover:bg-white hover:text-black"
                asChild>
                <PlusIcon size={"18"} />
              </TooltipTrigger>
              <TooltipContent className="isolate z-[9999]">{t("Add block")}</TooltipContent>
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
              className="cursor-pointer rounded bg-transparent hover:bg-white hover:text-black"
              asChild>
              <EyeOff size={"15"} />
            </TooltipTrigger>
            <TooltipContent className="isolate z-[9999]">{t("Add block")}</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </BlockContextMenu>
  );
});

const Input = ({ node }) => {
  return (
    <input
      autoFocus
      className="ml-2 !h-4 w-full rounded-sm border border-border bg-background px-1 text-[11px] outline-none"
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
const useCanMove = () => {
  const [blocks] = useBlocksStore();
  return (ids: string[], newParentId: string | null) => {
    const newParentType = find(blocks, { _id: newParentId })?._type;
    const blockType = first(ids.map((id) => find(blocks, { _id: id })?._type));
    return canAcceptChildBlock(newParentType, blockType);
  };
};

const ListTree = () => {
  const [treeData] = useAtom(treeDSBlocks);
  const [ids, setIds] = useSelectedBlockIds();
  const [cutBlocksIds] = useCutBlockIds();
  const [, setHiddenBlocks] = useHiddenBlockIds();
  const updateBlockProps = useUpdateBlocksProps();
  const [, setStyleBlocks] = useSelectedStylingBlocks();
  const { moveBlocks } = useBlocksStoreUndoableActions();
  const canMove = useCanMove();
  const treeRef = useRef(null);
  const [, setTreeRef] = useAtom(treeRefAtom);
  const { t } = useTranslation();

  const clearSelection = () => {
    setIds([]);
    setStyleBlocks([]);
  };

  const filteredTreeData = useMemo(() => {
    const filterTreeData = (data, cutIds) => {
      return data
        .filter((node) => !cutIds.includes(node._id))
        .map((node) => ({
          ...node,
          children: node.children ? filterTreeData(node.children, cutIds) : [],
        }));
    };
    const nodes = filterTreeData(treeData, cutBlocksIds);
    return [...nodes, { _type: ROOT_TEMP_KEY, _id: ROOT_TEMP_KEY, children: [] }];
  }, [treeData, cutBlocksIds]);

  useEffect(() => {
    //@ts-ignore
    setTreeRef(treeRef.current);
  }, [setTreeRef, treeRef]);

  const onRename: RenameHandler<any> = ({ id, name, node }) => {
    updateBlockProps([id], { _name: name }, node.data._name);
  };
  const onMove: MoveHandler<any> = ({ dragIds, parentId, index }) => {
    if (canMove(dragIds, parentId)) moveBlocks(dragIds, parentId, index);
  };

  const onSelect = (nodes: any) => {
    if (nodes.length === 0) return;
    const nodeId = nodes[0] ? nodes[0].id : "";
    setStyleBlocks([]);
    setIds([nodeId]);
  };

  const onContextMenu = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const target = e.target as HTMLDivElement;
    const nodeId =
      target.getAttribute("data-node-id") || target.closest("[data-node-id]")?.getAttribute("data-node-id");
    if (nodeId) {
      setStyleBlocks([]);
      setIds([nodeId]);
    }
  };

  const debouncedDisableDrop = useDebouncedCallback(
    ({ parentNode, dragNodes }) => {
      return (
        parentNode?.data._type === ROOT_TEMP_KEY ||
        !canAcceptChildBlock(parentNode?.data._type, dragNodes[0]?.data._type)
      );
    },
    [],
    300,
  );

  const handleKeyDown = (e) => {
    if (!treeRef.current) return;

    const tree = treeRef.current;
    const selectedNode = tree.selectedNodes[0];
    if (!selectedNode) return;

    setIds[selectedNode.id];
    setStyleBlocks([]);

    const isLeaf = !selectedNode.isInternal;
    const isClosed = !selectedNode.isOpen;
    const isOpen = selectedNode.isOpen;

    const shortcut = defaultShortcuts.find((s) => s.key === e.key && (!s.when || eval(s.when)));

    if (shortcut) {
      e.preventDefault();
      switch (shortcut.command) {
        case "selectNext":
          selectNext(tree);
          break;
        case "selectPrev":
          selectPrev(tree);
          break;
        case "selectParent":
          selectParent(tree, isLeaf || isClosed);
          break;
        case "close":
          close(tree, isOpen);
          break;
        case "open":
          open(tree, isClosed);
          break;
        case "selectFirst":
          selectFirst(tree);
          break;
        case "selectLast":
          selectLast(tree);
          break;
        default:
          break;
      }
    }
  };

  if (isEmpty(treeData))
    return (
      <div>
        <div className="mt-10 flex h-full w-full items-center justify-center p-8 text-center">
          <p className="mb-1.5 text-sm text-gray-400">
            {t("This page is empty")}
            <br />
            <br />
            <Button
              onClick={() => emitChaiBuilderMsg({ name: CHAI_BUILDER_EVENTS.OPEN_ADD_BLOCK })}
              variant="default"
              size="sm">
              + {t("Add Block")}
            </Button>
          </p>
        </div>
      </div>
    );

  return (
    <div className={cn("flex h-full select-none flex-col space-y-1")} onClick={() => clearSelection()}>
      <div
        id="outline-view"
        className="no-scrollbar h-full overflow-y-auto text-xs"
        onKeyDown={(e) => {
          if (!treeRef.current.isEditing) {
            handleKeyDown(e);
          }
        }}>
        <div className="mb-2 flex items-center justify-end gap-x-2 pb-2 text-xs text-muted-foreground">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setHiddenBlocks([])}
                variant="outline"
                className="h-fit p-1 disabled:cursor-not-allowed disabled:opacity-50"
                size="sm">
                <EyeOpenIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="isolate z-[9999]">{t("Show hidden blocks")}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="h-fit p-1" onClick={() => treeRef?.current?.openAll()} variant="outline" size="sm">
                <BiExpandVertical size={"14"} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="isolate z-[9999]">{t("Expand all")}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="h-fit p-1" onClick={() => treeRef?.current?.closeAll()} variant="outline" size="sm">
                <BiCollapseVertical size={"14"} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="isolate z-[9999]">{t("Collapse all")}</TooltipContent>
          </Tooltip>
        </div>
        <Tree
          ref={treeRef}
          height={window.innerHeight - 160}
          className="no-scrollbar !h-full max-w-full !overflow-y-auto !overflow-x-hidden"
          selection={ids[0] || ""}
          onRename={onRename}
          openByDefault={false}
          onMove={onMove}
          rowHeight={25}
          data={[...filteredTreeData]}
          renderCursor={DefaultCursor}
          onSelect={onSelect}
          childrenAccessor={(d: any) => d.children}
          width={"100%"}
          renderDragPreview={DefaultDragPreview}
          indent={10}
          onContextMenu={onContextMenu}
          disableDrop={debouncedDisableDrop as any}
          idAccessor={"_id"}>
          {Node as any}
        </Tree>
      </div>
    </div>
  );
};

export default ListTree;
