import { get, nth } from "lodash-es";
import { useContext, useMemo } from "react";
import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";
import { DropDownChoices } from "./DropdownChoices";
import { useCurrentClassByProperty } from "./BlockStyle";
import { useTailwindClassList } from "../../../constants/CLASSES_LIST";
import { StyleContext } from "./StyleContext";

export const RangeChoices = ({ property, onChange }: any) => {
  const { canReset, canChange } = useContext(StyleContext);
  const currentClass = useCurrentClassByProperty(property);
  const pureClsName = useMemo(() => get(currentClass, "cls", ""), [currentClass]);
  const { getClasses } = useTailwindClassList();
  const classes = getClasses(property, [""]);

  const index = classes.indexOf(pureClsName) > -1 ? classes.indexOf(pureClsName) : 0;
  const isArbitraryClassUsed = /\[.*\]/g.test(pureClsName);

  return (
    <div className="flex flex-row divide-x divide-solid divide-border rounded border border-border text-xs">
      {isArbitraryClassUsed ? (
        <div className="px-2 py-[5px]">{pureClsName}</div>
      ) : (
        <>
          <button
            type="button"
            className="hover:bg-bg-gray-700 box-border w-2/12 rounded-bl rounded-tl bg-background px-1 text-center disabled:cursor-not-allowed disabled:bg-gray-600"
            disabled={!canChange && (!canReset || index - 1 < 0)}
            onClick={() => onChange(nth(classes, index - 1), property)}>
            <span className="flex items-center justify-center">
              <MinusIcon
                className={
                  !canChange && (!canReset || index - 1 < 0) ? "text-gray-500" : "text-black/60 dark:text-white/60"
                }
              />
            </span>
          </button>
          <div className="w-8/12 text-center">
            <DropDownChoices label={false} property={property} onChange={onChange} />
          </div>
          <button
            type="button"
            className="hover:bg-bg-gray-700 w-2/12 rounded-br rounded-tr bg-background px-1 text-center disabled:cursor-not-allowed disabled:bg-gray-600"
            disabled={!canChange && (!canReset || index + 1 >= classes.length)}
            onClick={() => onChange(nth(classes, index + 1), property)}>
            <span className="flex items-center justify-center">
              <PlusIcon
                className={
                  !canChange && (!canReset || index + 1 >= classes.length)
                    ? "text-gray-500"
                    : "text-black/60 dark:text-white/60"
                }
              />
            </span>
          </button>
        </>
      )}
    </div>
  );
};
