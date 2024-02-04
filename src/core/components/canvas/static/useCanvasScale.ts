import { useCanvasWidth, useCanvasZoom } from "../../../hooks";
import { useCallback, useEffect, useState } from "react";

export const useCanvasScale = (dimension: { height: number; width: number }) => {
  const [canvasWidth] = useCanvasWidth();
  const [, setZoom] = useCanvasZoom();
  const [scale, setScale] = useState({});
  const updateScale = useCallback(() => {
    const { width, height } = dimension;
    if (width < canvasWidth) {
      const newScale: number = parseFloat((width / canvasWidth).toString());
      let heightObj = {};
      if (height) {
        heightObj = { height: height + 2 * height * (1 - newScale) };
      }
      setScale({
        transform: `scale(${newScale})`,
        transformOrigin: "top left",
        ...heightObj,
        maxWidth: "none",
      });

      setZoom(newScale * 100);
    } else {
      setScale({});
      setZoom(100);
    }
  }, [canvasWidth, dimension, setZoom]);

  useEffect(() => {
    updateScale();
  }, [canvasWidth, dimension, setZoom, updateScale]);

  return scale;
};
