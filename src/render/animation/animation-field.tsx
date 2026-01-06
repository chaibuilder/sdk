import { useSelectedBlock, useSelectedStylingBlocks, useTranslation, useUpdateBlocksProps } from "@/core/hooks";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  HeightIcon,
  PlusIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { debounce, get, isEmpty } from "lodash-es";
import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ANIMATION_TYPES,
  convertToAnimationObject,
  convertToAnimationString,
  DEFAULT_ANIMATION,
  EASING_OPTIONS,
  getDirectionOptions,
  TAnimation,
} from "./animation-utils";

const AnimationField = React.memo(() => {
  const { t } = useTranslation();
  const block = useSelectedBlock();
  const [selectedStylingBlock] = useSelectedStylingBlocks();
  const updateBlockProps = useUpdateBlocksProps();

  const attrKey = `${get(selectedStylingBlock, "0.prop")}_attrs`;
  const animationValue = get(block, `${attrKey}.data-animation`, "") as string;
  const [show, setShow] = useState(animationValue?.length > 0);

  const formData = useMemo(() => convertToAnimationObject(animationValue), [animationValue]);
  const [localData, setLocalData] = useState<TAnimation>(formData);

  useEffect(() => {
    setLocalData(formData);
  }, [formData]);

  const updateAnimation = useCallback(
    (value: string) => {
      const currentAttrs = get(block, attrKey, {}) as Record<string, string>;
      const newAttrs = { ...currentAttrs, "data-animation": value };
      if (!value) {
        delete newAttrs["data-animation"];
      }
      updateBlockProps([get(block, "_id")], { [attrKey]: newAttrs });
      setShow(true);
    },
    [block, updateBlockProps, attrKey],
  );

  const debouncedOnChange = useMemo(
    () => debounce((v: TAnimation) => updateAnimation(convertToAnimationString(v)), 300),
    [updateAnimation],
  );

  const handleChange = useCallback(
    (updates: any) => {
      const newValue = { ...localData, ...updates };
      setLocalData(newValue);
      debouncedOnChange(newValue);
    },
    [localData, debouncedOnChange],
  );

  if (isEmpty(animationValue)) {
    return (
      <div className="my-4 flex flex-col items-center justify-center border-y py-4">
        <button
          onClick={() => updateAnimation(convertToAnimationString(DEFAULT_ANIMATION))}
          className="flex w-full items-center justify-center gap-x-2 rounded-md border px-2 py-1 text-xs duration-300 hover:bg-blue-100/20 hover:text-primary">
          <PlusIcon /> {t("Add Animation")}
        </button>
        <span className="mt-1 text-center text-[10px] text-gray-400">{t("Click to add reveal animation")}</span>
      </div>
    );
  }

  return (
    <div className="relative rounded-md border">
      <div
        onClick={() => setShow(!show)}
        className={`flex cursor-pointer items-center justify-between p-2 text-xs font-medium hover:bg-blue-50`}>
        <span>{t("Animation")}</span>
        <span>
          <ChevronDownIcon className={"h-4 w-4 text-gray-500 " + (show ? "rotate-180" : "")} />
        </span>
      </div>
      {show && (
        <>
          <div className="absolute right-8 top-1 flex items-center justify-between">
            <button
              onClick={() => updateAnimation("")}
              className="flex items-center rounded-full p-1 text-xs text-red-600 duration-200 hover:bg-red-100 hover:text-red-800">
              <TrashIcon />
            </button>
          </div>

          <div className="space-y-2 p-2">
            <label className="block text-xs">
              <span className="text-gray-600">{t("Animation")}</span>
              <select
                value={localData.type || "fade"}
                onChange={(e) => {
                  const newType = e.target.value;
                  const newDirectionOptions = getDirectionOptions(newType);
                  const currentDirection = localData.direction || "none";
                  const isValidDirection = newDirectionOptions.some((opt) => opt.value === currentDirection);

                  handleChange({
                    type: newType,
                    direction: isValidDirection ? currentDirection : newDirectionOptions[0].value,
                  });
                }}
                className="mt-1 w-full cursor-pointer rounded border px-2 py-1 text-xs">
                {ANIMATION_TYPES.map((option) => (
                  <option key={option.value} value={option.value} className="cursor-pointer">
                    {t(option.label)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs">
              <span className="text-gray-600">{t("Easing")}</span>
              <select
                value={localData.easing || "ease-out"}
                onChange={(e) => handleChange({ easing: e.target.value })}
                className="mt-1 w-full cursor-pointer rounded border px-2 py-1 text-xs">
                {EASING_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="cursor-pointer">
                    {t(option.label)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1 text-xs">
              <span className="text-gray-600">{t("Direction")}</span>
              {localData?.type === "flip" ? (
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => handleChange({ direction: "y" })}
                    className={`flex items-center justify-center gap-x-1 rounded border px-3 py-1.5 text-xs transition-colors hover:bg-primary/5 hover:text-primary ${
                      localData?.direction === "y" ? "border-primary bg-primary/10 text-primary" : "border-gray-300"
                    }`}>
                    <HeightIcon className="rotate-90" />
                    <span>{t("Horizontal")}</span>
                  </button>
                  <button
                    onClick={() => handleChange({ direction: "x" })}
                    className={`flex items-center justify-center gap-x-1 rounded border px-3 py-1.5 text-xs transition-colors hover:bg-primary/5 hover:text-primary ${
                      localData?.direction === "x" ? "border-primary bg-primary/10 text-primary" : "border-gray-300"
                    }`}>
                    <HeightIcon />
                    <span>{t("Vertical")}</span>
                  </button>
                </div>
              ) : localData?.type === "rotate" ? (
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { dir: "up-left", label: "Up Left", rotation: "-rotate-45 order-2" },
                    { dir: "up-right", label: "Up Right", rotation: "rotate-45" },
                    { dir: "down-left", label: "Down Left", rotation: "rotate-45 scale-x-[-1] order-4" },
                    { dir: "down-right", label: "Down Right", rotation: "-rotate-45 scale-y-[-1]" },
                  ].map(({ dir, label, rotation }) => (
                    <button
                      key={dir}
                      onClick={() => handleChange({ direction: dir })}
                      className={`flex items-center justify-between gap-x-1 rounded border px-2 py-1.5 text-xs transition-colors hover:bg-primary/5 hover:text-primary ${
                        localData?.direction === dir ? "border-primary bg-primary/10 text-primary" : "border-gray-300"
                      }`}>
                      <HeightIcon className={rotation} />
                      <span>{t(label)}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 items-center gap-1">
                  <button
                    onClick={() => handleChange({ direction: "right" })}
                    className={`flex h-12 items-center justify-center rounded border px-2 py-1 text-xs transition-colors hover:bg-primary/5 hover:text-primary ${
                      localData?.direction === "right" ? "border-primary bg-primary/10 text-primary" : "border-gray-300"
                    }`}>
                    <ArrowLeftIcon className="h-4 w-4" />
                  </button>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleChange({ direction: "up" })}
                      className={`flex items-center justify-center rounded border px-2 py-1 text-xs transition-colors hover:bg-primary/5 hover:text-primary ${
                        localData?.direction === "up" ? "border-primary bg-primary/10 text-primary" : "border-gray-300"
                      }`}>
                      <ArrowUpIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleChange({ direction: "down" })}
                      className={`flex items-center justify-center rounded border px-2 py-1 text-xs transition-colors hover:bg-primary/5 hover:text-primary ${
                        localData?.direction === "down"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-gray-300"
                      }`}>
                      <ArrowDownIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleChange({ direction: "left" })}
                    className={`flex h-12 items-center justify-center rounded border px-2 py-1 text-xs transition-colors hover:bg-primary/5 hover:text-primary ${
                      localData?.direction === "left" ? "border-primary bg-primary/10 text-primary" : "border-gray-300"
                    }`}>
                    <ArrowRightIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="block text-xs">
                <span className="text-gray-600">{t("Duration (ms)")}</span>
                <input
                  type="number"
                  min={0}
                  max={3000}
                  value={localData.duration || 600}
                  onChange={(e) => handleChange({ duration: parseInt(e.target.value) })}
                  className="mt-1 w-full rounded border px-2 py-1 text-xs"
                />
              </label>

              <label className="block text-xs">
                <span className="text-gray-600">{t("Delay (ms)")}</span>
                <input
                  type="number"
                  min={0}
                  max={2000}
                  value={localData.delay}
                  onChange={(e) => handleChange({ delay: parseInt(e.target.value) })}
                  className="mt-1 w-full rounded border px-2 py-1 text-xs"
                />
              </label>
            </div>

            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={localData.triggerOnce ?? true}
                onChange={(e) => handleChange({ triggerOnce: e.target.checked })}
                className="cursor-pointer"
              />
              <span className="cursor-pointer text-gray-600">{t("Play Once")}</span>
            </label>
          </div>
        </>
      )}
    </div>
  );
});

export default AnimationField;
