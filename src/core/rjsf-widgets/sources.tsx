import { FieldProps } from "@rjsf/utils";
import { get, map, reject } from "lodash-es";
import { Plus, X } from "lucide-react";

const SourcesField = ({ formData, onChange }: FieldProps) => {
  const srcsets = get(formData, "srcsets", []) || [];

  const onChangeSources = (e, index) => {
    const key = e.target.name;
    const value = e.target.value;
    onChange({
      srcsets: map(srcsets, (source, i) => {
        if (i === index) {
          return { ...source, [key]: value };
        } else {
          return source;
        }
      }),
    });
  };

  const addNewSource = () => {
    onChange({ srcsets: [...srcsets, {}] });
  };

  const removeSource = (index) => {
    onChange({ srcsets: reject(srcsets, (_, i) => i === index) });
  };

  return (
    <div>
      <div className="flex items-center justify-between pb-2">
        <label>Responsive</label>
        <button
          type="button"
          onClick={addNewSource}
          className="flex items-center gap-x-1 rounded-md border border-blue-500 bg-blue-100 px-2 py-px text-xs text-blue-600 hover:opacity-80">
          <Plus size={12} />
        </button>
      </div>
      <div className="space-y-2">
        {map(srcsets, (source, index) => {
          return (
            <div className="group relative space-y-1.5 rounded border border-gray-200 px-2 pb-1.5">
              <button
                type="button"
                onClick={() => removeSource(index)}
                className="absolute -right-px -top-0 -translate-y-1/2 rounded-full bg-red-100 p-1 opacity-0 hover:bg-red-200 group-hover:opacity-100">
                <X size={10} className="text-red-500" />
              </button>
              <div className="flex items-center gap-x-2 rounded border">
                <label className="flex !h-6 h-full w-1/4 items-center justify-center bg-gray-200 px-2 !text-[10px] !font-medium">
                  Width
                </label>
                <input
                  name="width"
                  placeholder="Enter width (in px)"
                  type="number"
                  value={get(source, "width")}
                  onChange={(e) => onChangeSources(e, index)}
                  className="!placeholder:text-gray-100 !mt-0 !rounded-none !border-0 !p-0 !text-xs"
                />
              </div>
              <div className="flex items-center gap-x-2 rounded border">
                <label className="flex !h-6 h-full w-1/4 items-center justify-center bg-gray-200 px-2 !text-[10px] !font-medium">
                  URL
                </label>
                <input
                  name="url"
                  placeholder="Enter url"
                  className="!mt-0 !rounded-none !border-0 !p-0 !text-xs !shadow-none"
                  value={get(source, "url", "")}
                  onChange={(e) => onChangeSources(e, index)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { SourcesField };
