import { COLLECTION_PREFIX } from "@/core/constants/STRINGS";
import { ChaiBlock } from "@/types/chai-block";
import { cloneDeep, forEach, get, isArray, isString, keys, startsWith } from "lodash-es";

const applyBindingToValue = (
  value: any,
  pageExternalData: Record<string, any>,
  { index, key: repeaterKey }: { index: number; key: string },
) => {
  if (isString(value)) {
    let result = value;
    if (value === "repeaterItems") {
      return { value, repeaterItemsBinding: value };
    }

    const bindingRegex = /\{\{(.*?)\}\}/g;
    const matches = value.match(bindingRegex);
    if (matches) {
      matches.forEach((match) => {
        let binding = match.slice(2, -2).trim();
        let repeaterKeyTrimed = repeaterKey.slice(2, -2).trim();
        if (index !== -1 && startsWith(binding, "$index.")) {
          binding = `${repeaterKeyTrimed}.${index}.${binding.slice(7)}`;
        } else if (index !== -1 && startsWith(binding, "$index")) {
          binding = `${repeaterKeyTrimed}.${index}`;
        }
        const bindingValue = get(pageExternalData, binding, match);
        result = isArray(bindingValue) ? bindingValue : result.replace(match, bindingValue);
      });
    }
    return result;
  }

  if (isArray(value)) {
    return value.map((item) => applyBindingToValue(item, pageExternalData, { index, key: repeaterKey }));
  }

  if (value && typeof value === "object") {
    const result: Record<string, any> = {};
    forEach(keys(value), (key) => {
      if (!startsWith(key, "_")) {
        result[key] = applyBindingToValue(value[key], pageExternalData, { index, key: repeaterKey });
      } else {
        result[key] = value[key];
      }
    });
    return result;
  }

  return value;
};

export const applyBindingToBlockProps = (
  blockChai: ChaiBlock,
  pageExternalData: Record<string, any>,
  { index, key: repeaterKey }: { index: number; key: string },
) => {
  const clonedBlock = cloneDeep(blockChai);
  const result = applyBindingToValue(clonedBlock, pageExternalData, { index, key: repeaterKey });
  // Handle special case for repeaterItemsBinding
  if (clonedBlock.repeaterItems) {
    result.repeaterItemsBinding = startsWith(clonedBlock.repeaterItems, `{{${COLLECTION_PREFIX}`)
      ? clonedBlock.repeaterItems.replace(`}}`, `.${clonedBlock._id}}}`)
      : clonedBlock.repeaterItems;
  }

  return result;
};

if (import.meta.vitest) {
  describe("applyBindingToValue", () => {
    it("should handle string values with bindings", () => {
      const value = "Hello {{user.name}}";
      const pageExternalData = { user: { name: "John" } };
      const result = applyBindingToValue(value, pageExternalData, { index: -1, key: "" });
      expect(result).toBe("Hello John");
    });

    it("should handle nested object properties", () => {
      const value = {
        name: "John",
        address: {
          city: "{{user.city}}",
          street: "123 Main St",
        },
      };
      const pageExternalData = { user: { city: "New York" } };
      const result = applyBindingToValue(value, pageExternalData, { index: -1, key: "" });
      expect(result).toEqual({
        name: "John",
        address: {
          city: "New York",
          street: "123 Main St",
        },
      });
    });

    it("should handle arrays of values", () => {
      const value = ["Hello {{user.name}}", "Welcome {{user.role}}"];
      const pageExternalData = { user: { name: "John", role: "Admin" } };
      const result = applyBindingToValue(value, pageExternalData, { index: -1, key: "" });
      expect(result).toEqual(["Hello John", "Welcome Admin"]);
    });

    it("should handle repeaterItems special case", () => {
      const value = "repeaterItems";
      const result = applyBindingToValue(value, {}, { index: -1, key: "" });
      expect(result).toEqual({ value: "repeaterItems", repeaterItemsBinding: "repeaterItems" });
    });

    it("should handle $index binding in repeater context", () => {
      const value = "Item {{$index}}";
      const pageExternalData = { items: ["a", "b", "c"] };
      const result = applyBindingToValue(value, pageExternalData, { index: 1, key: "{{items}}" });
      expect(result).toBe("Item b");
    });

    it("should handle $index binding with dot notation", () => {
      const value = "Item {{$index.value}}";
      const pageExternalData = { items: [{ value: "apple" }, { value: "banana" }, { value: "cherry" }] };
      const result = applyBindingToValue(value, pageExternalData, { index: 1, key: "{{items}}" });
      expect(result).toBe("Item banana");
    });

    it("should preserve private properties starting with _", () => {
      const value = {
        name: "John",
        _private: "secret",
      };
      const result = applyBindingToValue(value, {}, { index: -1, key: "" });
      expect(result).toEqual({
        name: "John",
        _private: "secret",
      });
    });
  });

  describe("applyBindingToBlockProps", () => {
    it("should handle basic block with bindings", () => {
      const block: ChaiBlock = {
        _id: "test-block",
        _type: "text",
        type: "text",
        content: "Hello {{user.name}}",
        style: {
          color: "{{theme.color}}",
        },
      };
      const pageExternalData = { user: { name: "John" }, theme: { color: "blue" } };
      const result = applyBindingToBlockProps(block, pageExternalData, { index: -1, key: "" });
      expect(result).toEqual({
        _id: "test-block",
        _type: "text",
        type: "text",
        content: "Hello John",
        style: {
          color: "blue",
        },
      });
    });

    it("should handle repeaterItems and repeaterItemsBinding", () => {
      const block: ChaiBlock = {
        _id: "test-block",
        _type: "repeater",
        type: "repeater",
        repeaterItems: "{{items}}",
        items: ["a", "b", "c"],
      };
      const pageExternalData = { items: ["x", "y", "z"] };
      const result = applyBindingToBlockProps(block, pageExternalData, { index: -1, key: "" });
      expect(result).toEqual({
        _id: "test-block",
        _type: "repeater",
        type: "repeater",
        repeaterItems: ["x", "y", "z"],
        repeaterItemsBinding: "{{items}}",
        items: ["a", "b", "c"],
      });
    });

    it("should handle nested blocks with bindings", () => {
      const block: ChaiBlock = {
        _id: "test-block",
        _type: "container",
        type: "container",
        children: [
          {
            _id: "child-block",
            _type: "text",
            type: "text",
            content: "Item {{$index}}",
            style: {
              color: "{{theme.color}}",
            },
          },
        ],
      };
      const pageExternalData = { theme: { color: "red" }, items: ["x", "y", "z"] };
      const result = applyBindingToBlockProps(block, pageExternalData, { index: 2, key: "{{items}}" });
      expect(result).toEqual({
        _id: "test-block",
        _type: "container",
        type: "container",
        children: [
          {
            _id: "child-block",
            _type: "text",
            type: "text",
            content: "Item z",
            style: {
              color: "red",
            },
          },
        ],
      });
    });

    it("should handle arrays of blocks", () => {
      const block: ChaiBlock = {
        _id: "test-block",
        _type: "list",
        type: "list",
        items: [
          { _id: "item1", content: "Item {{$index}}" },
          { _id: "item2", content: "Item {{$index}}" },
        ],
      };
      const pageExternalData = { items: ["x", "y", "z"] };
      const result = applyBindingToBlockProps(block, pageExternalData, { index: 0, key: "{{items}}" });
      expect(result).toEqual({
        _id: "test-block",
        _type: "list",
        type: "list",
        items: [
          { _id: "item1", content: "Item x" },
          { _id: "item2", content: "Item x" },
        ],
      });
    });
  });
}
