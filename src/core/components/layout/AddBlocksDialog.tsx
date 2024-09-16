import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  ScrollArea,
} from "../../../ui";
import { useTranslation } from "react-i18next";
import { ChaiBuilderBlocks } from "../sidepanels/panels/add-blocks/AddBlocks.tsx";
import { useChaiBlocks } from "@chaibuilder/runtime";
import { useBuilderProp } from "../../hooks";
import { filter, groupBy, isEmpty, map, uniq } from "lodash";
import { useAddBlocksModal } from "../../hooks/useAddBlocks.ts";

export const AddBlocksDialog = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useAddBlocksModal();
  const allChaiBlocks = useChaiBlocks();
  const filterChaiBlock = useBuilderProp("filterChaiBlock", () => true);
  const chaiBlocks = filter(allChaiBlocks, filterChaiBlock);
  const groupedBlocks = groupBy(chaiBlocks, "category") as Record<string, any[]>;
  const uniqueTypeGroup = uniq(map(groupedBlocks.core, "group"));

  //TODO: Get the new parent type from openId. Run filter function to check if the block can be added
  // else skip it

  return (
    <AlertDialog open={!isEmpty(open)} onOpenChange={() => (open ? setOpen("") : "")}>
      <AlertDialogContent className="max-h-[70vh] w-[600px] overflow-hidden">
        <AlertDialogHeader>
          <AlertDialogTitle>{t("Add blocks")}</AlertDialogTitle>
          <AlertDialogDescription>{t("Add blocks to page by clicking")}</AlertDialogDescription>
        </AlertDialogHeader>
        <ScrollArea className="no-scrollbar h-[400px] max-h-full overflow-hidden">
          <ChaiBuilderBlocks groups={uniqueTypeGroup} blocks={groupedBlocks.core} />
        </ScrollArea>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("Close")}</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
