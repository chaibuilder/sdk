import { useAddBlock, useBlocksStore, useSelectedBlock, useSelectedBlockIds, useWrapperBlock } from "../hooks";
import { ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";
import { find, filter, findIndex, get } from "lodash-es";
import { FieldProps } from "@rjsf/utils";

const SliderField = ({ formData, onChange }: FieldProps) => {
  const [allBlocks] = useBlocksStore();
  const selectedBlock = useSelectedBlock();
  const wrapperBlock = useWrapperBlock();
  const { addCoreBlock } = useAddBlock();
  const [, setBlockIds] = useSelectedBlockIds();

  if (!selectedBlock && !wrapperBlock) return null;

  const sliderBlock = selectedBlock?._type === "Slider" ? selectedBlock : wrapperBlock;
  const slidesBlock = find(allBlocks, { _parent: sliderBlock?._id, _type: "Slides" });
  if (!slidesBlock) return null;

  const allSlideBlocks = filter(allBlocks, { _parent: slidesBlock?._id, _type: "Slide" });
  const currentSlide = formData?.currentSlide || get(allSlideBlocks, "0._id");

  const handleNext = () => {
    const currentIndex = findIndex(allSlideBlocks, { _id: currentSlide });
    if (currentIndex > -1) {
      const nextIndex = (currentIndex + 1) % allSlideBlocks.length;
      const nextSlideId = get(allSlideBlocks, [nextIndex, "_id"]);
      if (!nextSlideId) return;
      onChange({ ...formData, currentSlide: nextSlideId });
      setBlockIds([nextSlideId]);
    }
  };

  const handlePrevious = () => {
    const currentIndex = findIndex(allSlideBlocks, { _id: currentSlide });
    if (currentIndex > -1) {
      const previousIndex = (currentIndex - 1 + allSlideBlocks.length) % allSlideBlocks.length;
      const previousSlideId = get(allSlideBlocks, [previousIndex, "_id"]);
      if (!previousSlideId) return;
      onChange({ ...formData, currentSlide: previousSlideId });
      setBlockIds([previousSlideId]);
    }
  };

  const addNextSlide = () => {
    const newSlideBlock = addCoreBlock(
      { styles: "#styles:,h-full w-full min-w-full", type: "Slide" },
      slidesBlock?._id,
    );
    const newSlideBlockId = newSlideBlock?._id;
    if (!newSlideBlockId) return;
    onChange({ ...formData, currentSlide: newSlideBlockId });
    setBlockIds([newSlideBlockId]);
  };

  return (
    <div className="px-2">
      <div className="flex items-center gap-x-2 pb-2 text-[12px]">
        <button onClick={handlePrevious} className="rounded bg-gray-200 p-1.5 hover:opacity-80">
          <ChevronLeft className="h-3 w-3 stroke-[3]" />
        </button>
        <div className="whitespace-nowrap text-center text-[10px] text-slate-500">
          {currentSlide ? (
            <span className="">
              <b className="text-[12px]"> {findIndex(allSlideBlocks, { _id: currentSlide }) + 1}</b>/
              {allSlideBlocks.length}
            </span>
          ) : (
            "-"
          )}
        </div>
        <button onClick={handleNext} className="rounded bg-gray-200 p-1.5 hover:opacity-80">
          <ChevronRight className="h-3 w-3 stroke-[3]" />
        </button>
        <button
          onClick={addNextSlide}
          className="flex w-full items-center justify-center gap-x-1 rounded bg-gray-200 p-1.5 text-xs font-medium leading-tight hover:opacity-80">
          <PlusCircle className="h-3 w-3 stroke-[2]" />
          Add Slide
        </button>
      </div>
      <div>
        <div className="flex flex-col">
          <div className="flex items-center gap-x-2 leading-tight">
            <input
              type="checkbox"
              checked={Boolean(formData?.autoplay)}
              onChange={() => onChange({ ...formData, autoplay: !Boolean(formData?.autoplay) })}
              className="cursor-pointer"
            />
            <label htmlFor="autoplay" className="mt-0.5 text-[12px]">
              Autoplay slides
            </label>
          </div>
          {formData?.autoplay && (
            <div className="leading-tight">
              <label htmlFor="interval" className="whitespace-nowrap text-[9px]">
                Autoplay Interval <span className="font-light opacity-80">(in seconds)</span>
              </label>
              <input
                type="number"
                id="interval"
                name="interval"
                min="1"
                placeholder="2"
                value={formData?.autoplayInterval || 2}
                onChange={(e) => onChange({ ...formData, autoplayInterval: e.target.value })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { SliderField };
