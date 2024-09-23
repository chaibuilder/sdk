import { useTranslation } from "react-i18next";
import { CHAI_BUILDER_EVENTS, emitChaiBuilderMsg } from "../../../events.ts";

export const AddBlockAtBottom = () => {
  const { t } = useTranslation();
  return (
    <button
      onClick={() => emitChaiBuilderMsg({ name: CHAI_BUILDER_EVENTS.OPEN_ADD_BLOCK })}
      className="mt-1 block w-full rounded-md bg-gray-100 p-2 text-black hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-700">
      + {t("add_block")}
    </button>
  );
};
