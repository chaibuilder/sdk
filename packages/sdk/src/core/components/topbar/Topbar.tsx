import { LazyExoticComponent, Suspense } from "react";
import { Skeleton } from "../../../ui";
import { useBuilderProp } from "../../hooks";

const Topbar = () => {
  const leftComponents: LazyExoticComponent<any>[] = useBuilderProp("topBarComponents.left", []);
  const centerComponents: LazyExoticComponent<any>[] = useBuilderProp("topBarComponents.center", []);
  const rightComponents: LazyExoticComponent<any>[] = useBuilderProp("topBarComponents.right", []);

  return (
    <div className="flex h-14 items-center justify-between px-2">
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 font-bold">
          {leftComponents.map((Component, index) => (
            <Suspense key={`left-${index}`} fallback={<Skeleton className="h-10" />}>
              <Component />
            </Suspense>
          ))}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {centerComponents.map((Component, index) => (
          <Suspense key={`center-${index}`} fallback={<Skeleton className="h-10" />}>
            <Component />
          </Suspense>
        ))}
      </div>
      <div className="flex items-center space-x-1">
        {rightComponents.map((Component, index) => (
          <Suspense key={`right-${index}`} fallback={<Skeleton className="h-10" />}>
            <Component />
          </Suspense>
        ))}
      </div>
    </div>
  );
};

export default Topbar;
