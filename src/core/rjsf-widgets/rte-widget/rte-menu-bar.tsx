import { cn } from "@/core/utils/cn";
import {
  CaretDownIcon,
  EnterFullScreenIcon,
  FontBoldIcon,
  FontItalicIcon,
  Link2Icon,
  LinkBreak2Icon,
  ListBulletIcon,
  StrikethroughIcon,
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  UnderlineIcon,
  ValueIcon,
} from "@radix-ui/react-icons";
import RteDropdownMenu from "./rte-dropdown-menu";
import RteColorPicker from "./rte-color-picker";
import { useRef } from "react";

const getActiveClasses = (editor: any, keys: string[] | boolean, from: string) => {
  const isFromSettings = from === "settings";
  const isActive = typeof keys === "boolean" ? keys : keys.some((key) => editor.isActive(key));
  return {
    "rounded p-1": true,
    "hover:bg-blue-900 hover:text-blue-100": !isActive && !isFromSettings,
    "hover:bg-blue-100 hover:text-blue-900": !isActive && isFromSettings,
    "bg-blue-500 text-white": isActive && isFromSettings,
    "bg-white text-blue-500": isActive && !isFromSettings,
  };
};

interface RteMenubarProps {
  editor: any;
  from?: "settings" | "canvas";
  onExpand?: () => void;
}

const RteMenubar = ({ editor, from = "settings", onExpand }: RteMenubarProps) => {
  const menuRef = useRef(null);
  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("URL");
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  return (
    <div
      ref={menuRef}
      id="chai-rich-text-menu-bar"
      className={cn("mb-1 flex flex-wrap gap-0.5 rounded-t-md border-b border-border bg-gray-50 p-1", {
        "mb-0 rounded-md border-none bg-blue-500 text-white": from === "canvas",
      })}>
      {/* BOLD/ITALIC/UNDERLINE/STRIKE */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn("", getActiveClasses(editor, ["bold"], from))}
        title="Bold">
        <FontBoldIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn("", getActiveClasses(editor, ["italic"], from))}
        title="Italic">
        <FontItalicIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={cn("", getActiveClasses(editor, ["underline"], from))}
        title="Underline">
        <UnderlineIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={cn("", getActiveClasses(editor, ["strike"], from))}
        title="Strike">
        <StrikethroughIcon className="h-4 w-4" />
      </button>

      <div className="mx-1 h-5 w-px self-center bg-border" />

      {/* COLOR PICKER */}
      <RteColorPicker editor={editor} from={from} menuRef={menuRef} />

      <div className="mx-1 h-5 w-px self-center bg-border" />

      {/* LIST */}
      <RteDropdownMenu
        editor={editor}
        menuRef={menuRef}
        from={from}
        trigger={
          <button
            type="button"
            className={cn("flex items-center", getActiveClasses(editor, ["bulletList", "orderedList"], from))}
            title="Bullet List">
            <ListBulletIcon className="h-4 w-4" />
            <CaretDownIcon className="h-3 w-3 opacity-50" />
          </button>
        }
        content={(onClose) => (
          <>
            <div
              onClick={() => {
                editor.chain().focus().toggleBulletList().run();
                onClose();
              }}
              className={cn(
                "flex cursor-pointer items-center gap-x-1 outline-none hover:outline-none",
                getActiveClasses(editor, ["bulletList"], from),
              )}>
              <ListBulletIcon className="h-4 w-4" /> Unordered List
            </div>
            <div
              onClick={() => {
                editor.chain().focus().toggleOrderedList().run();
                onClose();
              }}
              className={cn(
                "flex cursor-pointer items-center gap-x-1 outline-none hover:outline-none",
                getActiveClasses(editor, ["orderedList"], from),
              )}>
              <ValueIcon className="h-4 w-4" />
              Ordered List
            </div>
          </>
        )}
      />

      {/* TEXT ALIGNMENT */}
      <RteDropdownMenu
        editor={editor}
        menuRef={menuRef}
        from={from}
        trigger={
          <button
            type="button"
            className={cn(
              "flex items-center",
              getActiveClasses(
                editor,
                editor.isActive({ textAlign: "center" }) || editor.isActive({ textAlign: "right" }),
                from,
              ),
            )}
            title="Text Alignment">
            {editor.isActive({ textAlign: "center" }) ? (
              <TextAlignCenterIcon className="h-4 w-4" />
            ) : editor.isActive({ textAlign: "right" }) ? (
              <TextAlignRightIcon className="h-4 w-4" />
            ) : (
              <TextAlignLeftIcon className="h-4 w-4" />
            )}
            <CaretDownIcon className="h-3 w-3 opacity-50" />
          </button>
        }
        content={(onClose) => (
          <>
            <div
              onClick={() => {
                editor.chain().focus().setTextAlign("left").run();
                onClose();
              }}
              className={cn(
                "flex cursor-pointer items-center gap-x-1 outline-none hover:outline-none",
                getActiveClasses(editor, editor.isActive({ textAlign: "left" }), from),
              )}>
              <TextAlignLeftIcon className="h-4 w-4" /> Align Left
            </div>
            <div
              onClick={() => {
                editor.chain().focus().setTextAlign("center").run();
                onClose();
              }}
              className={cn(
                "flex cursor-pointer items-center gap-x-1 outline-none hover:outline-none",
                getActiveClasses(editor, editor.isActive({ textAlign: "center" }), from),
              )}>
              <TextAlignCenterIcon className="h-4 w-4" /> Align Center
            </div>
            <div
              onClick={() => {
                editor.chain().focus().setTextAlign("right").run();
                onClose();
              }}
              className={cn(
                "flex cursor-pointer items-center gap-x-1 outline-none hover:outline-none",
                getActiveClasses(editor, editor.isActive({ textAlign: "right" }), from),
              )}>
              <TextAlignRightIcon className="h-4 w-4" /> Align Right
            </div>
          </>
        )}
      />

      {/* LINK */}
      {!editor.isActive("link") ? (
        <button
          type="button"
          onClick={addLink}
          className={cn("", getActiveClasses(editor, ["link"], from))}
          title="Add Link">
          <Link2Icon className="h-3.5 w-3.5" />
        </button>
      ) : (
        <button
          type="button"
          onClick={removeLink}
          className={cn("", getActiveClasses(editor, ["link"], from))}
          title="Remove Link"
          disabled={!editor.isActive("link")}>
          <LinkBreak2Icon className="h-3.5 w-3.5" />
        </button>
      )}

      {/* FULL SCREEN */}
      {onExpand && (
        <>
          <div className="mx-1 h-5 w-px self-center bg-border" />
          <button
            type="button"
            onClick={onExpand}
            className={cn("", getActiveClasses(editor, false, from))}
            title="Open in full screen mode">
            <EnterFullScreenIcon className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </div>
  );
};

export default RteMenubar;
