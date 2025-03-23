import { useRegisteredChaiBlocks } from "@chaibuilder/runtime";
import { FieldTemplateProps } from "@rjsf/utils";
import { get, isEmpty } from "lodash-es";
import { ChevronDown, ChevronRight, List } from "lucide-react";
import { useCallback, useState } from "react";
import { Badge } from "../../../ui";
import { usePageExternalData } from "../../atoms/builder.ts";
import { LANGUAGES } from "../../constants/LANGUAGES.ts";
import { useLanguages, useSelectedBlock } from "../../hooks";
import { NestedPathSelector } from "../NestedPathSelector.tsx";

const JSONFormFieldTemplate = ({
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
      const element = document.getElementById(id);
      if (!element) return;

      // Check if this is a Tiptap editor by looking for the chai-rte container
      const rteContainer = document.getElementById(`chai-rte-${id}`) || document.getElementById(`chai-rte-modal-${id}`);

      if (rteContainer && (rteContainer.querySelector(".ProseMirror") || (rteContainer as any).__chaiRTE)) {
        // Handle Tiptap editor
        // Access the Tiptap instance that was attached in the RTEField component
        const editor = (rteContainer as any).__chaiRTE;

        if (editor) {
          // Create the placeholder
          const basePlaceholder = `{{${path}}}`;

          // Focus the editor first to ensure we can get/set selection
          editor.commands.focus();

          // Check if there's a selection
          const { from, to } = editor.state.selection;
          const hasSelection = from !== to;

          if (hasSelection) {
            // If there's a selection, replace it with the placeholder
            editor.chain().deleteSelection().insertContent(basePlaceholder).run();
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
            if (cursorPos > 0 && textBefore !== " " && !isPunctuation(textBefore)) {
              prefix = " ";
            }

            // Determine if we need spacing after the placeholder
            let suffix = "";
            if (textAfter && textAfter !== " " && !isPunctuation(textAfter)) {
              suffix = " ";
            }

            // Insert the placeholder with smart spacing
            editor
              .chain()
              .insertContent(prefix + basePlaceholder + suffix)
              .run();
          }

          // Update the form data with the new content
          // Use setTimeout to ensure the state has been updated
          setTimeout(() => onChange(editor.getHTML(), {}, id), 100);
          return;
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

export default JSONFormFieldTemplate;
