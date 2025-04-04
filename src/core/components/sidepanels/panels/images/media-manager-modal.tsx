import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../../../../../ui";
import { useMediaManagerComponent } from "../../../../extensions/media-manager";

const MediaManagerModal = ({
  children,
  onSelect,
  mode = "image",
}: {
  children: React.JSX.Element;
  onSelect: (urls: string[]) => void;
  mode?: "image" | "video" | "audio";
}) => {
  const [open, setOpen] = useState(false);
  const MediaManagerComponent = useMediaManagerComponent();

  const handleSelect = (...arg: any) => {
    //@ts-ignore
    onSelect.call(this, ...arg);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(_open: boolean) => setOpen(_open)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex max-h-[90vh] max-w-7xl border-border md:w-fit">
        <div className="h-full w-full">
          {MediaManagerComponent ? (
            <MediaManagerComponent close={() => setOpen(false)} onSelect={handleSelect} mode={mode} />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

MediaManagerModal.displayName = "MediaManagerModal";

export default MediaManagerModal;
