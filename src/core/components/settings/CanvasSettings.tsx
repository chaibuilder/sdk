import { useSelectedBlock, useSelectedBlockIds } from "../../hooks";
import { Label, Switch } from "../../../ui";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import { useMemo } from "react";
import { xShowBlocksAtom } from "../../atoms/ui.ts";

export const CanvasSettings = () => {
  const [xShowBlocks, setXShowBlocks] = useAtom(xShowBlocksAtom);
  const selectedBlock = useSelectedBlock();
  const [, setSelected] = useSelectedBlockIds();
  const { t } = useTranslation();

  const hasXShow = useMemo(() => {
    const strBlock = selectedBlock ? JSON.stringify(selectedBlock) : "";
    return strBlock.includes('"x-show"');
  }, [selectedBlock]);

  if (!selectedBlock || !hasXShow) return null;

  const isChecked = xShowBlocks.includes(selectedBlock._id);

  return (
    <div className="py-2 text-xs hover:no-underline">
      <div className="flex items-center gap-x-2 border-b border-border bg-background py-2 font-normal text-muted-foreground">
        {selectedBlock._name || selectedBlock._type}
        &nbsp;{t("Visibility settings")}
      </div>
      <div className="flex items-center space-x-2 pt-2">
        <Switch
          id="show-on-canvas"
          checked={isChecked}
          onCheckedChange={(checked) => {
            if (checked) {
              setXShowBlocks((prev) => [...prev, selectedBlock._id]);
              setSelected([selectedBlock._id]);
            } else {
              setXShowBlocks((prev) => prev.filter((id) => id !== selectedBlock._id));
            }
          }}
        />
        <Label htmlFor="show-on-canvas">{t("Show on canvas")}</Label>
      </div>
    </div>
  );
};
