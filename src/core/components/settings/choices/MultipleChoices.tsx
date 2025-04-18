import { BlockStyle } from "@/core/components/settings/choices/BlockStyle";
import { EDITOR_ICONS } from "@/core/constants/ICONS";
import { ClassDerivedObject } from "@/core/functions/Class";
import { useSelectedBlockCurrentClasses } from "@/core/hooks";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/shadcn/components/ui/tooltip";
import { BoxIcon } from "@radix-ui/react-icons";
import { get, map, startCase, toLower } from "lodash-es";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

const basicUnits = ["px", "%", "em", "rem", "ch", "vh", "vw"];

export const MultipleChoices = ({
  label,
  options,
  borderB = false,
  borderT = false,
  type = "arbitrary",
  units = basicUnits,
  negative = false,
}: any) => {
  const { t } = useTranslation();
  const [selectedProp, setSelectedProp] = useState(options[0].key);
  const currentClasses: Array<ClassDerivedObject> = useSelectedBlockCurrentClasses();
  const hasAnyClassSet = useCallback((key: string) => map(currentClasses, "property").includes(key), [currentClasses]);

  return (
    <div
      className={`mb-2 border-border py-2 first:pt-0 last:pb-0 ${borderB ? "border-b" : ""} ${
        borderT ? "border-t" : ""
      }`}>
      <div className="flex flex-row text-xs">
        {label && <span className="relative w-[70px] flex-none text-xs text-foreground">{t(label)}</span>}
        <div className="mb-3 flex grow flex-row flex-wrap gap-x-px">
          {options.map(({ label: l, key }: any, index: number) => (
            <div key={`option-${index}`} className="first:rounded-l last:rounded-r">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setSelectedProp(key)}
                    className={`relative cursor-pointer rounded-full p-1 text-[8px] ${
                      key === selectedProp ? "bg-[#3E57F0] text-white" : "text-gray-600 dark:text-gray-300"
                    }`}>
                    {React.createElement("div", {
                      className: hasAnyClassSet(key) ? "-bottom-1.5 absolute bg-[#3E57F0] h-[2px] left-0 w-full" : "",
                    })}
                    {React.createElement(get(EDITOR_ICONS, key, BoxIcon), { className: "text-inherit w-3 h-3" })}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{startCase(toLower(l))}</TooltipContent>
              </Tooltip>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-0 flex items-center">
        <BlockStyle
          type={type}
          units={[...units]}
          label=""
          // label={find(options, { ke: selectedProp }).label}
          property={selectedProp}
          negative={negative}
        />
      </div>
    </div>
  );
};
