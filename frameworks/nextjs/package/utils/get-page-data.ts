import { ChaiBlock } from "@chaibuilder/runtime";
import { getChaiCollection, getChaiPageType } from "@chaibuilder/sdk/server";
import { get } from "lodash";

export async function getPageData(args: {
  blocks: ChaiBlock[];
  pageProps: Record<string, unknown>;
  pageType: string;
  lang: string;
  draftMode: boolean;
}): Promise<Record<string, unknown>> {
  const { blocks, pageProps, pageType, lang, draftMode } = args;
  
  // getChaiGlobalData is not exported from SDK, we'll need to implement it differently
  const getChaiGlobalData = async () => {
    // This would typically call a registered global data provider
    // For now, return empty object as placeholder
    return {};
  };

  const registeredPageType = getChaiPageType(pageType);

  // Get all collection repeater blocks
  const collectionRepeaterBlocks = blocks.filter(
    (block) => block._type === "Repeater" && block?.repeaterItems?.includes("{{#"),
  );

  let collectionData: Record<string, unknown> = {};
  if (collectionRepeaterBlocks.length > 0) {
    const collectionKeys = collectionRepeaterBlocks.map((block) => {
      const collectionId: string = block.repeaterItems.replace("{{#", "").replace("}}", "");
      return { collectionId, block };
    });

    const collectionBlocks = await Promise.all(
      collectionKeys.map(async ({ collectionId, block }) => {
        const chaiCollection = getChaiCollection(collectionId);
        try {
          const data = await chaiCollection?.fetch({
            lang,
            draft: draftMode,
            inBuilder: false,
            pageProps,
            block,
          });
          return Promise.resolve({
            [`#${collectionId}/${block._id}`]: get(data, "items", []) ?? [],
            [`#${collectionId}/${block._id}/totalItems`]: get(data, "totalItems", -1) ?? -1,
          });
        } catch {
          return Promise.resolve({
            [`#${collectionId}/${block._id}`]: [],
            [`#${collectionId}/${block._id}/totalItems`]: -1,
          });
        }
      }),
    );
    collectionData = collectionBlocks.reduce((acc, block) => {
      return { ...acc, ...block };
    }, {});
  }

  const [globalData, pageData] = await Promise.all([
    getChaiGlobalData(),
    registeredPageType?.dataProvider?.({ lang, draft: draftMode, inBuilder: false, pageProps }) ||
      Promise.resolve({}),
  ]);

  if (!registeredPageType) return { global: globalData, ...collectionData };

  return {
    ...pageData,
    global: globalData,
    ...collectionData,
  };
}
