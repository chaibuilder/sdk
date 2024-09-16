import { useAddBlocksModal } from "../../../hooks/useAddBlocks.ts";
import { ROOT_TEMP_KEY } from "../../../constants/STRINGS.ts";
import { useTranslation } from "react-i18next";

export const AddBlockAtBottom = () => {
  const [, setOpen] = useAddBlocksModal();
  const { t } = useTranslation();
  return (
    <button onClick={() => setOpen(ROOT_TEMP_KEY)} className="block w-full p-2 hover:bg-gray-400">
      {t("Add block")}
    </button>
  );
};
