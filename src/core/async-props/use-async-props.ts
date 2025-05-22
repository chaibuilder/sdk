import { ChaiBlock } from "@chaibuilder/runtime";
import { isObject } from "@rjsf/utils";
import { atom, useAtom, useSetAtom } from "jotai";
import { get, isArray, isFunction, pick, startsWith, values } from "lodash-es";
import { useEffect, useState } from "react";
import { COLLECTION_PREFIX } from "../constants/STRINGS";
import { useBuilderProp } from "../hooks";

type BlockAsyncProps = {
  status: "idle" | "loading" | "loaded" | "error";
  props: Record<string, any>;
  error?: any;
  repeaterItems?: string;
};

type BlockRepeaterDataAtom = Record<string, BlockAsyncProps>;

export const blockRepeaterDataAtom = atom<BlockRepeaterDataAtom>({});
blockRepeaterDataAtom.debugLabel = "blockRepeaterDataAtom";

export const useBlockRepeaterDataAtom = () => useAtom(blockRepeaterDataAtom);

export const useAsyncProps = (
  block: ChaiBlock,
  dataProviderMode: "live" | "mock",
  dependencies?: string[],
  mockDataProvider?: (args: { block: ChaiBlock }) => object,
) => {
  const [asyncProps, setAsyncProps] = useState<BlockAsyncProps>({
    status: "idle",
    props: {},
    error: undefined,
  });

  const getAsyncBlockProps = useBuilderProp("getBlockAsyncProps", async (_args: { block: ChaiBlock }) => ({}));
  const setBlockRepeaterDataAtom = useSetAtom(blockRepeaterDataAtom);
  const depsString = JSON.stringify([block?._id, ...values(pick(block, dependencies ?? []))]);
  const isCollectionRepeater = block?._type === "Repeater" && startsWith(block.repeaterItems, `{{${COLLECTION_PREFIX}`);
  const isCustomBlockDataProvider = block?._type !== "Repeater" && dataProviderMode === "live";

  useEffect(() => {
    if (dataProviderMode === "mock") {
      if (isFunction(mockDataProvider)) {
        setAsyncProps((prev) => ({ ...prev, status: "loading", props: {} }));
        const result = mockDataProvider({ block });
        if (!isObject(result)) {
          throw new Error("mockDataProvider should return an object");
        }
        setAsyncProps((prev) => ({ ...prev, status: "loaded", props: result }));
      }
      return;
    }

    if (dataProviderMode !== "live") return;
    if (!isCollectionRepeater && !isCustomBlockDataProvider) return;

    setAsyncProps((prev) => ({ ...prev, status: "loading", props: {} }));
    getAsyncBlockProps({ block })
      .then((props = {}) => {
        if (isCollectionRepeater) {
          // set the props to a global state
          setBlockRepeaterDataAtom((prev) => ({
            ...prev,
            [block._id]: { status: "loaded", props: isArray(props) ? props : [], repeaterItems: block.repeaterItems },
          }));
          setAsyncProps((prev) => ({ ...prev, status: "loaded" }));
        } else {
          setAsyncProps((prev) => ({ ...prev, status: "loaded", props: isObject(props) ? props : {} }));
        }
      })
      .catch((error) => {
        if (isCollectionRepeater) {
          setBlockRepeaterDataAtom((prev) => ({
            ...prev,
            [block._id]: { status: "error", error, props: [] },
          }));
          setAsyncProps((prev) => ({ ...prev, status: "error", error }));
        } else {
          setAsyncProps((prev) => ({ ...prev, status: "error", error, props: {} }));
        }
      });
  }, [block?._id, depsString, isCollectionRepeater, isCustomBlockDataProvider, mockDataProvider, dataProviderMode]);

  const status = get(asyncProps, `status`);
  return {
    $loading: status === "loading",
    ...(block ? get(asyncProps, `props`, {}) : {}),
  };
};
