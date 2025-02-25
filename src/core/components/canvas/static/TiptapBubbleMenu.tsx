import { BubbleMenu, Editor, EditorContent } from "@tiptap/react";
import { Bold, Italic, Strikethrough } from "lucide-react";
import { cn } from "../../../utils/cn";

export const TiptapBubbleMenu = ({ editor }: { editor: Editor }) => {
  return (
    <>
      <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
        <div className="bubble-menu space-x-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(editor.isActive("bold") ? "bg-gray-100" : "", "h-3 w-3")}>
            <Bold />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(editor.isActive("italic") ? "bg-gray-100" : "", "h-3 w-3")}>
            <Italic />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={cn(editor.isActive("strike") ? "bg-gray-100" : "", "h-3 w-3")}>
            <Strikethrough />
          </button>
        </div>
      </BubbleMenu>
      <EditorContent editor={editor} />
    </>
  );
};
