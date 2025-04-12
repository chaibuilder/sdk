import { WidgetProps } from "@rjsf/utils";
import { first, isEmpty } from "lodash-es";
import { useTranslation } from "react-i18next";
import MediaManagerModal from "../components/sidepanels/panels/images/media-manager-modal.tsx";

const ImagePickerField = ({ value, onChange, id, onBlur }: WidgetProps) => {
  const { t } = useTranslation();

  const showImagePicker = true;

  return (
    <div className="mt-1.5 flex items-center gap-x-3">
      {value ? (
        <img src={value} className="h-20 w-20 overflow-hidden rounded-md border border-border object-cover" alt="" />
      ) : (
        <MediaManagerModal onSelect={(urls: string[]) => onChange(first(urls))} mode="image">
          <div className="h-20 w-20 cursor-pointer rounded-md border border-border bg-[radial-gradient(#AAA,transparent_1px)] duration-300 [background-size:10px_10px]"></div>
        </MediaManagerModal>
      )}
      <div className="flex w-3/5 flex-col">
        {showImagePicker && (
          <>
            <MediaManagerModal onSelect={onChange}>
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
