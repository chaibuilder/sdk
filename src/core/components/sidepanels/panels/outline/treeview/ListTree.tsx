import { useDebouncedCallback } from "@react-hookz/web";
import { atom, useAtom } from "jotai";
import { find, first, get, isEmpty } from "lodash-es";
import {
  ChevronRight,
  ChevronsDown,
  ChevronsUp,
  Eye,
  EyeOff as EyeOffIcon,
  FileJson,
  MoreVertical,
  PlusIcon,
  Zap,
} from "lucide-react";
import React, { memo, MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { MoveHandler, NodeRendererProps, RenameHandler, Tree } from "react-arborist";
import { useTranslation } from "react-i18next";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "../../../../../../ui";
import { treeDSBlocks } from "../../../../../atoms/blocks.ts";
import { canvasIframeAtom, treeRefAtom } from "../../../../../atoms/ui.ts";
import { PERMISSIONS } from "../../../../../constants/PERMISSIONS.ts";
import { ROOT_TEMP_KEY } from "../../../../../constants/STRINGS.ts";
import { CHAI_BUILDER_EVENTS } from "../../../../../events.ts";
import { canAcceptChildBlock, canAddChildBlock } from "../../../../../functions/block-helpers.ts";
import { cn } from "../../../../../functions/Functions.ts";
import { useBlocksStoreUndoableActions } from "../../../../../history/useBlocksStoreUndoableActions.ts";
import {
  useBlocksStore,
  useBuilderProp,
  useCutBlockIds,
  useHiddenBlockIds,
  usePermissions,
  useSelectedBlockIds,
  useSelectedStylingBlocks,
  useUpdateBlocksProps,
} from "../../../../../hooks";
import { useBlockHighlight } from "../../../../../hooks/useBlockHighlight";
import { pubsub } from "../../../../../pubsub.ts";
import { TypeIcon } from "../TypeIcon.tsx";
import { BlockMoreOptions, PasteAtRootContextMenu } from "./BlockContextMenu.tsx";
import { DefaultCursor } from "./DefaultCursor.tsx";
import { DefaultDragPreview } from "./DefaultDragPreview.tsx";
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
const currentAddSelection = atom<any>(null);

const Node = memo(({ node, style, dragHandle }: NodeRendererProps<any>) => {
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
        {hasPermission(PERMISSIONS.ADD_BLOCK) && (
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
            <div className="leading-1 flex items-center">
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
                    {React.createElement(outlineItem.item, { blockId: id })}
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
                  <PlusIcon size={"15"} />
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
  const [parentContext, setParentContext] = useState(null);

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
    if (parentContext) setParentContext(null);

    const target = e.target as HTMLDivElement;
    const nodeId =
      target.getAttribute("data-node-id") || target.closest("[data-node-id]")?.getAttribute("data-node-id");
    if (nodeId) {
      setStyleBlocks([]);
      setIds([nodeId]);
    } else {
      setStyleBlocks([]);
      setIds([]);
      setParentContext({ x: e.clientX, y: e.clientY });
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

  useEffect(() => {
    const updateTreeRef = () => {
      if (treeRef.current) {
        //@ts-ignore
        setTreeRef(treeRef.current);
      }
    };
    //sets the ref once on mount if its available
    updateTreeRef();

    /**Sets up a MutationObserver to watch for DOM changes and try setting the ref again */
    const observer = new MutationObserver(updateTreeRef);
    observer.observe(document.body, { childList: true, subtree: true });

    //disconnect observer on unmount
    return () => observer.disconnect();
  }, [setTreeRef]);

  const { hasPermission } = usePermissions();

  if (isEmpty(treeData))
    return (
      <div>
        <div className="mt-10 flex h-full w-full items-center justify-center p-8 text-center">
          <p className="mb-1.5 text-sm text-gray-400">
            {t("This page is empty")}
            <br />
            <br />
            {hasPermission(PERMISSIONS.ADD_BLOCK) && (
              <Button
                disabled={!hasPermission(PERMISSIONS.ADD_BLOCK)}
                onClick={() => pubsub.publish(CHAI_BUILDER_EVENTS.OPEN_ADD_BLOCK)}
                variant="default"
                size="sm">
                + {t("Add Block")}
              </Button>
            )}
          </p>
        </div>
      </div>
    );

  return (
    <>
      <div className={cn("flex h-full select-none flex-col space-y-1")} onClick={() => clearSelection()}>
        <div
          id="outline-view"
          className="no-scrollbar h-full overflow-y-auto text-sm"
          onKeyDown={(e) => {
            if (!treeRef.current.isEditing) {
              handleKeyDown(e);
            }
          }}>
          <div className="mb-2 flex items-center justify-end gap-x-2 pb-2 text-sm text-muted-foreground">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setHiddenBlocks([])}
                  variant="outline"
                  className="h-fit p-1 disabled:cursor-not-allowed disabled:opacity-50"
                  size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="isolate z-[9999]">{t("Show hidden blocks")}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="h-fit p-1" onClick={() => treeRef?.current?.openAll()} variant="outline" size="sm">
                  <ChevronsDown size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="isolate z-[9999]">{t("Expand all")}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="h-fit p-1" onClick={() => treeRef?.current?.closeAll()} variant="outline" size="sm">
                  <ChevronsUp size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="isolate z-[9999]">{t("Collapse all")}</TooltipContent>
            </Tooltip>
          </div>
          <div className="group relative z-[9999] ml-5 w-full cursor-pointer">
            <div
              onClick={() => pubsub.publish(CHAI_BUILDER_EVENTS.OPEN_ADD_BLOCK, { position: 0 })}
              className="h-1 w-[90%] rounded bg-purple-500 opacity-0 duration-200 group-hover:opacity-100">
              <div className="absolute left-[45%] top-1/2 flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full bg-purple-500 p-1 outline outline-2 outline-white hover:bg-purple-500">
                <PlusIcon className="h-3 w-3 stroke-[3] text-white" />
              </div>
            </div>
          </div>
          <Tree
            ref={treeRef}
            height={window.innerHeight - 160}
            className="no-scrollbar !h-full max-w-full space-y-1 !overflow-y-auto !overflow-x-hidden"
            rowClassName="flex items-center h-full border-b border-transparent"
            selection={ids[0] || ""}
            onRename={onRename}
            openByDefault={false}
            onMove={onMove}
            data={[...filteredTreeData]}
            renderCursor={DefaultCursor}
            onSelect={onSelect}
            childrenAccessor={(d: any) => d.children}
            width={"100%"}
            rowHeight={28}
            renderDragPreview={DefaultDragPreview}
            indent={10}
            onContextMenu={onContextMenu}
            disableDrop={debouncedDisableDrop as any}
            idAccessor={"_id"}>
            {Node as any}
          </Tree>
        </div>
      </div>
      <PasteAtRootContextMenu parentContext={parentContext} setParentContext={setParentContext} />
    </>
  );
};

export default ListTree;
