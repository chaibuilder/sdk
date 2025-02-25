// @ts-ignore
import { WidgetProps } from "@rjsf/utils";
import { useEffect, useRef } from "react";
import ReactQuill from "react-quill";

const RichTextEditorField = ({ id, placeholder, value, onChange, onBlur }: WidgetProps) => {
  const modules = {
    toolbar: [
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }, { align: [] }],
      ["link", "clean"],
    ],
  };

  const formats = [
    "header",
    "font",
    "list",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "color",
    "background",
    "align",
    "link",
    "image",
  ];
  const quillRef = useRef<ReactQuill>(null);
  const quillContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      // @ts-ignore
      quillContainerRef.current.__quill = editor;
    }
  }, []);

  if (typeof window === "undefined") return null;

  console.log(value);
  return (
    <div id={`quill.${id}`} ref={quillContainerRef}>
      <ReactQuill
        ref={quillRef}
        id={id}
        value={value}
        // @ts-ignore
        onBlur={(content: string) => onBlur(id, content)}
        onChange={(content: string) => onChange(content)}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="mt-1 rounded-md"
      />
    </div>
  );
};

export { RichTextEditorField as RTEField };
