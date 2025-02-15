import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../../../../../ui";
import { useBuilderProp } from "../../../../hooks";

const MediaManagerModal = ({
  children,
  onSelect,
}: {
  children: React.JSX.Element;
  onSelect: (url: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const MediaManagerComponent = useBuilderProp("mediaManagerComponent", null);

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
          {MediaManagerComponent ? <MediaManagerComponent onSelect={handleSelect} /> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

MediaManagerModal.displayName = "MediaManagerModal";

export default MediaManagerModal;
