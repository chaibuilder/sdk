import { useFrame } from "@/core/frame";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/ui";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const RteDropdownMenu = ({
  trigger,
  content,
  from,
  menuRef,
}: {
  trigger: React.ReactNode;
  content: React.ReactNode | ((onClose: () => void) => React.ReactNode);
  from: "canvas" | "settings";
  menuRef: React.RefObject<HTMLDivElement>;
}) => {
  const { document } = useFrame();
  const [state, setState] = useState({ left: undefined, right: undefined, top: undefined, bottom: undefined });
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setState({ left: undefined, right: undefined, top: undefined, bottom: undefined });
      return;
    }

    const rect = triggerRef.current?.getBoundingClientRect();
    const menuRect = menuRef.current?.getBoundingClientRect();
    let left = rect?.left;
    let top = rect?.bottom;
    let right = undefined;
    let bottom = undefined;
    if (menuRect?.left + menuRect?.width + 50 >= document.body.offsetWidth) {
      left = undefined;
      right = document.body.offsetWidth - rect?.right;
    }
    if (top + 300 >= document.body.clientHeight) {
      top = null;
      bottom = document.body.clientHeight - rect?.bottom + menuRect?.height;
    }
    setState({ left, top, right, bottom });
  }, [isOpen]);

  if (from === "canvas") {
    return (
      <>
        <div ref={triggerRef} onClick={() => setIsOpen((prev) => !prev)}>
          {trigger}
        </div>
        {isOpen &&
          (state.left !== undefined ||
            state.top !== undefined ||
            state.right !== undefined ||
            state.bottom !== undefined) &&
          createPortal(
            <div onClick={() => setIsOpen(false)} className="fixed inset-0 left-0 top-0 h-full w-screen">
              <div
                onClick={(e) => e.stopPropagation()}
                className={`absolute z-50 rounded-md border bg-white p-1.5 text-xs shadow-xl`}
                style={Object.assign(
                  {},
                  { left: state.left, top: state.top, right: state.right, bottom: state.bottom },
                )}>
                {typeof content === "function" ? content(() => setIsOpen(false)) : content}
              </div>
            </div>,
            document.body,
          )}
      </>
    );
  }

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger className={`relative outline-none`}>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent className={`z-50 rounded-md border bg-white p-1 text-xs shadow-xl`}>
          {isOpen && (typeof content === "function" ? content(() => setIsOpen(false)) : content)}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default RteDropdownMenu;
