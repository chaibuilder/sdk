import { IChangeEvent } from "@rjsf/core";
import { capitalize, cloneDeep, each, get, isEmpty, keys, map } from "lodash-es";
import { useBuilderProp, useCanvasHistory, useSelectedBlock, useUpdateBlocksPropsRealtime } from "../../hooks";
import { ChaiControlDefinition, SingleLineText } from "@chaibuilder/runtime/controls";
import DataBindingSetting from "../../../ui/widgets/rjsf/widgets/data-binding";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../ui";
import { useMemo } from "react";
import { getBlockComponent } from "@chaibuilder/runtime";
import { JSONForm } from "./JSONForm.tsx";

/**
 *
 * @returns Block Setting
 */
export default function BlockSettings() {
  const selectedBlock = useSelectedBlock() as any;
  const { createSnapshot } = useCanvasHistory();
  const updateBlockPropsRealtime = useUpdateBlocksPropsRealtime();
  const coreBlock = getBlockComponent(selectedBlock._type);
  const formData = { ...selectedBlock };
  const dataBindingSupported = useBuilderProp("dataBindingSupport", true);

  const createHistorySnapshot = () => createSnapshot();

  const updateRealtime = ({ formData: newData }: IChangeEvent, id?: string) => {
    if (id) {
      const path = id.replace("root.", "") as string;
      updateBlockPropsRealtime([selectedBlock._id], { [path]: get(newData, path) } as any);
    }
  };

  const nameProperties = {
    _name: SingleLineText({
      title: "Name",
      default: get(selectedBlock, "_name", selectedBlock._type),
    }),
  };

  const bindingProps = keys(get(formData, "_bindings", {}));

  const staticContentProperties = useMemo(() => {
    const controls = cloneDeep(get(coreBlock, "props", {})) as { [key: string]: ChaiControlDefinition };
    if (!dataBindingSupported) return controls;
    each(bindingProps, (key) => delete controls[key]);
    return controls;
  }, [coreBlock, bindingProps, dataBindingSupported]);

  return (
    <div className="overflow-x-hidden">
      <JSONForm
        onChange={updateRealtime}
        createHistorySnapshot={createHistorySnapshot}
        formData={formData}
        properties={nameProperties}
      />
      <hr className="mt-4" />
      {dataBindingSupported ? (
        <Accordion type="multiple" defaultValue={["STATIC", "BINDING"]} className="h-full w-full">
          <AccordionItem value="BINDING">
            <AccordionTrigger className="px-3 py-2 text-xs hover:no-underline bg-gray-100 ml-1">
              <div className="flex items-center gap-x-2">
                <div
                  className={`h-[8px] w-[8px] rounded-full ${
                    !isEmpty(get(selectedBlock, "_bindings", {})) ? "bg-blue-500" : "bg-gray-300"
                  }`}
                />
                Data Binding
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 px-4">
              <DataBindingSetting
                bindingData={get(formData, "_bindings", {})}
                onChange={(_bindings) => {
                  updateRealtime({ formData: { ...formData, _bindings } } as IChangeEvent, "root._bindings");
                }}
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="STATIC">
            <AccordionTrigger className="px-3 py-2 text-xs hover:no-underline bg-gray-100 ml-1">
              <div className="flex items-center gap-x-2">
                <div className={`h-[8px] w-[8px] rounded-full bg-blue-500`} />
                Static Content
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              {!isEmpty(bindingProps) ? (
                <div className="text-xs mx-4 border rounded-sm p-1 mb-1 mt-0 border-orange-500 text-orange-500 bg-orange-100">
                  Data binding is set for <b>{map(bindingProps, capitalize).join(", ")}</b>{" "}
                  {bindingProps.length === 1 ? "property" : "properties"}. Remove data binding to edit static content.
                </div>
              ) : null}
              <JSONForm
                onChange={updateRealtime}
                createHistorySnapshot={createHistorySnapshot}
                formData={formData}
                properties={staticContentProperties}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : (
        <JSONForm
          onChange={updateRealtime}
          createHistorySnapshot={createHistorySnapshot}
          formData={formData}
          properties={staticContentProperties}
        />
      )}
      <div className="pb-60"></div>
    </div>
  );
}
