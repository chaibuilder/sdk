import React, { useState } from "react";
import { kebabCase } from "lodash-es";
import { Button, Dialog, DialogContent, DialogTrigger } from "../../ui";
import { SingleLineText } from "@chaibuilder/runtime/controls";
import { Form } from "./form";
import { useAddPage } from "../mutations/usePageActions";

const AddPageModalContent = ({ closeModal }: { closeModal: any }): React.ReactElement => {
  const addPage = useAddPage();
  const [pageData, setPageData] = useState({
    name: "",
    slug: "",
    blocks: [],
    type: "STATIC",
    seoData: {},
    template: "",
  });

  const handleAddPage = () => {
    addPage.mutate(pageData, { onSuccess: () => closeModal() });
  };

  const updateRealtime = ({ formData }: any, key?: string): void => {
    setPageData((currentData: any) => {
      if (!key) currentData;
      const newData = { [key as string]: formData[key as string] };
      if (key === "name") {
        newData.slug = kebabCase(formData[key]?.replace(/\d/g, ""));
      } else if (key === "slug") {
        newData.slug = formData[key]?.replace(/\d/g, "").replace(/\s+/g, "").replace("--", "-").replace("__", "_");
      }
      return {
        ...currentData,
        ...newData,
      };
    });
  };

  const properties = {
    name: SingleLineText({
      title: "Page Name",
      default: pageData.name as string,
    }),
    slug: SingleLineText({ title: "Page Slug", default: pageData.slug }),
  };

  return (
    <DialogContent>
      <div className="px-1 font-bold">Add Page</div>
      <Form formData={pageData} properties={properties} onChange={updateRealtime} disabled={addPage.isPending} />

      <div className="flex items-center justify-end">
        <Button
          type="submit"
          disabled={
            !pageData.name ||
            !pageData.slug ||
            pageData.name?.length < 2 ||
            pageData.slug?.length < 2 ||
            addPage.isPending
          }
          onClick={handleAddPage}>
          Add Page
        </Button>
      </div>
    </DialogContent>
  );
};

const AddPageModal = (): React.ReactElement => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={() => setOpen(!open)}>
      <DialogTrigger asChild>
        <Button size="sm" variant="link" className="text-blue-500" onClick={() => setOpen(!open)}>
          + New Page
        </Button>
      </DialogTrigger>
      {open && <AddPageModalContent closeModal={() => setOpen(!open)} />}
    </Dialog>
  );
};

export default AddPageModal;
