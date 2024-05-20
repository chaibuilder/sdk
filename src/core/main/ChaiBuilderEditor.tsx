import "react-quill/dist/quill.snow.css";
import "../index.css";
import { DevTools } from "jotai-devtools";
import i18n from "../locales/load";
import { FlagsProvider } from "flagged";
import { useEffect } from "react";
import { DndProvider } from "react-dnd";
import { omit } from "lodash-es";
import { getBackendOptions, MultiBackend } from "@minoru/react-dnd-treeview";
import { FEATURE_TOGGLES } from "../FEATURE_TOGGLES";
import { chaiBuilderPropsAtom } from "../atoms/builder.ts";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { RootLayout } from "../components/RootLayout";
import { builderStore } from "../atoms/store.ts";
import { Toaster } from "../../ui";
import { useBrandingOptions, useBuilderReset, useSetAllBlocks } from "../hooks";
import { syncBlocksWithDefaults } from "@chaibuilder/runtime";
import { ChaiBuilderEditorProps } from "../types/chaiBuilderEditorProps.ts";
import { dataProvidersAtom } from "../hooks/usePageDataProviders.ts";

if (import.meta.env.NODE_ENV === "development") {
  console.log("Chai Builder:", i18n);
}

const DragLayerComponent = (props: any) => {
  return <>{props.children}</>;
};

const ChaiBuilderComponent = (props: ChaiBuilderEditorProps) => {
  const { dndOptions = { backend: MultiBackend } } = props;
  const [setAllBlocks] = useSetAllBlocks();
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
    setAllBlocks(syncBlocksWithDefaults(props.blocks || []));
    reset();
  }, [props.blocks]);

  useEffect(() => {
    i18n.changeLanguage(props.locale || "en");
  }, [props.locale]);

  useEffect(() => {
    setBrandingOptions(props.brandingOptions);
  }, [props.brandingOptions, setBrandingOptions]);

  return (
    <DndProvider {...dndOptions} options={getBackendOptions()}>
      <DragLayerComponent>
        <RootLayout />
      </DragLayerComponent>
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
      <ChaiBuilderComponent {...props} />
    </FlagsProvider>
    <Toaster />
  </ErrorBoundary>
);

export { ChaiBuilderEditor };
