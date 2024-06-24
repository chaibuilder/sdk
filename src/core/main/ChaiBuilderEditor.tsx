import "react-quill/dist/quill.snow.css";
import "../index.css";
import { DevTools } from "jotai-devtools";
import i18n from "../locales/load";
import { FlagsProvider } from "flagged";
import { useEffect } from "react";
import { DndProvider } from "react-dnd";
import { omit } from "lodash-es";
import { getBackendOptions, MultiBackend } from "@minoru/react-dnd-treeview";
import { FEATURE_TOGGLES } from "../../FEATURE_TOGGLES.tsx";
import { chaiBuilderPropsAtom } from "../atoms/builder.ts";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { RootLayout } from "../components/RootLayout";
import { builderStore } from "../atoms/store.ts";
import { Toaster } from "../../ui";
import { useBrandingOptions, useBuilderReset } from "../hooks";
import { syncBlocksWithDefaults } from "@chaibuilder/runtime";
import { ChaiBuilderEditorProps } from "../types/chaiBuilderEditorProps.ts";
import { dataProvidersAtom } from "../hooks/usePageDataProviders.ts";
import { useBlocksStore } from "../history/useBlocksStoreUndoableActions.ts";
import { ChaiBlock } from "../types/ChaiBlock.ts";
import { MobileMessage } from "./MobileMessage.tsx";
import { setDebugLogs } from "../functions/logging.ts";

const ChaiBuilderComponent = (props: ChaiBuilderEditorProps) => {
  const { dndOptions = { backend: MultiBackend, options: getBackendOptions() } } = props;
  const [, setAllBlocks] = useBlocksStore();
  const [, setBrandingOptions] = useBrandingOptions();
  const reset = useBuilderReset();

  useEffect(() => {
    builderStore.set(
      // @ts-ignore
      chaiBuilderPropsAtom,
      omit(props, ["blocks", "subPages", "brandingOptions", "dataProviders"]),
    );
  }, [props]);

  useEffect(() => {
    builderStore.set(dataProvidersAtom, props.dataProviders || []);
  }, [props.dataProviders]);

  useEffect(() => {
    // @ts-ignore
    setAllBlocks(syncBlocksWithDefaults(props.blocks || []) as ChaiBlock[]);
    reset();
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

  return (
    <DndProvider {...dndOptions}>
      <RootLayout />
    </DndProvider>
  );
};

/**
 * ChaiBuilder is the main entry point for the Chai Builder Studio.
 * @param props
 * @constructor
 */
const ChaiBuilderEditor = (props: ChaiBuilderEditorProps) => (
  <ErrorBoundary>
    <FlagsProvider features={FEATURE_TOGGLES}>
      <DevTools />
      <MobileMessage />
      <ChaiBuilderComponent {...props} />
    </FlagsProvider>
    <Toaster />
  </ErrorBoundary>
);

export { ChaiBuilderEditor };
