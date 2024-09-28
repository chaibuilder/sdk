import { useEffect, useRef } from "react";
import { useDebouncedCallback, useResizeObserver } from "@react-hookz/web";

export const ResizableCanvasWrapper = ({ children, onMount, onResize }: any) => {
  const mainContentRef = useRef(null);
  const db = useDebouncedCallback(
    () => {
      const { clientWidth } = mainContentRef.current as HTMLDivElement;
      onResize(clientWidth);
    },
    [mainContentRef.current],
    100,
  );
  useResizeObserver(mainContentRef.current as HTMLElement, db, mainContentRef.current !== null);
  useEffect(() => {
    const { clientWidth } = mainContentRef.current as HTMLDivElement;
    onMount(clientWidth);
  }, []);
  return (
    <div id={"main-content"} className="h-full w-full p-8 pb-0" ref={mainContentRef}>
      {children}
    </div>
  );
};
