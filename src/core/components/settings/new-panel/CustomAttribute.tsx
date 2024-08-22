import * as React from "react";
import { useState } from "react";
import { filter, find, forEach, get, isEmpty, map, set, startsWith } from "lodash-es";
import {
  useSelectedBlock,
  useSelectedStylingBlocks,
  useUpdateBlocksProps,
  useUpdateBlocksPropsRealtime,
} from "../../../hooks";
import { useTranslation } from "react-i18next";
import { DeleteIcon } from "lucide-react";
import { PlusIcon } from "@radix-ui/react-icons";
import { Button, Input, Tooltip, TooltipContent, TooltipTrigger, useToast } from "../../../../ui";

const NewAttributePair = ({ onAdd }: { onAdd: Function }) => {
  const { t } = useTranslation();
  const [item, setItem] = useState<Record<"key" | "value", string>>({ key: "", value: "" });

  const emitAdd = () => {
    if (!isEmpty(item.key)) {
      onAdd({ ...item, key: item.key });
      setItem({ key: "", value: "" });
    }
  };
  return (
    <div className={`flex flex-col gap-1 border-gray-200`}>
      <Input
        name="key"
        className="h-6"
        onChange={(e) => setItem({ ...item, key: e.target.value })}
        value={item.key}
        placeholder={t("Name")}
        autoComplete="off"
        autoCapitalize="off"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (!isEmpty(item.key)) {
              emitAdd();
            }
          }
        }}
      />
      <div className="flex items-center gap-x-1.5">
        <Input
          className="h-6"
          name="value"
          onChange={(e) => setItem({ ...item, value: e.target.value })}
          value={item.value}
          placeholder={t("Value")}
          autoComplete="off"
          autoCapitalize="off"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (!isEmpty(item.key)) {
                emitAdd();
              }
            }
          }}
        />
      </div>
      <div className="flex items-center gap-x-2">
        <Button disabled={isEmpty(item.key)} onClick={emitAdd} size="sm" className="flex items-center">
          <span>{t("Add")}&nbsp;</span>
          <PlusIcon />
        </Button>
        {!isEmpty(item.key) ? (
          <Button variant="ghost" onClick={() => setItem({ key: "", value: "" })}>
            {t("Cancel")}
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export const CustomAttributes = () => {
  const block = useSelectedBlock();
  const [attributes, setAttributes] = useState([] as Array<{ key: string; value: string }>);
  const [selectedStylingBlock] = useSelectedStylingBlocks();
  const updateBlockPropsRealtime = useUpdateBlocksPropsRealtime();
  const updateBlockProps = useUpdateBlocksProps();
  const { t } = useTranslation();
  const { toast } = useToast();

  const attrKey = `${get(selectedStylingBlock, "0.prop")}_attrs`;

  React.useEffect(() => {
    const _attributes = map(get(block, attrKey), (value, key) => ({ key, value }));
    if (!isEmpty(_attributes)) setAttributes(_attributes as any);
    else setAttributes([]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [get(block, attrKey)]);

  const removeAttribute = (index: number) => {
    const _attributes = filter(attributes, (_, ind) => index !== ind);
    updateAttributes(_attributes);
  };

  const onAdd = (newAttr: Record<"key" | "value", string>) => {
    // check if the attribute is a predefined attribute by checking in attributes with same key
    const predefinedAttr = find(attributes, { key: newAttr.key });
    if (predefinedAttr) {
      if (predefinedAttr.value.startsWith("dnd-") || predefinedAttr.value.startsWith("#dnd-")) {
        toast({
          title: t(`Cannot add predefined attribute`),
          variant: "destructive",
          description: t(`"(${newAttr.key})" cannot be added as it is a predefined attribute for this block`),
        });
        return;
      }
    }
    const _attrs: any = [...attributes, newAttr];
    updateAttributes(_attrs);
  };

  const updateAttributes = React.useCallback(
    (updatedAttributes: any = []) => {
      const _attrs = {};
      forEach(updatedAttributes, (item) => {
        if (!isEmpty(item.key)) {
          set(_attrs, item.key, item.value);
        }
      });
      updateBlockProps([get(block, "_id")], { [attrKey]: _attrs });
    },
    [block, updateBlockPropsRealtime, attrKey],
  );

  return (
    <div className="mb-20 flex min-h-max flex-col gap-y-2 overflow-y-auto">
      <div className="flex flex-col">
        <div>
          <ul className="overflow-hidden rounded-md bg-gray-100 text-xs text-gray-700">
            {isEmpty(attributes) ? (
              <li className="flex h-4 items-center justify-center">
                <p>{t("No attributes added")}</p>
              </li>
            ) : null}
            {React.Children.toArray(
              map(attributes, (item: { key: string; value: string }) => {
                return (
                  <li className="group flex w-full max-w-full items-center justify-between">
                    <Tooltip delayDuration={1000}>
                      <TooltipTrigger asChild>
                        <div className="max-w-[230px] cursor-default truncate px-1 hover:bg-gray-200">
                          {item.key}
                          {item.value.toString().trim() ? (
                            <>
                              &nbsp;<span className="font-bold text-orange-500">=</span>&nbsp;
                              {item.value.toString().trim()}
                            </>
                          ) : null}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[200px]">
                        <div>
                          {t("Name")}: {item.key}
                        </div>
                        <div>
                          {t("Value")}: {item.value.toString()}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          disabled={startsWith(item.value, "dnd-")}
                          className="invisible group-hover:visible"
                          onClick={() => removeAttribute(attributes.indexOf(item))}>
                          <DeleteIcon className="w-4 text-gray-500" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[200px]">
                        {startsWith(item.value.toString(), "dnd-")
                          ? t("Predefined attribute. Cannot be deleted")
                          : t("Remove attribute")}
                      </TooltipContent>
                    </Tooltip>
                  </li>
                );
              }),
            )}
          </ul>
        </div>
        <div className="py-2" />
        <NewAttributePair onAdd={(newAttr: Record<"key" | "value", string>) => onAdd(newAttr)} />
      </div>
    </div>
  );
};
