import { WidgetProps } from "@rjsf/utils";
import Link from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Maximize2,
  Strikethrough,
  Underline,
  Unlink,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../../ui/shadcn/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/shadcn/components/ui/dialog";
import { cn } from "../utils/cn";

const MenuBar = ({ editor, onExpand }: { editor: any; onExpand?: () => void }) => {
  if (!editor) {
    return null;
  }

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
    <div className="mb-1 flex flex-wrap gap-1 rounded-md border border-border p-1">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn("rounded p-1 hover:bg-muted", { "bg-muted": editor.isActive("bold") })}
        title="Bold">
        <Bold className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn("rounded p-1 hover:bg-muted", { "bg-muted": editor.isActive("italic") })}
        title="Italic">
        <Italic className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={cn("rounded p-1 hover:bg-muted", { "bg-muted": editor.isActive("underline") })}
        title="Underline">
        <Underline className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={cn("rounded p-1 hover:bg-muted", { "bg-muted": editor.isActive("strike") })}
        title="Strike">
        <Strikethrough className="h-4 w-4" />
      </button>
      <div className="mx-1 h-6 w-px self-center bg-border" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn("rounded p-1 hover:bg-muted", { "bg-muted": editor.isActive("bulletList") })}
        title="Bullet List">
        <List className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn("rounded p-1 hover:bg-muted", { "bg-muted": editor.isActive("orderedList") })}
        title="Ordered List">
        <ListOrdered className="h-4 w-4" />
      </button>
      <div className="mx-1 h-6 w-px self-center bg-border" />
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={cn("rounded p-1 hover:bg-muted", { "bg-muted": editor.isActive({ textAlign: "left" }) })}
        title="Align Left">
        <AlignLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={cn("rounded p-1 hover:bg-muted", { "bg-muted": editor.isActive({ textAlign: "center" }) })}
        title="Align Center">
        <AlignCenter className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={cn("rounded p-1 hover:bg-muted", { "bg-muted": editor.isActive({ textAlign: "right" }) })}
        title="Align Right">
        <AlignRight className="h-4 w-4" />
      </button>
      <div className="mx-1 h-6 w-px self-center bg-border" />
      <button
        type="button"
        onClick={addLink}
        className={cn("rounded p-1 hover:bg-muted", { "bg-muted": editor.isActive("link") })}
        title="Add Link">
        <LinkIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={removeLink}
        className={cn("rounded p-1 hover:bg-muted")}
        title="Remove Link"
        disabled={!editor.isActive("link")}>
        <Unlink className="h-4 w-4" />
      </button>
      {onExpand && (
        <>
          <div className="mx-1 h-6 w-px self-center bg-border" />
          <button
            type="button"
            onClick={onExpand}
            className="rounded p-1 hover:bg-muted"
            title="Open in full screen mode">
            <Maximize2 className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
};

const RTEModal = ({
  isOpen,
  onClose,
  id,
  value,
  onChange,
  onBlur,
}: {
  isOpen: boolean;
  onClose: () => void;
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: (id: string, value: string) => void;
}) => {
  const rteRef = useRef(null);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    onBlur: ({ editor }) => {
      const html = editor.getHTML();
      onBlur(id, html);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm focus:outline-none min-h-[300px] p-2 dark:prose-invert prose-p:m-0 prose-blockquote:m-2 prose-blockquote:ml-4 prose-ul:m-0 prose-ol:m-0 prose-li:m-0",
      },
    },
  });

  useEffect(() => {
    if (isOpen && editor) {
      // Reset content when modal opens
      editor.commands.setContent(value || "");

      // Focus the editor after a short delay to ensure it's rendered
      setTimeout(() => {
        editor.commands.focus();
      }, 100);
    }
  }, [isOpen, value, editor]);

  useEffect(() => {
    if (rteRef.current) {
      rteRef.current.__chaiRTE = editor;
    }
  }, [editor]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Rich Text Editor</DialogTitle>
        </DialogHeader>
        <div id={`chai-rte-modal-${id}`} ref={rteRef} className="rounded-md border border-input">
          <MenuBar editor={editor} />
          <EditorContent editor={editor} id={`modal-${id}`} className="p-2" />
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const RichTextEditorField = ({ id, placeholder, value, onChange, onBlur }: WidgetProps) => {
  const rteRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    onBlur: ({ editor }) => {
      const html = editor.getHTML();
      onBlur(id, html);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm focus:outline-none min-h-[100px] p-1 dark:prose-invert prose-p:m-0 prose-blockquote:m-2 prose-blockquote:ml-4 prose-ul:m-0 prose-ol:m-0 prose-li:m-0",
      },
    },
  });

  useEffect(() => {
    rteRef.current.__chaiRTE = editor;
  }, [editor]);

  const handleModalChange = (newValue: string) => {
    onChange(newValue);
    if (editor) {
      editor.commands.setContent(newValue);
    }
  };

  return (
    <>
      <div className="relative">
        <div id={`chai-rte-${id}`} ref={rteRef} className="mt-1 rounded-md border border-input">
          <MenuBar editor={editor} onExpand={() => setIsModalOpen(true)} />
          <EditorContent editor={editor} id={id} placeholder={placeholder} />
        </div>
      </div>

      {isModalOpen && (
        <RTEModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          id={id}
          value={value || ""}
          onChange={handleModalChange}
          onBlur={onBlur}
        />
      )}
    </>
  );
};

export { RichTextEditorField as RTEField };
