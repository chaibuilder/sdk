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
  Strikethrough,
  Underline,
  Unlink,
} from "lucide-react";
import { cn } from "../utils/cn";

const MenuBar = ({ editor }: { editor: any }) => {
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
    </div>
  );
};

const RichTextEditorField = ({ id, placeholder, value, onChange, onBlur }: WidgetProps) => {
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

  if (typeof window === "undefined") return null;

  console.log(value);
  return (
    <div className="mt-1 rounded-md border border-input">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} id={id} placeholder={placeholder} />
    </div>
  );
};

export { RichTextEditorField as RTEField };
