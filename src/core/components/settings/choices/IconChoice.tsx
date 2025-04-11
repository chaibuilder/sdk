import { BoxIcon } from "@radix-ui/react-icons";
import { get, map, startCase, toLower } from "lodash-es";
import React, { useContext, useMemo } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../ui";
import { useTailwindClassList } from "../../../constants/CLASSES_LIST";
import { EDITOR_ICONS } from "../../../constants/ICONS";
import { useCurrentClassByProperty } from "./BlockStyle";
import { StyleContext } from "./StyleContext";

export const IconChoices = ({ property, onChange }: any) => {
  const { getClasses } = useTailwindClassList();
  const classes = getClasses(property);
  const { canChange } = useContext(StyleContext);
  const currentClass = useCurrentClassByProperty(property);
  const pureClsName = useMemo(() => get(currentClass, "cls", ""), [currentClass]);

  return (
    <div className="flex grow flex-wrap gap-1">
      {map(classes, (cls) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              disabled={!canChange}
              onClick={() => onChange(cls, property)}
              className={`cursor-pointer rounded border border-border p-1 disabled:cursor-not-allowed ${
                pureClsName === cls ? "bg-primary text-white" : "disabled:bg-gray-600 disabled:text-gray-400"
              }`}>
              {React.createElement(get(EDITOR_ICONS, cls, BoxIcon))}
            </button>
          </TooltipTrigger>
          <TooltipContent>{startCase(toLower(cls))}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};
