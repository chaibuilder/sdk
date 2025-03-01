import { useRegisteredChaiBlocks } from "@chaibuilder/runtime";
import { useThrottledCallback } from "@react-hookz/web";
import RjForm from "@rjsf/core";
import { FieldTemplateProps, RJSFSchema, UiSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { useAtom } from "jotai";
import { get, isEmpty, take } from "lodash-es";
import { ChevronDown, ChevronRight, List, Plus } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { Descendant, Editor, Node, Range, Element as SlateElement, Text, Transforms } from "slate";
import { Badge } from "../../../ui/index.ts";
import {
  chaiRjsfFieldsAtom,
  chaiRjsfTemplatesAtom,
  chaiRjsfWidgetsAtom,
  usePageExternalData,
} from "../../atoms/builder.ts";
import { LANGUAGES } from "../../constants/LANGUAGES.ts";
import { useLanguages } from "../../hooks/useLanguages.ts";
import { useSelectedBlock } from "../../hooks/useSelectedBlockIds.ts";
import { IconPickerField, ImagePickerField, LinkField, RTEField, RowColField, SliderField } from "../../rjsf-widgets";
import { BindingWidget } from "../../rjsf-widgets/binding.tsx";
import { CodeEditor } from "../../rjsf-widgets/Code.tsx";
import { NestedPathSelector } from "../NestedPathSelector";

// Helper function to convert a Slate node to HTML
const serializeNodeToHTML = (node: Node): string => {
  if (Text.isText(node)) {
    let text = node.text;

    // Escape HTML special characters
    text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    // Apply text formatting
    if (node.bold) {
      text = `<strong>${text}</strong>`;
    }
    if (node.italic) {
      text = `<em>${text}</em>`;
    }
    if (node.underline) {
      text = `<u>${text}</u>`;
    }
    if (node.strike) {
      text = `<s>${text}</s>`;
    }

    return text;
  }

  const children = node.children.map((n) => serializeNodeToHTML(n)).join("");

  // Check if node is a CustomElement
  if (!Editor.isEditor(node) && SlateElement.isElement(node)) {
    // Handle different element types
    switch (node.type) {
      case "block-quote":
        return `<blockquote>${children}</blockquote>`;
      case "bulleted-list":
        return `<ul>${children}</ul>`;
      case "numbered-list":
        return `<ol>${children}</ol>`;
      case "list-item":
        return `<li>${children}</li>`;
      case "paragraph":
        if (node.align) {
          return `<p style="text-align: ${node.align}">${children}</p>`;
        }
        return `<p>${children}</p>`;
      default:
        return children;
    }
  }

  return children;
};

// Convert Slate nodes to HTML string
const serialize = (nodes: Descendant[]): string => {
  return nodes.map((node) => serializeNodeToHTML(node)).join("");
};

type JSONFormType = {
  blockId?: string;
  formData: any;
  schema: RJSFSchema;
  uiSchema: UiSchema;
  onChange: ({ formData }: any, key?: string) => void;
};

const CustomFieldTemplate = ({
  id,
  classNames,
  label,
  children,
  errors,
  help,
  description,
  hidden,
  required,
  schema,
  formData,
  onChange,
}: FieldTemplateProps) => {
  const { selectedLang, fallbackLang, languages } = useLanguages();
  const lang = isEmpty(languages) ? "" : isEmpty(selectedLang) ? fallbackLang : selectedLang;
  const currentLanguage = get(LANGUAGES, lang, lang);
  const pageExternalData = usePageExternalData();

  const selectedBlock = useSelectedBlock();
  const registeredBlocks = useRegisteredChaiBlocks();
  const i18nProps = get(registeredBlocks, [selectedBlock?._type, "i18nProps"], []) || [];
  const [openedList, setOpenedList] = useState<null | string>(null);

  const handlePathSelect = useCallback(
    (path: string) => {
      // Helper function to check if character is punctuation
      const isPunctuation = (char: string) => /[.,!?;:]/.test(char);

      // Helper function to add smart spacing around a placeholder
      const addSmartSpacing = (text: string, position: number, placeholder: string) => {
        // Determine if we need spacing
        let prefix = "";
        let suffix = "";

        // Get characters before and after cursor
        const charBefore = position > 0 ? text[position - 1] : "";
        const charAfter = position < text.length ? text[position] : "";

        // Handle spacing before placeholder
        if (position > 0) {
          // Always add space after a period/full stop
          if (charBefore === ".") {
            prefix = " ";
          }
          // For other cases, add space if not punctuation and not already a space
          else if (!isPunctuation(charBefore) && charBefore !== " ") {
            prefix = " ";
          }
        }

        // Handle spacing after placeholder
        if (position < text.length && !isPunctuation(charAfter) && charAfter !== " ") {
          suffix = " ";
        }

        return {
          text: prefix + placeholder + suffix,
          prefixLength: prefix.length,
          suffixLength: suffix.length,
        };
      };

      // Get the element by ID
      const slateContainer = document.getElementById(`slate-${id}`);
      const element = document.getElementById(id);
      if (!element && !slateContainer) return;

      // Check if this is a Slate editor by looking for the slate container
      if (slateContainer) {
        // Find the Slate editor instance using the reference stored during initialization
        const slateEditor = (slateContainer as any).__RTEditor;
        if (!slateEditor) return;

        // Create the placeholder
        const basePlaceholder = `{{${path}}}`;

        // Focus the editor
        slateEditor.focus();

        // Use Slate's API to insert text at the current selection
        const { selection } = slateEditor;

        if (selection) {
          // Delete any selected text first
          if (Range.isExpanded(selection)) {
            Transforms.delete(slateEditor);
          }

          // Insert the placeholder text
          Transforms.insertText(slateEditor, basePlaceholder);

          // Move the selection after the inserted text
          Transforms.move(slateEditor, {
            distance: basePlaceholder.length,
            unit: "character",
          });

          // Get the updated HTML content and update the form using our local serialize function
          const serializedHTML = serialize(slateEditor.children);
          onChange(serializedHTML, {}, id);
        }
      } else {
        // Handle regular input field
        const input = element as HTMLInputElement;
        const cursorPos = input.selectionStart || 0;
        const currentValue = input.value || "";

        // Check if there's any text selection
        const selectionEnd = input.selectionEnd || cursorPos;
        const hasSelection = selectionEnd > cursorPos;

        // If text is selected, replace it with the shortcode
        if (hasSelection) {
          const basePlaceholder = `{{${path}}}`;
          const { text: placeholderWithSpacing } = addSmartSpacing(currentValue, cursorPos, basePlaceholder);

          const newValue = currentValue.slice(0, cursorPos) + placeholderWithSpacing + currentValue.slice(selectionEnd);

          // Call onChange with the new formData
          onChange(newValue, {}, id);
          return;
        }

        // No selection, just insert at cursor position with smart spacing
        const basePlaceholder = `{{${path}}}`;
        const { text: placeholderWithSpacing } = addSmartSpacing(currentValue, cursorPos, basePlaceholder);

        // Create the new value with smart spacing
        const newValue = currentValue.slice(0, cursorPos) + placeholderWithSpacing + currentValue.slice(cursorPos);

        // Call onChange with the new formData
        onChange(newValue, {}, id);
      }
    },
    [id, onChange, formData, selectedBlock?._id],
  );

  if (hidden) {
    return null;
  }

  const isCheckboxOrRadio = schema.type === "boolean";
  if (isCheckboxOrRadio) return <div className={classNames}>{children}</div>;

  const showLangSuffix = i18nProps?.includes(id.replace("root.", ""));

  if (schema.type === "array") {
    const isListOpen = openedList === id;

    return (
      <div className={`${classNames} relative`}>
        {schema.title && (
          <label
            htmlFor={id}
            onClick={() => setOpenedList(isListOpen ? null : id)}
            className="flex cursor-pointer items-center gap-x-1 py-1 leading-tight duration-200 hover:bg-slate-100">
            {isListOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            <List className="h-3 w-3" />
            <span className="leading-tight">{label}</span>&nbsp;
            <Badge className="m-0 bg-gray-200 px-2 leading-tight text-gray-500 hover:bg-gray-200 hover:text-gray-500">
              <span className="text-[9px] font-medium text-slate-600">{formData?.length}</span>
            </Badge>
          </label>
        )}
        {formData?.length === 0 ? (
          <div className="h-0 overflow-hidden">{children}</div>
        ) : (
          <div className={`${!isListOpen ? "h-0 overflow-hidden" : "pt-0.5"}`}>
            {description}
            {children}
            {errors}
            {help}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={classNames}>
      {schema.title && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className={schema.type === "object" ? "pb-2" : ""}>
            {label} {showLangSuffix && <small className="text-[9px] text-zinc-400"> {currentLanguage}</small>}
            {required && schema.type !== "object" ? " *" : null}
          </label>
          {schema.type === "string" && !schema.enum && !schema.oneOf && pageExternalData && (
            <NestedPathSelector data={pageExternalData} onSelect={handlePathSelect} dataType="value" />
          )}
        </div>
      )}
      {description}
      {children}
      {errors}
      {help}
    </div>
  );
};

const CustomAddButton = (props) => (
  <button {...props} className="duration absolute right-2 top-2 cursor-pointer text-blue-400 hover:text-blue-500">
    <div className="flex items-center gap-x-0.5 text-[11px] leading-tight">
      <Plus className="h-3 w-3" /> <span>Add</span>
    </div>
  </button>
);

export const JSONForm = memo(({ blockId, schema, uiSchema, formData, onChange }: JSONFormType) => {
  const { selectedLang } = useLanguages();
  const [widgets] = useAtom(chaiRjsfWidgetsAtom);
  const [fields] = useAtom(chaiRjsfFieldsAtom);
  const [templates] = useAtom(chaiRjsfTemplatesAtom);

  const throttledChange = useThrottledCallback(
    async ({ formData }: any, id?: string) => {
      onChange({ formData }, id);
    },
    [onChange, selectedLang],
    400, // save only every 5 seconds
  );

  return (
    <RjForm
      key={selectedLang}
      widgets={{
        binding: BindingWidget,
        richtext: RTEField,
        icon: IconPickerField,
        image: ImagePickerField,
        code: CodeEditor,
        colCount: RowColField,
        ...widgets,
      }}
      fields={{
        link: LinkField,
        slider: SliderField,
        ...fields,
      }}
      templates={{
        FieldTemplate: CustomFieldTemplate,
        ButtonTemplates: {
          AddButton: CustomAddButton,
        },
        ...templates,
      }}
      idSeparator="."
      autoComplete="off"
      omitExtraData={false}
      liveOmit={false}
      liveValidate={false}
      validator={validator}
      uiSchema={uiSchema}
      schema={schema}
      formData={formData}
      onChange={({ formData: fD }, id) => {
        console.log(fD, id);
        if (!id || blockId !== fD?._id) return;
        const prop = take(id.split("."), 2).join(".").replace("root.", "");
        throttledChange({ formData: fD }, prop);
      }}
    />
  );
});
