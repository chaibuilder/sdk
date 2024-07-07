import { get, isEmpty } from "lodash-es";
import { JSONForm } from "./JSONForm.tsx";
import { useCanvasSettings } from "../../hooks/useCanvasSettings.ts";
import { useSelectedBlockCanvasSetting } from "../../hooks/useSelectedBlockIds.ts";

export const CanvasSettings = () => {
  const [canvasSettingItems, setCanvasSettings] = useCanvasSettings();
  const canvasSettings = useSelectedBlockCanvasSetting();

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
