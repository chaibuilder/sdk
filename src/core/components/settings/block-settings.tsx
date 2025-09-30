import { JSONForm } from "@/core/components/settings/json-form";
import { COLLECTION_PREFIX } from "@/core/constants/STRINGS";
import {
  useLanguages,
  useSelectedBlock,
  useUpdateBlocksProps,
  useUpdateBlocksPropsRealtime,
  useWrapperBlock,
} from "@/core/hooks";
import { getBlockFormSchemas, getRegisteredChaiBlock } from "@chaibuilder/runtime";
import { ChevronDownIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { IChangeEvent } from "@rjsf/core";
import { cloneDeep, debounce, forEach, get, includes, isEmpty, keys, set, startCase, startsWith } from "lodash-es";
import { useCallback, useMemo, useState } from "react";

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

  const { schema, uiSchema } = useMemo(() => {
    const type = selectedBlock?._type;
    if (!type) {
      return { schema: {}, uiSchema: {} };
    }
    try {
      const { schema, uiSchema } = getBlockFormSchemas(type);
      //NOTE: This is special case for collection based repeater block
      if (type === "Repeater") {
        const repeaterItems = get(selectedBlock, "repeaterItems", "");
        if (!startsWith(repeaterItems, `{{${COLLECTION_PREFIX}`)) {
          set(uiSchema, "filter", { "ui:widget": "hidden" });
          set(uiSchema, "sort", { "ui:widget": "hidden" });
        } else {
          set(uiSchema, "filter", { "ui:widget": "collectionSelect" });
          set(uiSchema, "sort", { "ui:widget": "collectionSelect" });
        }
      }
      return { schema, uiSchema };
    } catch (error) {
      return { schema: {}, uiSchema: {} };
    }
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
              <ChevronDownIcon className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronRightIcon className="h-4 w-4 text-slate-400" />
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
      {!isEmpty(schema) ? (
        <JSONForm
          blockId={selectedBlock?._id}
          onChange={updateRealtime}
          formData={formData}
          schema={schema}
          uiSchema={uiSchema}
        />
      ) : null}
    </div>
  );
}
