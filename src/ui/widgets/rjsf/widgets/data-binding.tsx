import {
  filter,
  find,
  first,
  forEach,
  get,
  includes,
  isArray,
  isEmpty,
  last,
  map,
  omit,
  set,
  split,
  startCase,
  toLower,
  truncate,
} from "lodash-es";
import { Check, EditIcon, TrashIcon } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../..";
import { getBlockComponent, getChaiDataProviders } from "@chaibuilder/runtime";
import { ErrorBoundary } from "../../../../core/components/ErrorBoundary.tsx";
import { useSelectedBlock } from "../../../../core/hooks";
import { useChaiExternalData } from "../../../../core/components/canvas/static/useChaiExternalData.ts";

const LazyJsonViewer = React.lazy(() => import("react-json-view"));

// * Object to Path and Data Type
function getPathAndTypes(obj) {
  const paths = [];
  const pathsType = {};

  function traverse(currentPath, currentObj) {
    forEach(currentObj, (value, key) => {
      const newPath = currentPath ? `${currentPath}.${key}` : key;
      const type = isArray(value) ? "list" : typeof value;

      paths.push(newPath);
      pathsType[newPath] = type === "string" ? "text" : type === "object" ? "model" : type;

      if (type === "object" && !isArray(value)) {
        traverse(newPath, value);
      }
    });
  }

  traverse("", omit(obj, ["styles", "_type", "_id", "_name", "_bindings"]));
  return { paths, pathsType };
}

const ViewData = ({ data, fullView }: { data: any; fullView?: boolean }) => {
  if (!data) return null;
  const type = typeof data;

  if (fullView) {
    return typeof data === "object" ? (
      <>
        <div className="h-3" />
        <ErrorBoundary>
          <LazyJsonViewer
            style={{ maxHeight: "40vh", overflowY: "auto" }}
            name={"Content"}
            enableClipboard={false}
            displayObjectSize={false}
            displayDataTypes={false}
            src={data}
            collapsed={true}
          />
        </ErrorBoundary>
      </>
    ) : (
      <div className="text-gray-800/50 text-[12px] leading-4 w-full max-h-36 overflow-x-hidden overflow-y-auto">
        <span className="font-medium text-gray-800/80">Content: </span>
        {data}
      </div>
    );
  }

  return (
    <div className="text-[10px] text-gray-800/50 leading-3 whitespace-nowrap overflow-hidden w-full">
      {truncate(type === "object" ? JSON.stringify(data) : data, { length: 40 })}
    </div>
  );
};

/**
 *
 * @param param0
 * @returns Auto suggestion
 */
const DataProvidersSuggester = ({
  type,
  value = "",
  setValue,
  data,
  onChange,
  dataType,
  appliedBindings,
}: {
  isDisabled: boolean;
  type: "PROP" | "PATH";
  placeholder: string;
  value: string;
  setValue: (arg: any) => void;
  data: any;
  onChange: (_: string) => void;
  dataType?: string;
  appliedBindings: string[];
}) => {
  const { paths: suggestedPath, pathsType: suggestedPathDataType } = getPathAndTypes(data);
  const coreBlock = type === "PROP" ? getBlockComponent(data?._type) : {};

  const isProp = type === "PROP";
  const [open, setOpen] = useState(false);

  const options: string[] = useMemo(() => {
    if (type === "PROP") {
      return suggestedPath.filter(
        (item) => !includes(appliedBindings, item) && get(coreBlock, `props.${first(split(item, "."))}.binding`),
      );
    } else {
      return suggestedPath.filter((item) => dataType === get(suggestedPathDataType, item, ""));
    }
  }, [type, suggestedPath, appliedBindings, dataType, coreBlock]);

  useEffect(() => {
    if (value) onChange(value);
  }, [value, type]);

  return (
    <>
      <div className="flex items-center space-x-4">
        <p className="text-sm text-muted-foreground">{startCase(toLower(type))}</p>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={` ${
                !isEmpty(value)
                  ? "min-w-[350px] justify-between items-center"
                  : "bg-blue-500 text-gray-100 hover:bg-blue-400 hover:text-white w-44 justify-center"
              }`}>
              {value ? (
                <>
                  <span className={`text-sm pr-8`}>
                    {isProp && (
                      <span className="text-[10px] text-purple-500 bg-purple-100 px-2 py-0.5 mr-2 rounded-full">
                        {startCase(dataType)}
                      </span>
                    )}
                    {value}
                  </span>
                  <span className="text-[9px] text-blue-400 underline cursor-pointer hover:text-blue-700">Change</span>
                </>
              ) : (
                <>+ Set {startCase(toLower(type))}</>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 z-[999] min-w-[300px]" side="right" align="start">
            <Command>
              <CommandInput placeholder={`Choose ${toLower(type)}...`} />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {map(options, (status: string) => (
                    <CommandItem
                      key={status}
                      value={status}
                      className={`cursor-pointer ${
                        isProp ? "flex justify-between items-center" : "flex flex-col items-start justify-start"
                      }`}
                      onSelect={(value) => {
                        setValue(find(options, (priority) => priority === value) || null);
                        setOpen(false);
                      }}>
                      <div className="flex items-center gap-x-2">
                        <Check className={`w-4 h-4 text-green-500 ${value === status ? "" : "opacity-0"}`} />
                        {status}
                      </div>
                      {isProp ? (
                        <div>
                          <span className="text-[10px] text-purple-500 bg-purple-100 px-2 py-0.5 rounded-full">
                            {startCase(get(suggestedPathDataType, status, ""))}
                          </span>
                        </div>
                      ) : (
                        <div className="pl-6">
                          <ViewData data={get(data, status)} />
                        </div>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      {!isProp && !isEmpty(value) && (
        <div className="pt-2">
          <ViewData data={get(data, value, "")} fullView={true} />
        </div>
      )}
    </>
  );
};

const AddBindingModalContent = ({
  appliedBindings = [],
  onAddBinding,
  editMode,
  item,
}: {
  appliedBindings: string[];
  onAddBinding: (data: any) => void;
  editMode: boolean;
  item?: { key: string; value: string };
}) => {
  const [prop, setProp] = useState(editMode ? item.key : "");
  const [path, setPath] = useState(editMode ? item.value : "");

  const selectedBlock = useSelectedBlock() as any;
  const [dataProvider] = useChaiExternalData();

  const getDataType = useCallback(
    (key: string, type: "PROP" | "PATH") => {
      if (isEmpty(key)) return "";
      else {
        const value = get(type === "PROP" ? selectedBlock : dataProvider, key, "");
        if (isArray(value)) return "list";
        const _dataType = typeof value;
        if (_dataType === "string") return "text";
        if (_dataType === "object") return "model";
        return _dataType;
      }
    },
    [selectedBlock, dataProvider],
  );

  const [dataType, setDataType] = useState(editMode ? getDataType(item.key, "PROP") : "");

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add Data Binding</DialogTitle>
        <DialogDescription className="text-xs">
          Add prop and path of binding. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-1 relative">
        <DataProvidersSuggester
          type="PROP"
          isDisabled={false}
          placeholder="Enter prop key"
          value={prop}
          setValue={setProp}
          onChange={(value) => {
            const _dataType = getDataType(value, "PROP");
            setProp(value);
            if (dataType !== _dataType) setPath("");
            setDataType(_dataType);
          }}
          data={selectedBlock}
          dataType={dataType}
          appliedBindings={appliedBindings}
        />
        <div className="h-2" />
        <DataProvidersSuggester
          type="PATH"
          isDisabled={isEmpty(prop)}
          placeholder="Enter data path"
          value={path}
          setValue={setPath}
          onChange={(value) => {
            const _dataType = getDataType(value, "PATH");
            setPath(dataType === _dataType ? value : "");
          }}
          data={dataProvider}
          dataType={dataType}
          appliedBindings={appliedBindings}
        />
      </div>

      <DialogFooter>
        <Button
          type="submit"
          className="mt-4"
          disabled={isEmpty(prop) && isEmpty(path)}
          onClick={() => onAddBinding({ key: prop, value: path })}>
          Save
        </Button>
      </DialogFooter>
    </>
  );
};

/**
 *
 * @returns Add JSON viewer to select path of data
 *
 */
const AddBindingModal = ({ disabled, children, onAddBinding, appliedBindings, editMode = true, item = {} }: any) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog>
      <DialogTrigger disabled={disabled} asChild onClick={() => setOpen(true)}>
        {children}
      </DialogTrigger>
      {open && (
        <DialogContent>
          <AddBindingModalContent
            item={item}
            editMode={editMode}
            appliedBindings={appliedBindings}
            onAddBinding={(args) => {
              onAddBinding(args);
              setOpen(false);
            }}
          />
        </DialogContent>
      )}
    </Dialog>
  );
};

/**
 *
 *
 *
 * @param {item, onChange, onRemove }
 * @returns Single Data Binding Pair
 */
const NewDataBindingPair = ({
  item,
  onAddBinding,
  onRemove,
  selectedBlock,
  dataProvider,
  appliedBindings,
}: {
  item: { key: string; value: string };
  onAddBinding: () => void;
  onRemove: () => void;
  dataProvider: any;
  selectedBlock: any;
  appliedBindings: string[];
}) => {
  const [dataType, setDataType] = useState("string");

  const getDataType = (key: string, type: "PROP" | "PATH") => {
    if (isEmpty(key)) return "";
    else {
      const value = get(type === "PROP" ? selectedBlock : dataProvider, key, "");
      if (isArray(value)) return "list";
      const _dataType = typeof value;
      if (_dataType === "string") return "text";
      if (_dataType === "object") return "model";
      return _dataType;
    }
  };

  useEffect(() => setDataType(() => getDataType(item.key, "PROP")), [item.key]);

  return (
    <div className={`flex flex-col border border-gray-200 relative rounded-md p-2`}>
      <div className="text-gray-500 font-normal text-sm">{item.key}</div>
      <div className="font-medium leading-5">{item.value}</div>
      <ViewData data={get(dataProvider, item.value, "")} />

      <div className="flex items-center justify-end gap-x-2">
        <AddBindingModal editMode onAddBinding={onAddBinding} appliedBindings={appliedBindings} item={item}>
          <EditIcon className="h-6 w-6 mt-1 cursor-pointer rounded border hover:bg-blue-400 hover:text-white border-blue-400 p-1 text-blue-400 hover:scale-105 duration-200" />
        </AddBindingModal>
        <TrashIcon
          onClick={() => onRemove()}
          className="h-6 w-6 mt-1 cursor-pointer rounded border hover:bg-red-400 hover:text-white border-red-400 p-1 text-red-400 hover:scale-105 duration-200"
        />
      </div>
      {!isEmpty(dataType) && !isEmpty(item.key) && (
        <div className="mt-px absolute right-0 top-1 text-purple-600 text-[10px] flex items-center font-medium h-4 px-2 rounded-full">
          {startCase(dataType)}
        </div>
      )}
    </div>
  );
};

/**
 *
 *
 *
 *
 * @param { formData, onChange }
 * @returns Widget for Data Bindings
 */
const DataBindingSetting = ({ bindingData, onChange }: { bindingData: any; onChange: (data: any) => void }) => {
  const selectedBlock = useSelectedBlock() as any;
  const [dataProvider] = useChaiExternalData();
  const providers = getChaiDataProviders();
  const [_formData, setFormData] = useState<Array<{ key: string; value: string }>>(
    map(bindingData, (value, key) => ({ key, value })),
  );

  useEffect(() => {
    setFormData(map(bindingData, (value, key) => ({ key, value })));
  }, [selectedBlock?._id]);

  // * Disable if key of last element not added
  const isAddDisabled = useMemo(() => {
    if (isEmpty(dataProvider)) return true;
    if (isEmpty(_formData)) return false;
    const lastElement = last(_formData);
    return isEmpty(lastElement?.key) || isEmpty(lastElement?.value);
  }, [dataProvider, _formData]);

  const addNewBindingProp = (newItem: { key: string; value: string }) => {
    const existingBinding = filter(_formData, (item) => item.key !== newItem.key);
    setFormData([...existingBinding, newItem]);
    updateFormData([...existingBinding, newItem]);
  };

  const removeBindingProp = (index: number) => {
    const __formData = filter(_formData, (_, ind) => index !== ind);
    updateFormData([...__formData]);
  };

  // * Update form data in _bindings
  const updateFormData = useCallback(
    (updatedFormData: any = []) => {
      setFormData(updatedFormData);
      if (isEmpty(updatedFormData)) {
        onChange({});
        return;
      }
      const __formData = {};
      forEach(updatedFormData, (item) => {
        if (!isEmpty(item?.key) && !isEmpty(item?.value)) set(__formData, item.key, item.value);
      });
      onChange(__formData);
    },
    [onChange],
  );

  if (isEmpty(providers)) {
    return (
      <div className="w-full flex items-center justify-center">
        <p className="text-gray-500 mb-1.5 text-xs">
          You have no data providers registered. Please add a data provider to your project. <br />
          <a className="text-blue-500" href="https://chaibuilder.com/docs/registering-data-providers" target={"_blank"}>
            Learn more
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {map(_formData, (item, index) => (
        <NewDataBindingPair
          item={item}
          key={item.key}
          // @ts-ignore
          onAddBinding={addNewBindingProp}
          onRemove={() => removeBindingProp(index)}
          selectedBlock={selectedBlock}
          dataProvider={dataProvider}
          appliedBindings={map(_formData, "key")}
        />
      ))}
      <Tooltip delayDuration={200}>
        <TooltipTrigger className="w-full">
          <AddBindingModal
            disabled={isAddDisabled}
            appliedBindings={map(_formData, "key")}
            onAddBinding={addNewBindingProp}>
            <span
              className={`w-full px-5 py-1.5 text-xs rounded-md font-medium duration-200 ${
                isAddDisabled
                  ? "cursor-not-allowed bg-gray-200 text-gray-400"
                  : "bg-blue-700/20 text-blue-800 hover:bg-blue-700/30"
              }`}>
              {isEmpty(dataProvider) ? (
                <small className="text-gray-500 text-[9.5px]">No data provider has been set up for this page</small>
              ) : (
                "+ Add Data Binding"
              )}
            </span>
          </AddBindingModal>
        </TooltipTrigger>
        {isAddDisabled && (
          <TooltipContent sideOffset={-55} className="text-[11px]">
            {isEmpty(dataProvider)
              ? "No data provider has been set up for this page."
              : "Complete last added data binding to add more"}
          </TooltipContent>
        )}
      </Tooltip>
    </div>
  );
};

export default DataBindingSetting;
