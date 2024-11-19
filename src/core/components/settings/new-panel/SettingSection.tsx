import React, { createContext, useCallback, useMemo } from "react";
import { flatten, has, intersection, map } from "lodash-es";
import { MultipleChoices } from "../choices/MultipleChoices";
import { BlockStyle } from "../choices/BlockStyle";
import { useSelectedBlockCurrentClasses } from "../../../hooks";
import { useTranslation } from "react-i18next";
import { AccordionContent, AccordionItem, AccordionTrigger } from "../../../../ui";
import { startCase } from "lodash-es";

const NestedOptions = ({ heading, items }: any) => {
  const { t } = useTranslation();
  const currentClasses = useSelectedBlockCurrentClasses();
  const isAnyPropertySet: boolean = useMemo(() => {
    const getItemProperties = (it: any[]) =>
      flatten(
        it.map((item) => {
          if (item.styleType === "multiple") {
            return map(item.options, "key");
          }
          return item.property;
        }),
      );
    const properties: Array<string> = flatten(
      items.map((item: any) => {
        if (item.styleType === "accordion") {
          return getItemProperties(item.items);
        }
        if (item.styleType === "multiple") {
          return map(item.options, "key");
        }
        return item.property;
      }),
    );
    const setProps = map(currentClasses, "property");
    return intersection(properties, setProps).length > 0;
  }, [currentClasses, items]);

  return (
    <details>
      <summary className="my-px cursor-default rounded-md bg-gray-50 p-px px-2 text-[11px] text-foreground dark:bg-gray-800">
        <div className="inline">
          {startCase(t(heading.toLowerCase()))}
          {isAnyPropertySet ? (
            <span
              className={`ml-1 mr-2 inline-block h-[8px] w-[8px] rounded-full ${
                isAnyPropertySet ? "bg-blue-500" : "bg-gray-300"
              }`}
            />
          ) : null}
        </div>
      </summary>
      <div className="p-2">
        {items.map((item: any) => {
          if (item.styleType === "multiple") {
            return <MultipleChoices key={item.label} {...item} />;
          }
          return <BlockStyle key={item.label} {...item} />;
        })}
      </div>
    </details>
  );
};

const SectionContext = createContext({});

export const StylingGroup = ({ section, showAccordian }: any) => {
  const { t } = useTranslation();
  const currentClasses = useSelectedBlockCurrentClasses();
  const matchCondition = useCallback(
    (conditions: any = []): boolean => {
      const active: any = {};
      for (let i = 0; i < currentClasses.length; i++) {
        active[currentClasses[i].property] = currentClasses[i].cls;
      }
      let match = true;
      // eslint-disable-next-line no-restricted-syntax
      for (const property in conditions) {
        if (!has(active, property) || active[property] !== conditions[property]) {
          match = false;
          break;
        }
      }
      return match;
    },
    [currentClasses],
  );

  const contextValue = useMemo(() => ({}), []);

  return (
    <SectionContext.Provider value={contextValue}>
      {showAccordian ? (
        <AccordionItem value={section.heading} className="border-none">
          <AccordionTrigger className="border-slate-150 border-t py-2 text-xs">
            <div className="flex items-center py-2">
              <div className="flex items-center gap-x-2 text-xs font-medium">{startCase(t(section.heading))}</div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="py-2">
            {React.Children.toArray(
              section.items.map((item: any) => {
                if (has(item, "component")) {
                  return React.createElement(item.component, { key: item.label });
                }
                if (!has(item, "styleType")) {
                  return <BlockStyle key={item.label} {...item} />;
                }
                if (item.styleType === "multiple") {
                  return <MultipleChoices key={item.label} {...item} />;
                }
                if (item.styleType === "accordion" && matchCondition(item?.conditions)) {
                  return <NestedOptions key={item.label} {...item} />;
                }
                return null;
              }),
            )}
          </AccordionContent>
        </AccordionItem>
      ) : (
        <div className="py-2">
          {React.Children.toArray(
            section.items.map((item: any) => {
              if (has(item, "component")) {
                return React.createElement(item.component, { key: item.label });
              }
              if (!has(item, "styleType")) {
                return <BlockStyle key={item.label} {...item} />;
              }
              if (item.styleType === "multiple") {
                return <MultipleChoices key={item.label} {...item} />;
              }
              if (item.styleType === "accordion" && matchCondition(item?.conditions)) {
                return <NestedOptions key={item.label} {...item} />;
              }
              return null;
            }),
          )}
        </div>
      )}
    </SectionContext.Provider>
  );
};
