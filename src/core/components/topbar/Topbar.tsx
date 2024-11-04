import React, { LazyExoticComponent, Suspense } from "react";
import { Separator, Skeleton } from "../../../ui";
import { SaveButton } from "./SaveButton";
import { useBuilderProp } from "../../hooks";
import { Preview } from "./Preview.tsx";
import { LanguageSelector } from "../canvas/topbar/LanguageSelector.tsx";

const Topbar = () => {
  const leftComponents: LazyExoticComponent<any>[] = useBuilderProp("topBarComponents.left", []);
  const centerComponents: LazyExoticComponent<any>[] = useBuilderProp("topBarComponents.center", []);
  const rightComponents: LazyExoticComponent<any>[] = useBuilderProp("topBarComponents.right", []);
  const editable = useBuilderProp("editable", true);
  return (
    <div className="flex h-14 items-center justify-between px-2">
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 font-bold">
          {React.Children.toArray(
            leftComponents.map((Component) => (
              <Suspense fallback={<Skeleton className="h-10" />}>
                <Component />
              </Suspense>
            )),
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {React.Children.toArray(
          centerComponents.map((Component) => (
            <Suspense fallback={<Skeleton className="h-10" />}>
              <Component />
            </Suspense>
          )),
        )}
      </div>
      <div className="flex items-center space-x-1">
        <LanguageSelector />
        <Separator orientation="vertical" />
        <Preview />
        <Separator orientation="vertical" />
        {editable ? <SaveButton /> : null}
        {React.Children.toArray(
          rightComponents.map((Component) => (
            <Suspense fallback={<Skeleton className="h-10" />}>
              <Component />
            </Suspense>
          )),
        )}
      </div>
    </div>
  );
};

export default Topbar;
