import { chaiBuilderPropsAtom, chaiPageExternalDataAtom } from "@/core/atoms/builder.ts";
import { builderStore } from "@/core/atoms/store.ts";
import { selectedLibraryAtom } from "@/core/atoms/ui.ts";
import { CssThemeVariables } from "@/core/components/css-theme-var.tsx";
import { FallbackError } from "@/core/components/fallback-error";
import { RootLayout } from "@/core/components/layout/root-layout.tsx";
import { PreviewScreen } from "@/core/components/PreviewScreen.tsx";
import { SmallScreenMessage } from "@/core/components/SmallScreenMessage.tsx";
import { setDebugLogs } from "@/core/functions/logging.ts";
import { useBlocksStore } from "@/core/history/useBlocksStoreUndoableActions.ts";
import { defaultThemeValues } from "@/core/hooks/defaultThemeOptions.ts";
import { useBuilderProp, useBuilderReset, useSavePage } from "@/core/hooks/index.ts";
import { useBroadcastChannel, useUnmountBroadcastChannel } from "@/core/hooks/useBroadcastChannel.ts";
import { useExpandTree } from "@/core/hooks/useExpandTree.ts";
import { useKeyEventWatcher } from "@/core/hooks/useKeyEventWatcher.ts";
import { useWatchPartailBlocks } from "@/core/hooks/usePartialBlocksStore.ts";
import { builderSaveStateAtom } from "@/core/hooks/useSavePage.ts";
import "@/core/index.css";
import i18n from "@/core/locales/load.ts";
import { FEATURE_TOGGLES } from "@/FEATURE_TOGGLES";
import { ChaiBuilderEditorProps } from "@/types/index.ts";
import { ChaiBuilderThemeValues } from "@/types/types";
import { Toaster } from "@/ui/shadcn/components/ui/sooner.tsx";
import { syncBlocksWithDefaults } from "@chaibuilder/runtime";
import { useIntervalEffect } from "@react-hookz/web";
import { FlagsProvider } from "flagged";
import { useAtom } from "jotai/index";
import { each, noop, omit } from "lodash-es";
import React, { useEffect, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";

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
  const builderTheme = useBuilderProp("builderTheme", defaultThemeValues);
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
      omit(props, ["blocks", "translations", "pageExternalData"]),
    );
  }, [props]);

  useEffect(() => {
    builderStore.set(chaiPageExternalDataAtom, props.pageExternalData || {});
  }, [props.pageExternalData]);

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
    setDebugLogs(props.debugLogs);
  }, [props.debugLogs]);

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

  return (
    <>
      <CssThemeVariables theme={builderTheme as ChaiBuilderThemeValues} />
      <RootLayoutComponent />
    </>
  );
};
/**
 * ChaiBuilder is the main entry point for the Chai Builder Studio.
 */
const ChaiBuilderEditor: React.FC<ChaiBuilderEditorProps> = (props: ChaiBuilderEditorProps) => {
  const onErrorFn = props.onError || noop;
  return (
    <div className="h-screen w-screen">
      <ErrorBoundary fallback={<FallbackError />} onError={onErrorFn}>
        <FlagsProvider features={{ ...FEATURE_TOGGLES }}>
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
