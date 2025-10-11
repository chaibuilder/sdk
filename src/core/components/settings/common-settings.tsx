import { Switch } from "@/ui/shadcn/components/ui/switch";
import { debounce } from "lodash-es";
import { useCallback, useEffect, useState } from "react";

export const CommonSettings = ({ block, updateBlockProps, updateBlockPropsRealtime }) => {
  const [name, setName] = useState(block._name);
  const [show, setShow] = useState(block._show ?? true);

  useEffect(() => {
    if (block) {
      setName(block._name);
      setShow(block._show ?? true);
    }
  }, [block]);

  const debouncedCall = useCallback(
    debounce((newName) => {
      updateBlockProps([block._id], { _name: newName });
    }, 500),
    [block._id, updateBlockProps],
  );

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    updateBlockPropsRealtime([block._id], { _name: newName });
    debouncedCall(newName);
  };

  const onShowChange = (checked: boolean) => {
    setShow(checked);
    updateBlockProps([block._id], { _show: checked });
  };
  return (
    <div className="">
      <div className="space-y-2">
        <div className="grid grid-cols-3 items-center">
          <label className="text-xs font-medium text-gray-500">Name</label>
          <input
            type="text"
            className="col-span-2 rounded-md border border-gray-300 px-2 py-1 text-xs"
            value={name}
            onChange={onNameChange}
          />
        </div>
        <div className="grid grid-cols-3 items-center">
          <label className="text-xs font-medium text-gray-500">Show</label>
          <Switch
            className="!col-span-2 !h-4 !w-7"
            thumbClassName="!h-3 !w-3"
            checked={show}
            onCheckedChange={onShowChange}
          />
        </div>
      </div>
    </div>
  );
};
