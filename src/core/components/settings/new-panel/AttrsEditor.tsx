"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button, Input, Label, Textarea } from "../../../../ui";
import { Edit2, X } from "lucide-react";

type Attribute = {
  key: string;
  value: string;
};

interface AttributeManagerProps {
  preloadedAttributes?: Attribute[];
  onAttributesChange?: (attributes: Attribute[]) => void;
}

export default React.memo(function Component({ preloadedAttributes = [], onAttributesChange }: AttributeManagerProps) {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [error, setError] = useState("");
  const keyInputRef = useRef<HTMLInputElement>(null);
  const valueTextareaRef = useRef<HTMLTextAreaElement>(null);

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
            <Label htmlFor="attrValue" className="text-[11px] font-normal text-slate-600">
              Value
            </Label>
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
          <Button
            type="submit"
            disabled={!newKey.length || !newValue.length}
            variant="default"
            size="sm"
            className="h-8 w-24 text-xs">
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
              <span className="text-wrap max-w-[200px] font-normal">{attr.value.toString()}</span>
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
