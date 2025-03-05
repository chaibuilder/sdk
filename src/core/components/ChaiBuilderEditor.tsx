import { syncBlocksWithDefaults } from "@chaibuilder/runtime";
import { useIntervalEffect } from "@react-hookz/web";
import { FlagsProvider } from "flagged";
import { useAtom } from "jotai/index";
import { each, noop, omit } from "lodash-es";
import React, { useEffect, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { FEATURE_TOGGLES } from "../../FEATURE_TOGGLES.tsx";
import { Toaster } from "../../ui";
import {
  chaiBuilderPropsAtom,
  chaiPageExternalDataAtom,
  chaiRjsfFieldsAtom,
  chaiRjsfTemplatesAtom,
  chaiRjsfWidgetsAtom,
} from "../atoms/builder.ts";
import { builderStore } from "../atoms/store.ts";
import { selectedLibraryAtom } from "../atoms/ui.ts";
import { setDebugLogs } from "../functions/logging.ts";
import { useBlocksStore } from "../history/useBlocksStoreUndoableActions.ts";
import { useBuilderProp, useBuilderReset, useSavePage } from "../hooks";
import { useBroadcastChannel, useUnmountBroadcastChannel } from "../hooks/useBroadcastChannel.ts";
import { useExpandTree } from "../hooks/useExpandTree.ts";
import { useKeyEventWatcher } from "../hooks/useKeyEventWatcher.ts";
import { useWatchPartailBlocks } from "../hooks/usePartialBlocksStore.ts";
import { builderSaveStateAtom } from "../hooks/useSavePage.ts";
import "../index.css";
import i18n from "../locales/load.ts";
import { ChaiBuilderEditorProps } from "../types";
import { FallbackError } from "./FallbackError.tsx";
import { RootLayout } from "./layout/RootLayout.tsx";
import { PreviewScreen } from "./PreviewScreen.tsx";
import { SmallScreenMessage } from "./SmallScreenMessage.tsx";

const useAutoSave = () => {
  const { savePage } = useSavePage();
  const autoSaveSupported = useBuilderProp("autoSaveSupport", true);
  const autoSaveInterval = useBuilderProp("autoSaveInterval", 60);
  useIntervalEffect(() => {
    if (!autoSaveSupported) return;
    savePage(true);
  }, autoSaveInterval * 1000);
};

const ChaiBuilderComponent = (props: ChaiBuilderEditorProps) => {
  const [, setAllBlocks] = useBlocksStore();
  const reset = useBuilderReset();
  const [saveState] = useAtom(builderSaveStateAtom);
  const RootLayoutComponent = useMemo(() => props.layout || RootLayout, [props.layout]);
  useAtom(selectedLibraryAtom);
  useKeyEventWatcher();
  useExpandTree();
  useAutoSave();
  useWatchPartailBlocks();
  useUnmountBroadcastChannel();
  const { postMessage } = useBroadcastChannel();

  useEffect(() => {
    builderStore.set(
      // @ts-ignore
      chaiBuilderPropsAtom,
      omit(props, [
        "blocks",
        "subPages",
        "brandingOptions",
        "dataProviders",
        "customRootLayout",
        "translations",
        "rjsfFields",
        "rjsfWidgets",
        "rjsfTemplates",
        "pageExternalData",
      ]),
    );
  }, [props]);

  useEffect(() => {
    builderStore.set(chaiPageExternalDataAtom, props.pageExternalData || {});
  }, [props.pageExternalData]);

  useEffect(() => {
    builderStore.set(chaiRjsfFieldsAtom, props.rjsfFields || {});
    builderStore.set(chaiRjsfWidgetsAtom, props.rjsfWidgets || {});
    builderStore.set(chaiRjsfTemplatesAtom, props.rjsfTemplates || {});
  }, [props.rjsfFields, props.rjsfWidgets, props.rjsfTemplates]);

  useEffect(() => {
    // Added delay to allow the pageId to be set
    setTimeout(() => {
      const withDefaults = syncBlocksWithDefaults(props.blocks || []);
      // @ts-ignore
      setAllBlocks(withDefaults);
      if (withDefaults && withDefaults.length > 0) {
        postMessage({ type: "blocks-updated", blocks: withDefaults });
      }
      reset();
    }, 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.blocks]);

  useEffect(() => {
    i18n.changeLanguage(props.locale || "en");
  }, [props.locale]);

  useEffect(() => {
    setDebugLogs(props.showDebugLogs);
  }, [props.showDebugLogs]);

  useEffect(() => {
    if (!props.translations) return;
    each(props.translations, (translations: any, lng: string) => {
      i18n.addResourceBundle(lng, "translation", translations, true, true);
    });
  }, [props.translations]);

  useEffect(() => {
    if (saveState !== "SAVED") {
      window.onbeforeunload = () => "";
    } else {
      window.onbeforeunload = null;
    }

    return () => {
      window.onbeforeunload = null;
    };
  }, [saveState]);

  return <RootLayoutComponent />;
};
/**
 * ChaiBuilder is the main entry point for the Chai Builder Studio.
 */
const ChaiBuilderEditor: React.FC<ChaiBuilderEditorProps> = (props: ChaiBuilderEditorProps) => {
  const _flags = props._flags || {};
  const onErrorFn = props.onError || noop;
  return (
    <div className="h-screen w-screen">
      <ErrorBoundary fallback={<FallbackError />} onError={onErrorFn}>
        <FlagsProvider features={{ ...FEATURE_TOGGLES, ..._flags }}>
          <SmallScreenMessage />
          <ChaiBuilderComponent {...props} />
          <PreviewScreen />
          <Toaster />
        </FlagsProvider>
      </ErrorBoundary>
    </div>
  );
};

export { ChaiBuilderEditor };
