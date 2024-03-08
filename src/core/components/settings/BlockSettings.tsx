import { RJSFSchema, UiSchema } from "@rjsf/utils";
import RjForm, { IChangeEvent } from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import { capitalize, cloneDeep, each, get, includes, isEmpty, keys, map } from "lodash";
import { useActiveLanguage, useCanvasHistory, useSelectedBlock, useUpdateBlocksPropsRealtime } from "../../hooks";
import { IconPickerField, ImagePickerField, LinkField, RTEField } from "../../../ui/widgets";
import { getBlockJSONFromSchemas, getBlockJSONFromUISchemas } from "../../functions/Controls.ts";
import { ChaiControlDefinition, SingleLineText } from "@chaibuilder/runtime/controls";
import DataBindingSetting from "../../../ui/widgets/rjsf/widgets/data-binding";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../ui";
import { BindingWidget } from "../../../ui/widgets/rjsf/widgets/binding.tsx";
import { useMemo } from "react";
import { getBlockComponent } from "@chaibuilder/runtime";

/**
 *
 * @param param0
 * @returns Form for Static and name fields
 */
const Form = ({
  createHistorySnapshot,
  properties,
  formData,
  onChange,
}: {
  formData: any;
  properties: any;
  createHistorySnapshot: () => void;
  onChange: ({ formData }: any, key?: string) => void;
}) => {
  const [activeLang] = useActiveLanguage();

  const propsSchema: RJSFSchema = { type: "object", properties: {} };
  const uiSchema: UiSchema = {};

  Object.keys(properties).forEach((key) => {
    const control = properties[key];
    if (includes(["slot", "styles"], control.type)) return;
    const propKey = get(control, "i18n", false) ? `${key}-${activeLang}` : key;
    propsSchema.properties[propKey] = getBlockJSONFromSchemas(control, activeLang);
    uiSchema[propKey] = getBlockJSONFromUISchemas(control, activeLang);
  });

  return (
    <RjForm
      widgets={{
        binding: BindingWidget,
        richtext: RTEField,
        icon: IconPickerField,
        image: ImagePickerField,
      }}
      fields={{
        link: LinkField,
      }}
      idSeparator="."
      autoComplete="off"
      omitExtraData={false}
      liveOmit={false}
      liveValidate
      validator={validator}
      uiSchema={uiSchema}
      onBlur={createHistorySnapshot}
      schema={propsSchema}
      formData={formData}
      onChange={onChange}
    />
  );
};

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
    each(bindingProps, (key) => {
      delete controls[key];
    });
    return controls;
  }, [coreBlock, bindingProps]);

  return (
    <div className="overflow-x-hidden">
      <Form
        onChange={updateRealtime}
        createHistorySnapshot={createHistorySnapshot}
        formData={formData}
        properties={nameProperties}
      />
      <hr className="mt-4" />
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
            ) : (
              ""
            )}
            <Form
              onChange={updateRealtime}
              createHistorySnapshot={createHistorySnapshot}
              formData={formData}
              properties={staticContentProperties}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="pb-60"></div>
    </div>
  );
}
