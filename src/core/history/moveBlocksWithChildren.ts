import { ChaiBlock } from "../types/ChaiBlock.ts";
import { getBlocksTree } from "../functions/split-blocks.ts";
import TreeModel from "tree-model";

// Convert the tree back to a flat array
function flattenTree(node: TreeModel.Node<Partial<ChaiBlock>>): Partial<ChaiBlock>[] {
  let flatArray: ChaiBlock[] = [];
  node.walk((n) => {
    delete n.model.children;
    flatArray.push(n.model);
    return true; // Continue traversal
  });
  return flatArray;
}

// Function to find a node by its _id
function findNodeById(node: TreeModel.Node<Partial<ChaiBlock>>, id: string): TreeModel.Node<Partial<ChaiBlock>> | null {
  return node.first((n) => n.model._id === id) || null;
}

function moveNode(
  rootNode: TreeModel.Node<Partial<ChaiBlock>>,
  nodeIdToMove: string,
  newParentId: string,
  position: number,
): boolean {
  const nodeToMove = findNodeById(rootNode, nodeIdToMove);
  const newParentNode = findNodeById(rootNode, newParentId);
  if (!nodeToMove || !newParentNode) return false;

  if (!newParentNode.children) {
    newParentNode.model.children = [];
  }

  let currentPosition = newParentNode?.children?.findIndex((child) => child.model._id === nodeIdToMove);

  nodeToMove.drop();

  currentPosition = Math.max(currentPosition, 0);
  const currentParentId = nodeToMove?.model?._parent || "root";
  const newPosition = currentParentId === newParentId && currentPosition <= position ? position - 1 : position;

  try {
    newParentNode.addChildAtIndex(nodeToMove, newPosition);
  } catch (error) {
    return false;
  }

  return true;
}

function moveBlocksWithChildren(
  _blocks: Partial<ChaiBlock>[],
  idToMove: string,
  newParentId: string | undefined | null,
  newPosition: number,
): Partial<ChaiBlock>[] {
  if (!idToMove) return _blocks;
  newParentId = newParentId || "root";
  const tree = new TreeModel();
  const root = tree.parse({ _id: "root", children: getBlocksTree(_blocks) });

  if (moveNode(root, idToMove, newParentId, newPosition)) {
    const newBlocks = flattenTree(root);
    const movedBlock = newBlocks.find((block) => block._id === idToMove);

    if (movedBlock) movedBlock._parent = newParentId === "root" ? null : newParentId;
    newBlocks.shift();
    return newBlocks;
  }
  return _blocks;
}

export { moveBlocksWithChildren };
