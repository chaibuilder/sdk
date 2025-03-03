import { WidgetProps } from "@rjsf/utils";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
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
  Underline as UnderlineIcon,
  Unlink,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../../ui/shadcn/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/shadcn/components/ui/dialog";
import { usePageExternalData } from "../atoms/builder";
import { NestedPathSelector } from "../components/NestedPathSelector";
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
        <UnderlineIcon className="h-4 w-4" />
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
  const initialContentRef = useRef(value || "");
  const pageExternalData = usePageExternalData();

  // Add a style element to fix the z-index issue
  useEffect(() => {
    if (isOpen) {
      // Create a style element
      const styleEl = document.createElement("style");
      styleEl.id = "rte-modal-styles";
      styleEl.innerHTML = `
        /* Ensure the NestedPathSelector popover appears above the dialog */
        .rte-path-selector + [data-radix-popper-content-wrapper],
        [data-radix-popper-content-wrapper] {
          z-index: 9999 !important;
        }
      `;
      document.head.appendChild(styleEl);

      // Clean up on unmount
      return () => {
        const existingStyle = document.getElementById("rte-modal-styles");
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, [isOpen]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"],
        defaultAlignment: "left",
      }),
      Underline,
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
      // Only set content when the modal first opens
      if (initialContentRef.current !== value) {
        initialContentRef.current = value || "";
        editor.commands.setContent(value || "");
      }

      // Focus the editor after a short delay to ensure it's rendered
      setTimeout(() => {
        editor.commands.focus();
      }, 100);
    }
  }, [isOpen, editor]);

  // Ensure the editor instance is attached to the DOM element for data binding
  useEffect(() => {
    if (rteRef.current && editor) {
      // This is critical for data binding to work - JSONForm.tsx looks for this property
      // to access the editor instance and insert data binding placeholders
      rteRef.current.__chaiRTE = editor;
    }
  }, [editor, isOpen]);

  const handlePathSelect = (path: string) => {
    if (!editor) return;

    // Create the placeholder
    const placeholder = `{{${path}}}`;

    // Focus the editor first
    editor.commands.focus();

    // Check if there's a selection
    const { from, to } = editor.state.selection;
    const hasSelection = from !== to;

    if (hasSelection) {
      // If there's a selection, replace it with the placeholder
      editor.chain().deleteSelection().insertContent(placeholder).run();
    } else {
      // No selection, just insert at cursor position
      // Get the text around the cursor to determine spacing
      const { state } = editor;
      const cursorPos = state.selection.from;

      // Get text before and after cursor for smart spacing
      const textBefore = state.doc.textBetween(Math.max(0, cursorPos - 1), cursorPos);
      const textAfter = state.doc.textBetween(cursorPos, Math.min(cursorPos + 1, state.doc.content.size));

      // Determine if we need spacing before the placeholder
      let prefix = "";
      if (cursorPos > 0 && textBefore !== " " && !/[.,!?;:]/.test(textBefore)) {
        prefix = " ";
      }

      // Determine if we need spacing after the placeholder
      let suffix = "";
      if (textAfter && textAfter !== " " && !/[.,!?;:]/.test(textAfter)) {
        suffix = " ";
      }

      // Insert the placeholder with smart spacing
      editor
        .chain()
        .insertContent(prefix + placeholder + suffix)
        .run();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-8">
            <span>Rich Text Editor</span>
            {pageExternalData && Object.keys(pageExternalData).length > 0 && (
              <div className="flex items-center">
                <span className="mr-2 text-sm text-muted-foreground">Add field:</span>
                <div className="rte-path-selector">
                  <NestedPathSelector data={pageExternalData} onSelect={handlePathSelect} />
                </div>
              </div>
            )}
          </DialogTitle>
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
  const [modalContent, setModalContent] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"],
        defaultAlignment: "left",
      }),
      Underline,
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);

      // Update modal content state when inline editor changes
      // but only if modal is closed to prevent feedback loops
      if (!isModalOpen) {
        setModalContent(html);
      }
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
    // This is critical for data binding to work - JSONForm.tsx looks for this property
    // to access the editor instance and insert data binding placeholders
    rteRef.current.__chaiRTE = editor;
  }, [editor]);

  // Update modal content when value changes from outside
  useEffect(() => {
    setModalContent(value || "");
  }, [value]);

  const handleModalChange = (newValue: string) => {
    // Just call onChange to update the form data
    onChange(newValue);

    // Update the inline editor only when the modal is closed
    // to prevent cursor jumping during editing
  };

  const handleModalClose = () => {
    setIsModalOpen(false);

    // Update the inline editor content when modal is closed
    if (editor) {
      editor.commands.setContent(modalContent);
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
          onClose={handleModalClose}
          id={id}
          value={modalContent}
          onChange={handleModalChange}
          onBlur={onBlur}
        />
      )}
    </>
  );
};

export { RichTextEditorField as RTEField };
