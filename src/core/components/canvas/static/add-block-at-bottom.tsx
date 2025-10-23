import { CHAI_BUILDER_EVENTS } from "@/core/events";
import { useBlocksStore, usePermissions } from "@/core/hooks";
import { PERMISSIONS } from "@/core/main";
import { pubsub } from "@/core/pubsub";
import { PlusIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import { isEmpty } from "lodash-es";

export const AddBlockAtBottom = () => {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const [blocks] = useBlocksStore();
  const canAddBlock = hasPermission(PERMISSIONS.ADD_BLOCK);

  if (!canAddBlock) return null;
  if (isEmpty(blocks))
    return (
      <div
        role="button"
        onClick={() => pubsub.publish(CHAI_BUILDER_EVENTS.OPEN_ADD_BLOCK)}
        className="flex h-full w-full cursor-pointer items-center justify-center text-center">
        <div className="flex items-center justify-center gap-1 rounded-lg border-4 border-dotted border-gray-600 px-5 py-3 text-xl hover:bg-primary">
          <PlusIcon className="size-8" /> {t("Add block")}
        </div>
      </div>
    );

  return (
    <div className="group relative w-full cursor-pointer py-2">
      <br />
      <div
        role="button"
        onClick={() => pubsub.publish(CHAI_BUILDER_EVENTS.OPEN_ADD_BLOCK)}
        className="block h-1 rounded bg-primary opacity-0 duration-200 group-hover:opacity-100">
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 transform items-center gap-x-1 rounded-full bg-primary px-3 py-1 text-xs leading-tight text-white hover:bg-primary">
          <PlusIcon className="size-2.5 stroke-[3]" /> {t("Add block")}
        </div>
      </div>
      <br />
    </div>
  );
};
