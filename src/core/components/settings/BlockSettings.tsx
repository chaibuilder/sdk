import { IChangeEvent } from "@rjsf/core";
import { capitalize, cloneDeep, debounce, each, get, isEmpty, keys, map, forEach } from "lodash-es";
import {
  useBuilderProp,
  useLanguages,
  useSelectedBlock,
  useTranslation,
  useUpdateBlocksProps,
  useUpdateBlocksPropsRealtime,
} from "../../hooks";
import { ChaiControlDefinition } from "@chaibuilder/runtime/controls";
import DataBindingSetting from "../../rjsf-widgets/data-binding.tsx";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button } from "../../../ui";
import { useCallback, useMemo, useState } from "react";
import { getBlockComponent } from "@chaibuilder/runtime";
import { JSONForm } from "./JSONForm.tsx";
import { CanvasSettings } from "./CanvasSettings.tsx";
import { convertDotNotationToObject } from "../../functions/Controls.ts";
import { GlobalBlockSettings } from "./GlobalBlockSettings.tsx";
import { useRSCBlocksStore } from "../../hooks/useWatchRSCBlocks.ts";

const ResetRSCBlockButton = ({ blockId }: { blockId: string }) => {
  const { t } = useTranslation();
  const { reset } = useRSCBlocksStore();
  return (
    <Button size="sm" variant="outline" onClick={() => reset(blockId)}>
      {t("Reload")}
    </Button>
  );
};

const formDataWithSelectedLang = (formData, selectedLang: string, coreBlock) => {
  const updatedFormData = cloneDeep(formData);
  forEach(keys(formData), (key) => {
    if (get(coreBlock, ["props", key, "i18n"]) && !isEmpty(selectedLang)) {
      updatedFormData[key] = get(formData, `${key}-${selectedLang}`);
    }
  });

  return updatedFormData;
};

/**
 *
 * @returns Block Setting
 */
export default function BlockSettings() {
  const { selectedLang } = useLanguages();
  const selectedBlock = useSelectedBlock() as any;
  const updateBlockPropsRealtime = useUpdateBlocksPropsRealtime();
  const updateBlockProps = useUpdateBlocksProps();
  const coreBlock = getBlockComponent(selectedBlock?._type);
  const formData = formDataWithSelectedLang(selectedBlock, selectedLang, coreBlock);
  const [prevFormData, setPrevFormData] = useState(formData);
  const dataBindingSupported = useBuilderProp("dataBindingSupport", false);

  const updateProps = ({ formData: newData }: IChangeEvent, id?: string, oldState?: any) => {
    if (id && prevFormData?._id === selectedBlock._id) {
      const path = id.replace("root.", "") as string;
      updateBlockProps([selectedBlock._id], { [path]: get(newData, path) } as any, oldState);
    }
  };

  const debouncedCall = useCallback(
    debounce(({ formData }, id, oldPropState) => {
      updateProps({ formData } as IChangeEvent, id, oldPropState);
      setPrevFormData(formData);
    }, 1500),
    [selectedBlock?._id, selectedLang],
  );

  const updateRealtime = ({ formData: newData }: IChangeEvent, id?: string) => {
    if (id) {
      const path = id.replace("root.", "") as string;
      updateBlockPropsRealtime(
        [selectedBlock._id],
        convertDotNotationToObject(path, get(newData, path.split("."))) as any,
      );
      debouncedCall({ formData: newData }, id, { [path]: get(prevFormData, path) });
    }
  };

  const bindingProps = keys(get(formData, "_bindings", {}));

  const staticContentProperties = useMemo(() => {
    const controls = cloneDeep(get(coreBlock, "props", {})) as { [key: string]: ChaiControlDefinition };
    // remove the hidden props
    each(controls, (control: ChaiControlDefinition, key: string) => {
      if (get(control, "hidden", false)) {
        delete controls[key];
      }
    });
    if (!dataBindingSupported) return controls;
    each(bindingProps, (key: string) => delete controls[key]);
    return controls;
  }, [coreBlock, bindingProps, dataBindingSupported]);

  const isRSCBlock = get(coreBlock, "server", false);

  return (
    <div className="overflow-x-hidden px-px">
      {dataBindingSupported ? (
        <Accordion type="multiple" defaultValue={["STATIC", "BINDING"]} className="mt-4 h-full w-full">
          <AccordionItem value="BINDING">
            <AccordionTrigger className="py-2">
              <div className="flex items-center gap-x-2">
                <div
                  className={`h-[8px] w-[8px] rounded-full ${
                    !isEmpty(get(selectedBlock, "_bindings", {})) ? "bg-blue-500" : "bg-gray-300"
                  }`}
                />
                Data Binding
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <DataBindingSetting
                bindingData={get(selectedBlock, "_bindings", {})}
                onChange={(_bindings) => {
                  updateProps({ formData: { _bindings } } as IChangeEvent, "root._bindings");
                }}
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="STATIC">
            <AccordionTrigger className="py-2">
              <div className="flex items-center gap-x-2">
                <div className={`h-[8px] w-[8px] rounded-full bg-blue-500`} />
                Static Content
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              {!isEmpty(bindingProps) ? (
                <div className="mb-1 mt-0 rounded-sm border border-orange-500 bg-orange-100 p-1 text-xs text-orange-500">
                  Data binding is set for <b>{map(bindingProps, capitalize).join(", ")}</b>{" "}
                  {bindingProps.length === 1 ? "property" : "properties"}. Remove data binding to edit static content.
                </div>
              ) : null}
              <JSONForm
                id={selectedBlock?._id}
                onChange={updateRealtime}
                formData={formData}
                properties={staticContentProperties}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : !isEmpty(staticContentProperties) ? (
        <JSONForm
          id={selectedBlock?._id}
          onChange={updateRealtime}
          formData={formData}
          properties={staticContentProperties}
        />
      ) : null}
      {selectedBlock?._type === "GlobalBlock" ? <GlobalBlockSettings /> : null}
      {isRSCBlock ? <ResetRSCBlockButton blockId={selectedBlock?._id} /> : null}
      <CanvasSettings />
    </div>
  );
}
