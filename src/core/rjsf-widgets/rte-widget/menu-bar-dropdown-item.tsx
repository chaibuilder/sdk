import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/ui";
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
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger className={`relative outline-none`}>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent className="z-50 rounded-md border bg-white p-1 text-xs shadow-xl">
          {isOpen && (typeof content === "function" ? content(() => setIsOpen(false)) : content)}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default RteDropdownMenu;
