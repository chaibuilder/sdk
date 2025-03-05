import { getBlockFormSchemas, getRegisteredChaiBlock } from "@chaibuilder/runtime";
import { IChangeEvent } from "@rjsf/core";
import { capitalize, cloneDeep, debounce, forEach, get, includes, isEmpty, keys, map, startCase } from "lodash-es";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../ui";
import {
  useLanguages,
  useSelectedBlock,
  useUpdateBlocksProps,
  useUpdateBlocksPropsRealtime,
  useWrapperBlock,
} from "../../hooks";
import DataBindingSetting from "../../rjsf-widgets/data-binding.tsx";
import { JSONForm } from "./JSONForm.tsx";
import { GlobalBlockSettings } from "./PartialBlockSettings.tsx";

const formDataWithSelectedLang = (formData, selectedLang: string, coreBlock) => {
  const updatedFormData = cloneDeep(formData);
  forEach(keys(formData), (key) => {
    if (includes(get(coreBlock, "i18nProps", []), key) && !isEmpty(selectedLang)) {
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
  const registeredBlock = getRegisteredChaiBlock(selectedBlock?._type);
  const formData = formDataWithSelectedLang(selectedBlock, selectedLang, registeredBlock);
  const [prevFormData, setPrevFormData] = useState(formData);
  const dataBindingSupported = false;

  const [showWrapperSetting, setShowWrapperSetting] = useState(false);
  const wrapperBlock = useWrapperBlock();
  const registeredWrapperBlock = getRegisteredChaiBlock(wrapperBlock?._type);
  const wrapperFormData = formDataWithSelectedLang(wrapperBlock, selectedLang, registeredWrapperBlock);

  const updateProps = ({ formData: newData }: IChangeEvent, prop?: string, oldState?: any) => {
    if (prop && prevFormData?._id === selectedBlock._id) {
      updateBlockProps([selectedBlock._id], { [prop]: get(newData, prop) } as any, oldState);
    }
  };

  const debouncedCall = useCallback(
    debounce(({ formData }, prop, oldPropState) => {
      updateProps({ formData } as IChangeEvent, prop, oldPropState);
      setPrevFormData(formData);
    }, 1500),
    [selectedBlock?._id, selectedLang],
  );

  const updateRealtime = ({ formData: newData }: IChangeEvent, prop?: string) => {
    if (prop) {
      updateBlockPropsRealtime([selectedBlock._id], { [prop]: get(newData, prop) } as any);
      debouncedCall({ formData: newData }, prop, { [prop]: get(prevFormData, prop) });
    }
  };

  const updateWrapperRealtime = ({ formData: newData }: IChangeEvent, prop?: string) => {
    if (prop) {
      updateBlockPropsRealtime([wrapperBlock._id], { [prop]: get(newData, prop) } as any);
      debouncedCall({ formData: newData }, prop, { [prop]: get(prevFormData, prop) });
    }
  };

  const bindingProps = keys(get(formData, "_bindings", {}));

  const { schema, uiSchema } = useMemo(() => {
    const type = selectedBlock?._type;
    if (!type) {
      return;
    }
    return getBlockFormSchemas(type);
  }, [selectedBlock]);

  const { wrapperSchema, wrapperUiSchema } = useMemo(() => {
    if (!wrapperBlock || !wrapperBlock?._type) {
      return { wrapperSchema: {}, wrapperUiSchema: {} };
    }
    const type = wrapperBlock?._type;
    const { schema: wrapperSchema = {}, uiSchema: wrapperUiSchema = {} } = getBlockFormSchemas(type);
    return { wrapperSchema, wrapperUiSchema };
  }, [wrapperBlock]);

  return (
    <div className="no-scrollbar overflow-x-hidden px-px">
      {!isEmpty(wrapperBlock) && (
        <div className="mb-4 rounded border bg-zinc-100 px-1">
          <div
            onClick={() => setShowWrapperSetting((prev) => !prev)}
            className="flex cursor-pointer items-center gap-x-1 py-2 text-xs font-medium leading-tight hover:bg-slate-100">
            {showWrapperSetting ? (
              <ChevronDown className="h-4 w-4 stroke-[3] text-slate-400" />
            ) : (
              <ChevronRight className="h-4 w-4 stroke-[3] text-slate-400" />
            )}
            {startCase(wrapperBlock._type)} settings{" "}
            {wrapperBlock._name && (
              <span className="text-[11px] font-light text-slate-400">({wrapperBlock._name})</span>
            )}
          </div>
          <div className={showWrapperSetting ? "h-auto" : "invisible h-0"}>
            <JSONForm
              blockId={wrapperBlock?._id}
              onChange={updateWrapperRealtime}
              formData={wrapperFormData}
              schema={wrapperSchema}
              uiSchema={wrapperUiSchema}
            />
          </div>
        </div>
      )}
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
                blockId={selectedBlock?._id}
                onChange={updateRealtime}
                formData={formData}
                schema={schema}
                uiSchema={uiSchema}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : !isEmpty(schema) ? (
        <JSONForm
          blockId={selectedBlock?._id}
          onChange={updateRealtime}
          formData={formData}
          schema={schema}
          uiSchema={uiSchema}
        />
      ) : null}
      {selectedBlock?._type === "GlobalBlock" ? <GlobalBlockSettings /> : null}
    </div>
  );
}
