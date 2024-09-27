import "react-quill/dist/quill.snow.css";
import "../index.css";
import { DevTools } from "jotai-devtools";
import i18n from "../locales/load.ts";
import { FlagsProvider } from "flagged";
import React, { useEffect, useMemo } from "react";
import { each, noop, omit } from "lodash-es";
import { FEATURE_TOGGLES } from "../../FEATURE_TOGGLES.tsx";
import { chaiBuilderPropsAtom } from "../atoms/builder.ts";
import { ErrorBoundary } from "react-error-boundary";
import { RootLayout } from "./layout/RootLayout.tsx";
import { builderStore } from "../atoms/store.ts";
import { Toaster } from "../../ui";
import { useBrandingOptions, useBuilderReset } from "../hooks";
import { ChaiBuilderEditorProps } from "../types/chaiBuilderEditorProps.ts";
import { dataProvidersAtom } from "../hooks/usePageDataProviders.ts";
import { useBlocksStore } from "../history/useBlocksStoreUndoableActions.ts";
import { SmallScreenMessage } from "./SmallScreenMessage.tsx";
import { setDebugLogs } from "../functions/logging.ts";
import { syncBlocksWithDefaults } from "@chaibuilder/runtime";
import { useAtom } from "jotai/index";
import { builderSaveStateAtom } from "../hooks/useSavePage.ts";
import { PreviewScreen } from "./PreviewScreen.tsx";
import { FallbackError } from "./FallbackError.tsx";

const ChaiBuilderComponent = (props: ChaiBuilderEditorProps) => {
  const [, setAllBlocks] = useBlocksStore();
  const [, setBrandingOptions] = useBrandingOptions();
  const reset = useBuilderReset();
  const [saveState] = useAtom(builderSaveStateAtom);
  const RootLayoutComponent = useMemo(() => props.layout || RootLayout, [props.layout]);

  useEffect(() => {
    builderStore.set(
      // @ts-ignore
      chaiBuilderPropsAtom,
      omit(props, ["blocks", "subPages", "brandingOptions", "dataProviders", "customRootLayout", "translations"]),
    );
  }, [props]);

  useEffect(() => {
    builderStore.set(dataProvidersAtom, props.dataProviders || []);
  }, [props.dataProviders]);

  useEffect(() => {
    // @ts-ignore
    setAllBlocks(syncBlocksWithDefaults(props.blocks || []) as ChaiBlock[]);
    reset();
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
    setBrandingOptions(props.brandingOptions);
  }, [props.brandingOptions, setBrandingOptions]);

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
          <DevTools />
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
