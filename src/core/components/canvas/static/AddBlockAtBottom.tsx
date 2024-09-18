import { useAddBlocksModal } from "../../../hooks/useAddBlocks.ts";
import { ROOT_TEMP_KEY } from "../../../constants/STRINGS.ts";
import { useTranslation } from "react-i18next";

export const AddBlockAtBottom = () => {
  const [, setOpen] = useAddBlocksModal();
  const { t } = useTranslation();
  return (
    <button
      onClick={() => setOpen(ROOT_TEMP_KEY)}
      className="mt-1 block w-full rounded-md bg-gray-100 p-2 text-black hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700">
      {t("+ Add block")}
    </button>
  );
};
