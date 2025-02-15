import { getRegisteredChaiBlock } from "@chaibuilder/runtime";
import { get, has } from "lodash-es";

type BlockDefinition = {
  canAcceptBlock?: (target: string) => boolean;
  canDelete?: () => boolean;
  canDuplicate?: () => boolean;
  canMove?: () => boolean;
  canBeNested?: (target: string) => boolean;
};

export const canAcceptChildBlock = (parentType: string, childType: string) => {
  if (!parentType) return true; // this is root
  const blockDefinition = getRegisteredChaiBlock(parentType) as BlockDefinition;
  if (!blockDefinition) return false;
  return has(blockDefinition, "canAcceptBlock") ? blockDefinition.canAcceptBlock(childType) : false; //defaults to false
};

export const canAddChildBlock = (parentType: string) => {
  const blockDefinition = getRegisteredChaiBlock(parentType) as BlockDefinition;
  if (!blockDefinition) return false;
  return has(blockDefinition, "canAcceptBlock"); //defaults to false
};

export const canBeNestedInside = (parentType: string, childType: string) => {
  const blockDefinition = getRegisteredChaiBlock(childType) as BlockDefinition;
  if (!blockDefinition) return true;
  return has(blockDefinition, "canBeNested") ? blockDefinition.canBeNested(parentType) : true;
};

export const canDuplicateBlock = (type: string) => {
  const blockDefinition = getRegisteredChaiBlock(type) as BlockDefinition;
  if (!blockDefinition) return true;
  return has(blockDefinition, "canDuplicate") ? blockDefinition.canDuplicate() : true;
};

export const canDeleteBlock = (type: string) => {
  const blockDefinition = getRegisteredChaiBlock(type) as BlockDefinition;
  if (!blockDefinition) return true;
  return has(blockDefinition, "canDelete") ? blockDefinition.canDelete() : true;
};

export const canDropBlock = (_currentTree: any, { dragSource, dropTarget }: any) => {
  const dragSourceType = get(dragSource, "data._type", "");
  const dropTargetType = get(dropTarget, "data._type", "");
  return canAcceptChildBlock(dropTargetType, dragSourceType);
};

if (import.meta.vitest) {
  describe("canDropBlock Function", () => {
    it('should return false if dragSourceType is "Slot"', () => {
      const dragSource = { data: { _type: "Slot" } };
      const dropTarget = { data: {} };
      expect(canDropBlock({}, { dragSource, dropTarget })).toBe(true);
    });

    it("should return true if dropTargetType is empty", () => {
      const dragSource = { data: { _type: "Box" } };
      const dropTarget = { data: {} };
      expect(canDropBlock({}, { dragSource, dropTarget })).toBe(true);
    });
  });
}
