import "react-quill/dist/quill.snow.css";
import "../index.css";
import { DevTools } from "jotai-devtools";
import { i18n } from "../locales/load";
import { FlagsProvider } from "flagged";
import { useEffect, useMemo } from "react";
import { omit } from "lodash-es";
import { FEATURE_TOGGLES } from "../../FEATURE_TOGGLES.tsx";
import { chaiBuilderPropsAtom } from "../atoms/builder.ts";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { RootLayout } from "../components/RootLayout";
import { builderStore } from "../atoms/store.ts";
import { Toaster } from "../../ui";
import { useBrandingOptions, useBuilderReset } from "../hooks";
import { ChaiBuilderEditorProps } from "../types/chaiBuilderEditorProps.ts";
import { dataProvidersAtom } from "../hooks/usePageDataProviders.ts";
import { useBlocksStore } from "../history/useBlocksStoreUndoableActions.ts";
import { MobileMessage } from "./MobileMessage.tsx";
import { setDebugLogs } from "../functions/logging.ts";
import { syncBlocksWithDefaults } from "@chaibuilder/runtime";

const ChaiBuilderComponent = (props: ChaiBuilderEditorProps) => {
  const [, setAllBlocks] = useBlocksStore();
  const [, setBrandingOptions] = useBrandingOptions();
  const reset = useBuilderReset();
  const RootLayoutComponent = useMemo(() => props.customRootLayout || RootLayout, [props.customRootLayout]);

  useEffect(() => {
    builderStore.set(
      // @ts-ignore
      chaiBuilderPropsAtom,
      omit(props, ["blocks", "subPages", "brandingOptions", "dataProviders", "customRootLayout"]),
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
    setBrandingOptions(props.brandingOptions);
  }, [props.brandingOptions, setBrandingOptions]);

  return <RootLayoutComponent />;
};

/**
 * ChaiBuilder is the main entry point for the Chai Builder Studio.
 * @param props
 * @constructor
 */
const ChaiBuilderEditor = (props: ChaiBuilderEditorProps) => {
  const _flags = props._flags || {};
  return (
    <ErrorBoundary>
      <FlagsProvider features={{ ...FEATURE_TOGGLES, ..._flags }}>
        <DevTools />
        <MobileMessage />
        <ChaiBuilderComponent {...props} />
      </FlagsProvider>
      <Toaster />
    </ErrorBoundary>
  );
};

export { ChaiBuilderEditor };
