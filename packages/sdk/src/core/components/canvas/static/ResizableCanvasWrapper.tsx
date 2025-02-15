import { useEffect, useRef } from "react";
import { useDebouncedCallback, useResizeObserver } from "@react-hookz/web";
import { useSelectedBlockIds, useSelectedStylingBlocks } from "../../../hooks";

export const ResizableCanvasWrapper = ({ children, onMount, onResize }: any) => {
  const [, setSelected] = useSelectedBlockIds();
  const [, setSelectedStyles] = useSelectedStylingBlocks();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deselectSelected = () => {
    setSelected([]);
    setSelectedStyles([]);
  };

  return (
    <div id={"main-content"} onClick={deselectSelected} className="h-full w-full p-8 pb-0" ref={mainContentRef}>
      {children}
    </div>
  );
};
