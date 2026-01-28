import { getSplitChaiClasses } from "@/hooks/get-split-classes";
import { ChaiBlock } from "@/types/common";
import { cloneDeep, flattenDeep, get, isEmpty, last } from "lodash-es";

/**
 * Recursively merges partial blocks into the main blocks array
 * @param blocks - Array of blocks to process
 * @param partials - Record of partial block definitions
 * @param visitedStack - Stack tracking currently processing partials to detect circular dependencies
 * @returns Merged blocks array with all partials resolved
 * @throws Error if circular dependency is detected
 */
export function getMergedPartialBlocks(
  blocks: ChaiBlock[],
  partials: Record<string, ChaiBlock[]>,
  visitedStack: string[] = [],
): ChaiBlock[] {
  const partialBlocksList = blocks.filter((block) => block._type === "GlobalBlock" || block._type === "PartialBlock");

  for (let i = 0; i < partialBlocksList.length; i++) {
    const partialBlock = partialBlocksList[i];
    const partialBlockId = get(partialBlock, "partialBlockId", get(partialBlock, "globalBlock", ""));
    if (partialBlockId === "") continue;

    // Check for circular dependency
    if (visitedStack.includes(partialBlockId)) {
      const circularChain = [...visitedStack, partialBlockId].join(" -> ");
      throw new Error(
        `Circular dependency detected in partial blocks: ${circularChain}. ` +
          `Partial "${partialBlockId}" is already being processed in the dependency chain.`,
      );
    }

    let partialBlocks = cloneDeep(get(partials, partialBlockId, []));
    if (partialBlock._parent && partialBlocks?.length > 0) {
      partialBlocks = partialBlocks.map((block) => {
        if (isEmpty(block._parent)) {
          block._parent = partialBlock._parent;
        }
        return block;
      });
    }

    // Recursively process nested partials in the fetched partial blocks
    if (partialBlocks.length > 0) {
      partialBlocks = getMergedPartialBlocks(partialBlocks, partials, [...visitedStack, partialBlockId]);
    }

    const index = blocks.indexOf(partialBlock);
    blocks.splice(index, 1, ...partialBlocks);
  }

  return blocks;
}

/**
 * Checks if adding blocks with partial references would create a circular dependency
 * @param blocksToAdd - Blocks being added that may contain partial references
 * @param partialBlockId - The ID of the partial being edited (if applicable)
 * @param partials - Record of partial block definitions
 * @returns Object with hasCircularDependency flag and error message if circular dependency exists
 */
export function checkCircularDependency(
  blocksToAdd: ChaiBlock[],
  partialBlockId: string | undefined,
  partials: Record<string, ChaiBlock[]>,
): { hasCircularDependency: boolean; error?: string } {
  if (!partialBlockId) {
    return { hasCircularDependency: false };
  }

  // Find all partial references in the blocks being added
  const partialRefs = blocksToAdd.filter((block) => block._type === "GlobalBlock" || block._type === "PartialBlock");

  // Check each partial reference for circular dependencies
  for (const partialRef of partialRefs) {
    const refId = get(partialRef, "partialBlockId", get(partialRef, "globalBlock", ""));
    if (refId === "") continue;

    // Direct self-reference
    if (refId === partialBlockId) {
      return {
        hasCircularDependency: true,
        error: `Cannot add partial "${partialBlockId}" to itself. This would create a direct circular dependency.`,
      };
    }

    // Check if this ref would create a circular dependency
    // We need to trace the dependency chain from refId to see if it leads back to partialBlockId
    try {
      const visited = new Set<string>();
      const queue = [refId];

      while (queue.length > 0) {
        const currentId = queue.shift()!;

        // If we've already checked this one, skip it to avoid infinite loop
        if (visited.has(currentId)) continue;
        visited.add(currentId);

        // If we reached back to the original partial, we have a cycle
        if (currentId === partialBlockId) {
          const chain = [partialBlockId, refId, ...(currentId !== refId ? [currentId] : [])].join(" -> ");
          return {
            hasCircularDependency: true,
            error: `Circular dependency detected: ${chain}. Adding this block would create a circular reference.`,
          };
        }

        // Get blocks for this partial and check for more partial references
        const currentPartialBlocks = partials[currentId] || [];
        const nestedRefs = currentPartialBlocks.filter(
          (block) => block._type === "GlobalBlock" || block._type === "PartialBlock",
        );

        for (const nestedRef of nestedRefs) {
          const nestedRefId = get(nestedRef, "partialBlockId", get(nestedRef, "globalBlock", ""));
          if (nestedRefId !== "" && !visited.has(nestedRefId)) {
            queue.push(nestedRefId);
          }
        }
      }
    } catch (error) {
      // If we can't check, allow it (fail open)
      continue;
    }
  }

  return { hasCircularDependency: false };
}

/**
 * This function adds the prefix to the classes
 * @param classes
 * @param prefix
 */
export const addPrefixToClasses = (classes: string, prefix: string = "") => {
  const { classes: classesString } = getSplitChaiClasses(classes);
  const array = classesString.split(" ").map((item) => {
    const classes = item.split(" ");
    const newClasses = classes.map((item) => {
      if (item === "") return "";
      // if the class had a state of media query, then prefix the classes
      // eg: dark:hover:bg-red-500 => dark:hover:c-bg-red-500
      // eg: hover:bg-red-500 => hover:c-bg-red-500
      if (item.includes(":")) {
        const values = item.split(":");
        // replace the last value from values with prefixedClass
        values[values.length - 1] = prefix + last(values);
        return values.join(":");
      }
      return `${prefix}${item}`;
    });
    return newClasses.join(" ");
  });
  return flattenDeep(array).join(" ");
};

/**
 * This function converts the chai format content to chai blocks
 * @param chaiFormatContent
 */
export const convertToBlocks = (chaiFormatContent: string): ChaiBlock[] => {
  if (!chaiFormatContent) return [];
  try {
    const blocks = JSON.parse(removeAssetPrefix(chaiFormatContent));
    //remove the blocks whose _type starts with @chai
    return blocks.filter((block: ChaiBlock) => !block._type.startsWith("@chai"));
  } catch (_error) {
    return [{ _type: "Paragraph", _id: "error", content: "Invalid JSON. Please check the JSON string." }];
  }
};

/**
 * This function removes the "asset://" prefix from asset URLs in the input string.
 * This is important for chai files generated by Chai Studio.
 * This is how urls are generated in Tauri apps Before rendering to HTML need to convert them into
 * relative paths
 * @param input
 */
function removeAssetPrefix(input: string): string {
  // Step 1: Find the asset URL
  const regex = /(asset:\/\/|https:\/\/asset\.localhost\/)(?:localhost\/)?[^"']+/g;

  return input.replace(regex, (match) => {
    // Step 2: Decode the entire URL
    const decodedUrl = decodeURIComponent(match);

    // Step 3: Remove the part up to and including "public"
    const publicIndex = decodedUrl.indexOf("public");
    if (publicIndex !== -1) {
      return decodedUrl.substring(publicIndex + 6); // +6 to remove "public"
    }

    // If "public" is not found, return the entire decoded URL
    return decodedUrl;
  });
}
