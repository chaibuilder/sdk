import React from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from "../../ui";
import { useDeletePage } from "../mutations/usePageActions";
import { TrashIcon } from "@radix-ui/react-icons";

const DeletePage = ({ pageData, projectData }: { pageData: any; projectData: any }): React.ReactElement => {
  const setCurrentPage = {} as any;
  const deletePage = useDeletePage();
  const isHomePage = pageData.uuid === projectData.homepage;

  const handleDelete = () => {
    deletePage.mutate(pageData, {
      onSuccess: () => {
        setCurrentPage({ uuid: projectData.homepage, slug: "/home" });
      },
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger disabled={isHomePage}>
        <div
          className={`flex h-full items-center justify-center rounded-md border px-2 py-2 font-medium hover:bg-red-400 hover:text-white ${
            isHomePage ? "cursor-not-allowed border-red-200 text-red-200" : "cursor-pointer border-red-400 text-red-400"
          }`}>
          <TrashIcon />
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>
          Are you sure you want to delete <i className="text-red-500">{pageData.name}</i> page?
        </AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete your page.
        </AlertDialogDescription>
        <div className="flex items-center justify-end gap-x-3">
          <AlertDialogCancel disabled={deletePage.isPending}>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={handleDelete} disabled={deletePage.isPending}>
            Yes, Delete
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePage;
