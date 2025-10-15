import { DropdownMenu, DropdownMenuTrigger } from "@/ui/shadcn/components/ui/dropdown-menu";
import React, { useState } from "react";

const RteDropdownMenu = ({
  trigger,
  content,
}: {
  trigger: React.ReactNode;
  content: React.ReactNode | ((onClose: () => void) => React.ReactNode);
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* {from === "canvas" &&
        cloneElement(trigger as any, {
          onClick: () => setIsOpen((prev) => !prev),
        })} */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger className={`relative outline-none`}>{trigger}</DropdownMenuTrigger>
        {isOpen && (typeof content === "function" ? content(() => setIsOpen(false)) : content)}
      </DropdownMenu>
    </>
  );
};

export default RteDropdownMenu;
