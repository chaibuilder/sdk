import TreeModel from "tree-model";
import { ChaiBuilderBlockWithAtom, convertToBlocksAtoms } from "../atoms/blocks.ts";
import { getBlocksTree } from "../functions/split-blocks.ts";
import { ChaiBlock } from "../types/ChaiBlock.ts";

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
  if (nodeToMove && newParentNode) {
    nodeToMove.drop();
    // Insert the node at the new parent at the specified position
    if (!newParentNode.children) {
      newParentNode.model.children = [];
    }
    try {
      newParentNode.addChildAtIndex(nodeToMove, position);
    } catch (error) {
      console.error("Error adding child to parent:", error);
      return false;
    }
    return true;
  }

  return false;
}

function moveBlocksWithChildren(
  _blocks: ChaiBuilderBlockWithAtom[],
  idToMove: string,
  newParentId: string | undefined | null,
  newPosition: number,
  updateBlockAtom: (block: Partial<ChaiBlock>) => void,
): ChaiBuilderBlockWithAtom[] {
  if (!idToMove) return _blocks;
  newParentId = newParentId || "root";
  const tree = new TreeModel();
  const root = tree.parse({ _id: "root", children: getBlocksTree(_blocks) });

  if (moveNode(root, idToMove, newParentId, newPosition)) {
    const newBlocks = flattenTree(root);
    const movedBlock = newBlocks.find((block) => block._id === idToMove);

    if (movedBlock) {
      movedBlock._parent = newParentId === "root" ? null : newParentId;
      updateBlockAtom({ id: movedBlock._id, props: { _parent: movedBlock._parent } });
    }
    newBlocks.shift();
    return convertToBlocksAtoms(newBlocks as ChaiBlock[]);
  }
  return _blocks;
}

export { moveBlocksWithChildren };
