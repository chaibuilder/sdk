import { WidgetProps } from "@rjsf/utils";
import { isEmpty } from "lodash-es";
import { useTranslation } from "react-i18next";
import MediaManagerModal from "../components/sidepanels/panels/images/MediaManagerModal.tsx";
import { useBuilderProp } from "../hooks";

const ImagePickerField = ({ value, onChange, id, onBlur }: WidgetProps) => {
  const mediaManagerComponent = useBuilderProp("mediaManagerComponent", null);
  const { t } = useTranslation();

  const showImagePicker = !isEmpty(mediaManagerComponent);

  return (
    <div className="mt-1.5 flex items-center gap-x-3">
      {value ? (
        <img src={value} className="h-20 w-20 overflow-hidden rounded-md border border-border object-cover" alt="" />
      ) : (
        <MediaManagerModal onSelect={onChange}>
          <div className="h-20 w-20 cursor-pointer rounded-md border border-border bg-[radial-gradient(#AAA,transparent_1px)] duration-300 [background-size:10px_10px]"></div>
        </MediaManagerModal>
      )}
      <div className="flex w-3/5 flex-col">
        {showImagePicker && (
          <>
            <MediaManagerModal onSelect={onChange}>
              <small className="h-6 cursor-pointer rounded-md bg-primary px-2 py-1 text-center text-xs text-white hover:bg-gray-500 dark:bg-gray-700">
                {value || !isEmpty(value) ? t("Replace image") : t("Choose image")}
              </small>
            </MediaManagerModal>
            <small className="-pl-4 pt-2 text-center text-xs text-gray-600">OR</small>
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
