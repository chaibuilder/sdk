import MediaManagerModal from "@/core/components/sidepanels/panels/images/media-manager-modal";
import { ChaiAsset } from "@/types";
import { WidgetProps } from "@rjsf/utils";
import { first, get, isArray, isEmpty } from "lodash-es";
import { X } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSelectedBlock, useUpdateBlocksProps } from "../hooks";

const ImagePickerField = ({ value, onChange, id, onBlur }: WidgetProps) => {
  const { t } = useTranslation();
  const selectedBlock = useSelectedBlock();
  const updateBlockProps = useUpdateBlocksProps();
  const showImagePicker = true;

  const handleSelect = (assets: ChaiAsset[] | ChaiAsset) => {
    const asset = isArray(assets) ? first(assets) : assets;
    if (asset) {
      onChange(asset?.url);
      const width = asset?.width;
      const height = asset?.height;
      if (selectedBlock?._id) {
        const props = {
          ...(width && { width: width }),
          ...(height && { height: height }),
          ...(asset.description && { alt: asset.description }),
          ...(asset.id && { assetId: asset.id }),
        };
        if (isEmpty(props)) return;
        updateBlockProps([selectedBlock._id], props);
      }
    }
  };

  const clearImage = useCallback(() => {
    onChange("");
    if (selectedBlock?._id) {
      updateBlockProps([selectedBlock._id], { assetId: "" });
    }
  }, [onChange, selectedBlock?._id, updateBlockProps]);

  const assetId = get(selectedBlock, "assetId", "");

  return (
    <div className="mt-1.5 flex items-center gap-x-3">
      {value ? (
        <div className="relative">
          <img src={value} className="h-20 w-20 overflow-hidden rounded-md border border-border object-cover" alt="" />
          <button
            type="button"
            onClick={clearImage}
            className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90">
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <MediaManagerModal onSelect={handleSelect} mode="image" assetId={assetId}>
          <div className="h-20 w-20 cursor-pointer rounded-md border border-border bg-[radial-gradient(#AAA,transparent_1px)] duration-300 [background-size:10px_10px]"></div>
        </MediaManagerModal>
      )}
      <div className="flex w-3/5 flex-col">
        {showImagePicker && (
          <>
            <MediaManagerModal onSelect={handleSelect} assetId={assetId}>
              <small className="h-6 cursor-pointer rounded-md bg-secondary px-2 py-1 text-center text-xs text-secondary-foreground hover:bg-secondary/80">
                {value || !isEmpty(value) ? t("Replace image") : t("Choose image")}
              </small>
            </MediaManagerModal>
            <small className="-pl-4 pt-2 text-center text-xs text-secondary-foreground">OR</small>
          </>
        )}
        <input
          id={id}
          autoCapitalize={"off"}
          autoCorrect={"off"}
          spellCheck={"false"}
          type="url"
          className="text-xs"
          placeholder={t("Enter image URL")}
          value={value}
          onBlur={({ target: { value: url } }) => onBlur(id, url)}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export { ImagePickerField };
