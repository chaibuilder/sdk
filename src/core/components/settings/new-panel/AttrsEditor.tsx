"use client";

import { isEmpty } from "lodash-es";
import { Edit2, X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Input, Label, Textarea } from "../../../../ui";
import { usePageExternalData } from "../../../atoms/builder";
import { NestedPathSelector } from "../../NestedPathSelector";

type Attribute = {
  key: string;
  value: string;
};

interface AttributeManagerProps {
  preloadedAttributes?: Attribute[];
  onAttributesChange?: (attributes: Attribute[]) => void;
}

export default React.memo(function AttrsEditor({
  preloadedAttributes = [],
  onAttributesChange,
}: AttributeManagerProps) {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [error, setError] = useState("");
  const keyInputRef = useRef<HTMLInputElement>(null);
  const valueTextareaRef = useRef<HTMLTextAreaElement>(null);

  const pageExternalData = usePageExternalData();

  useEffect(() => {
    setAttributes(preloadedAttributes);
  }, [preloadedAttributes]);

  const addAttribute = () => {
    if (newKey.startsWith("@")) {
      setError("Attribute keys cannot start with '@'");
      return;
    }
    if (newKey) {
      const newAttributes = [...attributes, { key: newKey, value: newValue }];
      onAttributesChange(newAttributes);
      setAttributes(attributes);
      setNewKey("");
      setNewValue("");
      setError("");
    }
  };

  const removeAttribute = (index: number) => {
    const newAttributes = attributes.filter((_, i) => i !== index);
    onAttributesChange(newAttributes);
    setAttributes(newAttributes);
  };

  const startEdit = (index: number) => {
    setEditIndex(index);
    setNewKey(attributes[index].key);
    setNewValue(attributes[index].value);
  };

  const saveEdit = () => {
    if (newKey.startsWith("@")) {
      setError("Attribute keys cannot start with '@'");
      return;
    }
    if (editIndex !== null && newKey) {
      const newAttributes = [...attributes];
      newAttributes[editIndex] = { key: newKey, value: newValue };
      onAttributesChange(newAttributes);
      setAttributes(newAttributes);
      setEditIndex(null);
      setNewKey("");
      setNewValue("");
      setError("");
    }
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      editIndex !== null ? saveEdit() : addAttribute();
    }
  };

  const handlePathSelect = useCallback((path: string) => {
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

    // Handle regular textarea field
    const textarea = valueTextareaRef.current;
    if (textarea) {
      const cursorPos = textarea.selectionStart || 0;
      const currentValue = textarea.value || "";

      // Check if there's any text selection
      const selectionEnd = textarea.selectionEnd || cursorPos;
      const hasSelection = selectionEnd > cursorPos;

      // If text is selected, replace it with the shortcode
      if (hasSelection) {
        const basePlaceholder = `{{${path}}}`;
        const { text: placeholderWithSpacing } = addSmartSpacing(currentValue, cursorPos, basePlaceholder);

        const newValue = currentValue.slice(0, cursorPos) + placeholderWithSpacing + currentValue.slice(selectionEnd);

        // Update the value
        setNewValue(newValue);
        return;
      }

      // No selection, just insert at cursor position with smart spacing
      const basePlaceholder = `{{${path}}}`;
      const { text: placeholderWithSpacing } = addSmartSpacing(currentValue, cursorPos, basePlaceholder);

      // Create the new value with smart spacing
      const newValue = currentValue.slice(0, cursorPos) + placeholderWithSpacing + currentValue.slice(cursorPos);

      // Update the value
      setNewValue(newValue);
    }
  }, []);

  return (
    <div className="flex max-h-full flex-1 flex-col">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          editIndex !== null ? saveEdit() : addAttribute();
        }}
        className="space-y-3">
        <div className="flex flex-col gap-y-1">
          <div className="w-full">
            <Label htmlFor="attrKey" className="text-[11px] font-normal leading-tight text-slate-600">
              Key
            </Label>
            <Input
              autoCapitalize={"off"}
              autoCorrect={"off"}
              spellCheck={"false"}
              id="attrKey"
              ref={keyInputRef}
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="Enter Key"
              className="py-0 text-xs font-normal leading-tight placeholder:text-slate-400"
            />
          </div>
          <div className="w-full">
            <div className="flex items-center justify-between">
              <Label htmlFor="attrValue" className="text-[11px] font-normal text-slate-600">
                Value
              </Label>
              {!isEmpty(pageExternalData) && <NestedPathSelector data={pageExternalData} onSelect={handlePathSelect} />}
            </div>
            <Textarea
              autoCapitalize={"off"}
              autoCorrect={"off"}
              spellCheck={"false"}
              id="attrValue"
              rows={2}
              ref={valueTextareaRef}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter Value"
              className="text-xs font-normal leading-tight placeholder:text-slate-400"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={!newKey.length} variant="default" size="sm" className="h-8 w-24 text-xs">
            {editIndex !== null ? "Save" : "Add"}
          </Button>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </form>

      <div className="space-y-1 py-4">
        {attributes.map((attr, index) => (
          <div key={index} className="flex items-center justify-between rounded border p-2 text-sm">
            <div className="flex flex-col text-xs leading-tight">
              <span className="truncate text-[12px] font-light text-muted-foreground">{attr.key}</span>
              <span className="max-w-[200px] text-wrap font-normal">{attr.value.toString()}</span>
            </div>
            <div className="flex-shrink-0 text-slate-400">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEdit(index)}>
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeAttribute(index)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
