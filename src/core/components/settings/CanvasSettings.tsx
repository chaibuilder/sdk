import { useBlocksStore, useSelectedBlock } from "../../hooks";
import { useMemo } from "react";
import { ChaiControlDefinition } from "@chaibuilder/runtime/controls";
import { cloneDeep, get, isEmpty } from "lodash-es";
import { getBlockComponent } from "@chaibuilder/runtime";
import { JSONForm } from "./JSONForm.tsx";
import { useCanvasSettings } from "../../hooks/useCanvasSettings.ts";

export const CanvasSettings = () => {
  const [canvasSettingItems, setCanvasSettings] = useCanvasSettings();
  const selectedBlock = useSelectedBlock() as any;
  const [allBlocks] = useBlocksStore();
  const allParentBlocks = useMemo(() => {
    let block = selectedBlock;
    const blocks = [block];
    do {
      const parentBlock = allBlocks.find(({ _id }) => _id === block?._parent);
      block = parentBlock;
      if (parentBlock) blocks.push(parentBlock);
    } while (block?._parent);

    return blocks;
  }, [selectedBlock?._type, allBlocks]);

  const canvasSettings = useMemo(() => {
    for (let i = 0; i < allParentBlocks.length; i++) {
      const coreBlock = getBlockComponent(allParentBlocks[i]._type);
      const settings = cloneDeep(get(coreBlock, "canvasSettings", {})) as { [key: string]: ChaiControlDefinition };
      if (!isEmpty(settings)) return { settings, block: allParentBlocks[i] };
    }
    return {};
  }, [allParentBlocks]);

  const setSettings = (id: string, settings: any) => {
    setCanvasSettings((prev) => ({ ...prev, [id]: settings }));
  };

  if (isEmpty(canvasSettings)) return null;

  const { block, settings } = canvasSettings;

  return (
    <div className="text-xs hover:no-underline">
      <div className="flex items-center gap-x-2 bg-gray-100 px-4 py-2">{canvasSettings.block._type} settings</div>
      <div className="bg-white pb-2">
        <JSONForm
          id={block?._id}
          onChange={({ formData }) => setSettings(block._id, formData)}
          formData={get(canvasSettingItems, block._id, {})}
          properties={settings}
        />
      </div>
    </div>
  );
};
