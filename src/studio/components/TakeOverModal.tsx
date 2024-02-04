import { Button } from "../../ui";
import { useTakeControl } from "../mutations/usePageActions.ts";
import { useCurrentPage } from "../hooks/useCurrentPage.ts";
import { usePageData } from "../hooks/usePageData.ts";
import { get } from "lodash";
import { Loader } from "lucide-react";
import { MdEmail, MdPerson } from "react-icons/md";

export const TakeOverModal = () => {
  const { mutate, isPending } = useTakeControl();
  const [currentPageUid] = useCurrentPage();
  const { data: pageData } = usePageData();
  const name = get(pageData, "lockedBy.name", "");
  const email = get(pageData, "lockedBy.email", "");
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg drop-shadow-2xl mx-auto p-10 space-y-4 text-center max-w-xl">
      <h2 className="text-2xl font-bold">
        Page is <span className="text-red-500">locked</span>
      </h2>
      <div className="text-gray-500 dark:text-gray-400 font-light">
        This page is currently being edited by <br />
        <div className="flex items-center gap-x-3 w-max mx-auto font-medium text-gray-700 mt-2 text-sm">
          <div className="flex items-center gap-x-2 bg-gray-100 py-1 px-2 rounded-md">
            <MdPerson className="w-4 h-4 text-gray-500" /> {name}
          </div>
          <div className="flex items-center gap-x-2 bg-gray-100 py-1 px-2 rounded-md lowercase">
            <MdEmail className="w-4 h-4 text-gray-500" /> {email}
          </div>
        </div>
        <div className="pt-4">
          If you take control, {name} will be <span className="text-red-500">restricted</span> from making additional
          edits.
        </div>
      </div>

      <Button
        disabled={isPending}
        onClick={() => mutate(currentPageUid)}
        className={`w-36 ${isPending ? "bg-transparent shadow-none hover:bg-transparent" : ""}`}>
        {isPending ? <Loader className="text-sm animate-spin text-gray-500" /> : "Take Over"}
      </Button>
    </div>
  );
};
