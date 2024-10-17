import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../../../../../ui";
import ImagesPanel from "./ImagesPanel";
import { useBuilderProp } from "../../../../hooks";

const ImagePickerModal = ({ children, onSelect }: { children: React.JSX.Element; onSelect: (url: string) => void }) => {
  const [open, setOpen] = useState(false);
  const MediaManagerComponent = useBuilderProp("mediaManagerComponent", ImagesPanel);

  const handleSelect = (...arg: any) => {
    //@ts-ignore
    onSelect.call(this, ...arg);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(_open: boolean) => setOpen(_open)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex h-3/4 max-w-5xl border-border">
        <div className="h-full w-full">
          <MediaManagerComponent isModalView onSelect={handleSelect} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

ImagePickerModal.displayName = "ImagePickerModal";

export default ImagePickerModal;
