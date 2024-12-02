import { useTranslation } from "react-i18next";
import { CHAI_BUILDER_EVENTS } from "../../../events.ts";
import { pubsub } from "../../../pubsub";
import { PlusIcon } from "lucide-react";

export const AddBlockAtBottom = () => {
  const { t } = useTranslation();
  return (
    <div className="group relative w-full cursor-pointer">
      <br />
      <div
        onClick={() => pubsub.publish(CHAI_BUILDER_EVENTS.OPEN_ADD_BLOCK)}
        className="h-1 rounded bg-purple-500 opacity-0 duration-200 group-hover:opacity-100">
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 transform items-center gap-x-1 rounded-full bg-purple-500 px-3 py-1 text-sm leading-tight text-white hover:bg-purple-500">
          <PlusIcon className="size-3 stroke-[3]" /> {t("Add block")}
        </div>
      </div>
      <br />
    </div>
  );
};
