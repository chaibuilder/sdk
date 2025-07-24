import { ChaiBlock, ChaiPageProps } from "@chaibuilder/runtime";
import { has, isFunction, omit, pick } from "lodash-es";
import React from "react";

type DataProvider = (props: {
  draft: boolean;
  inBuilder: boolean;
  lang: string;
  block: ChaiBlock;
  pageProps: ChaiPageProps;
}) => Record<string, any> | Promise<Record<string, any>>;

// Cache for memoizing data provider results
const dataProviderCache = new Map<string, Promise<Record<string, any>>>();

// Create a cache key based on the data provider arguments
function createCacheKey(args: { block: ChaiBlock; lang: string }): string {
  return JSON.stringify({
    blockType: omit(args.block, "_id", "_name", "_parent"),
    lang: args.lang,
  });
}

export default async function DataProviderPropsBlock(props: {
  lang: string;
  pageProps: ChaiPageProps;
  block: ChaiBlock;
  dataProvider: DataProvider;
  dataProviderMetadataCallback?: (block: ChaiBlock, meta: Record<string, any>) => void;
  draft: boolean;
  children: (dataProviderProps: Record<string, any>) => React.ReactNode;
}) {
  const dataProviderArgs = {
    pageProps: props.pageProps,
    block: props.block,
    lang: props.lang,
    draft: props.draft,
    inBuilder: false,
  };
  const cacheKey = createCacheKey(pick(dataProviderArgs, ["block", "lang"]));
  // Check if we have a cached result
  let dataPropsPromise = dataProviderCache.get(cacheKey);

  if (!dataPropsPromise) {
    // Create and cache the promise, ensuring it's always a promise
    dataPropsPromise = Promise.resolve(props.dataProvider(dataProviderArgs));
    dataProviderCache.set(cacheKey, dataPropsPromise);

    // Optional: Clean up cache after some time to prevent memory leaks
    setTimeout(() => {
      dataProviderCache.delete(cacheKey);
    }, 5 * 1000); // 5 seconds
  }

  const dataProps = await dataPropsPromise;

  if (has(dataProps, "$metadata") && isFunction(props.dataProviderMetadataCallback)) {
    props.dataProviderMetadataCallback(props.block, dataProps.$metadata);
  }

  return props.children({
    ...omit(dataProps, "$metadata"),
  });
}
