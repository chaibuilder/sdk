import ChaiSelect from "@/core/components/ChaiSelect.tsx";
import { ChaiUILibrary } from "@/types/chaibuilder-editor-props.ts";
import { useTranslation } from "react-i18next";

export function UILibrariesSelect({
  uiLibraries,
  library,
  setLibrary,
}: {
  library?: string;
  uiLibraries: (ChaiUILibrary & { id: string })[];
  setLibrary: (library: string) => void;
}) {
  const { t } = useTranslation();
  if (!library) return null;
  return (
    <div className="h-12">
      <p className="text-xs font-bold text-gray-500">{t("Choose library")}</p>
      <ChaiSelect
        className="mb-1"
        options={uiLibraries.map((uiLibrary) => ({
          value: uiLibrary.id,
          label: uiLibrary.name,
        }))}
        defaultValue={library}
        onValueChange={(v) => setLibrary(v as any)}
      />
    </div>
  );
}
