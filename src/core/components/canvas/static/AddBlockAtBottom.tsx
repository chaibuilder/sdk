import { PlusIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePermissions } from "../../../hooks";
import { CHAI_BUILDER_EVENTS, PERMISSIONS } from "../../../main";
import { pubsub } from "../../../pubsub";

export const AddBlockAtBottom = () => {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const canAddBlock = hasPermission(PERMISSIONS.ADD_BLOCK);

  if (!canAddBlock) return null;

  return (
    <div className="group relative w-full cursor-pointer py-2">
      <br />
      <div
        role="button"
        onClick={() => pubsub.publish(CHAI_BUILDER_EVENTS.OPEN_ADD_BLOCK)}
        className="block h-1 rounded bg-purple-500 opacity-0 duration-200 group-hover:opacity-100">
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 transform items-center gap-x-1 rounded-full bg-purple-500 px-3 py-1 text-xs leading-tight text-white hover:bg-purple-500">
          <PlusIcon className="size-2.5 stroke-[3]" /> {t("Add block")}
        </div>
      </div>
      <br />
    </div>
  );
};
