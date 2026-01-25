import { addPrefixToClasses, convertToBlocks, getMergedPartialBlocks } from "@/render/functions";
import { ChaiBlock } from "@/types/common";

// Test getMergedPartialBlocks function
describe("getMergedPartialBlocks", () => {
  describe("Basic functionality", () => {
    it("should merge simple top-level partial blocks", () => {
      const blocks: ChaiBlock[] = [
        { _type: "Container", _id: "container-1" },
        { _type: "PartialBlock", _id: "partial-ref-1", partialBlockId: "header" },
        { _type: "Container", _id: "container-2" },
      ];

      const partials: Record<string, ChaiBlock[]> = {
        header: [
          { _type: "Header", _id: "header-1", content: "Title" },
          { _type: "Nav", _id: "nav-1" },
        ],
      };

      const result = getMergedPartialBlocks(blocks, partials);

      expect(result).toHaveLength(4);
      expect(result[0]._type).toBe("Container");
      expect(result[1]._type).toBe("Header");
      expect(result[2]._type).toBe("Nav");
      expect(result[3]._type).toBe("Container");
    });

    it("should preserve parent references when merging partials", () => {
      const blocks: ChaiBlock[] = [
        { _type: "Container", _id: "container-1" },
        { _type: "PartialBlock", _id: "partial-ref-1", partialBlockId: "header", _parent: "container-1" },
      ];

      const partials: Record<string, ChaiBlock[]> = {
        header: [
          { _type: "Header", _id: "header-1", content: "Title" },
          { _type: "Nav", _id: "nav-1" },
        ],
      };

      const result = getMergedPartialBlocks(blocks, partials);

      expect(result[1]._parent).toBe("container-1");
      expect(result[2]._parent).toBe("container-1");
    });

    it("should handle GlobalBlock type as well", () => {
      const blocks: ChaiBlock[] = [
        { _type: "GlobalBlock", _id: "global-ref-1", globalBlock: "footer" },
      ];

      const partials: Record<string, ChaiBlock[]> = {
        footer: [{ _type: "Footer", _id: "footer-1" }],
      };

      const result = getMergedPartialBlocks(blocks, partials);

      expect(result).toHaveLength(1);
      expect(result[0]._type).toBe("Footer");
    });

    it("should handle missing partial blocks gracefully", () => {
      const blocks: ChaiBlock[] = [
        { _type: "Container", _id: "container-1" },
        { _type: "PartialBlock", _id: "partial-ref-1", partialBlockId: "nonexistent" },
      ];

      const partials: Record<string, ChaiBlock[]> = {};

      const result = getMergedPartialBlocks(blocks, partials);

      // The partial block should be replaced with empty array, effectively removing it
      expect(result).toHaveLength(1);
      expect(result[0]._type).toBe("Container");
    });
  });

  describe("Nested partials functionality", () => {
    it("should resolve nested partials (2 levels deep)", () => {
      const blocks: ChaiBlock[] = [
        { _type: "Container", _id: "container-1" },
        { _type: "PartialBlock", _id: "partial-ref-1", partialBlockId: "page-header" },
      ];

      const partials: Record<string, ChaiBlock[]> = {
        "page-header": [
          { _type: "Header", _id: "header-1" },
          { _type: "PartialBlock", _id: "nested-partial-1", partialBlockId: "logo" },
        ],
        logo: [{ _type: "Image", _id: "logo-1", src: "logo.png" }],
      };

      const result = getMergedPartialBlocks(blocks, partials);

      expect(result).toHaveLength(3);
      expect(result[0]._type).toBe("Container");
      expect(result[1]._type).toBe("Header");
      expect(result[2]._type).toBe("Image");
    });

    it("should resolve deep nested partials (3+ levels)", () => {
      const blocks: ChaiBlock[] = [
        { _type: "PartialBlock", _id: "partial-ref-1", partialBlockId: "level1" },
      ];

      const partials: Record<string, ChaiBlock[]> = {
        level1: [
          { _type: "Container", _id: "c1" },
          { _type: "PartialBlock", _id: "p1", partialBlockId: "level2" },
        ],
        level2: [
          { _type: "Section", _id: "s1" },
          { _type: "PartialBlock", _id: "p2", partialBlockId: "level3" },
        ],
        level3: [
          { _type: "Div", _id: "d1" },
          { _type: "PartialBlock", _id: "p3", partialBlockId: "level4" },
        ],
        level4: [{ _type: "Text", _id: "t1", content: "Deep text" }],
      };

      const result = getMergedPartialBlocks(blocks, partials);

      expect(result).toHaveLength(4);
      expect(result[0]._type).toBe("Container");
      expect(result[1]._type).toBe("Section");
      expect(result[2]._type).toBe("Div");
      expect(result[3]._type).toBe("Text");
    });

    it("should handle multiple nested partials at the same level", () => {
      const blocks: ChaiBlock[] = [
        { _type: "PartialBlock", _id: "partial-ref-1", partialBlockId: "multi-partial" },
      ];

      const partials: Record<string, ChaiBlock[]> = {
        "multi-partial": [
          { _type: "PartialBlock", _id: "p1", partialBlockId: "header" },
          { _type: "Container", _id: "content" },
          { _type: "PartialBlock", _id: "p2", partialBlockId: "footer" },
        ],
        header: [{ _type: "Header", _id: "h1" }],
        footer: [{ _type: "Footer", _id: "f1" }],
      };

      const result = getMergedPartialBlocks(blocks, partials);

      expect(result).toHaveLength(3);
      expect(result[0]._type).toBe("Header");
      expect(result[1]._type).toBe("Container");
      expect(result[2]._type).toBe("Footer");
    });
  });

  describe("Circular dependency detection", () => {
    it("should detect and prevent direct circular reference (A -> A)", () => {
      const blocks: ChaiBlock[] = [
        { _type: "PartialBlock", _id: "partial-ref-1", partialBlockId: "self-ref" },
      ];

      const partials: Record<string, ChaiBlock[]> = {
        "self-ref": [
          { _type: "Container", _id: "c1" },
          { _type: "PartialBlock", _id: "p1", partialBlockId: "self-ref" },
        ],
      };

      expect(() => getMergedPartialBlocks(blocks, partials)).toThrow(/circular.*dependency/i);
    });

    it("should detect and prevent indirect circular reference (A -> B -> A)", () => {
      const blocks: ChaiBlock[] = [
        { _type: "PartialBlock", _id: "partial-ref-1", partialBlockId: "partial-a" },
      ];

      const partials: Record<string, ChaiBlock[]> = {
        "partial-a": [
          { _type: "Container", _id: "c1" },
          { _type: "PartialBlock", _id: "p1", partialBlockId: "partial-b" },
        ],
        "partial-b": [
          { _type: "Section", _id: "s1" },
          { _type: "PartialBlock", _id: "p2", partialBlockId: "partial-a" },
        ],
      };

      expect(() => getMergedPartialBlocks(blocks, partials)).toThrow(/circular.*dependency/i);
    });

    it("should detect and prevent complex circular reference (A -> B -> C -> A)", () => {
      const blocks: ChaiBlock[] = [
        { _type: "PartialBlock", _id: "partial-ref-1", partialBlockId: "partial-a" },
      ];

      const partials: Record<string, ChaiBlock[]> = {
        "partial-a": [{ _type: "PartialBlock", _id: "p1", partialBlockId: "partial-b" }],
        "partial-b": [{ _type: "PartialBlock", _id: "p2", partialBlockId: "partial-c" }],
        "partial-c": [{ _type: "PartialBlock", _id: "p3", partialBlockId: "partial-a" }],
      };

      expect(() => getMergedPartialBlocks(blocks, partials)).toThrow(/circular.*dependency/i);
    });

    it("should provide clear error message with circular chain", () => {
      const blocks: ChaiBlock[] = [
        { _type: "PartialBlock", _id: "partial-ref-1", partialBlockId: "partial-a" },
      ];

      const partials: Record<string, ChaiBlock[]> = {
        "partial-a": [{ _type: "PartialBlock", _id: "p1", partialBlockId: "partial-b" }],
        "partial-b": [{ _type: "PartialBlock", _id: "p2", partialBlockId: "partial-a" }],
      };

      try {
        getMergedPartialBlocks(blocks, partials);
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toMatch(/partial-a/);
        expect(error.message).toMatch(/partial-b/);
      }
    });
  });

  describe("Edge cases", () => {
    it("should handle empty blocks array", () => {
      const blocks: ChaiBlock[] = [];
      const partials: Record<string, ChaiBlock[]> = {};

      const result = getMergedPartialBlocks(blocks, partials);

      expect(result).toEqual([]);
    });

    it("should handle blocks with no partials", () => {
      const blocks: ChaiBlock[] = [
        { _type: "Container", _id: "c1" },
        { _type: "Header", _id: "h1" },
      ];
      const partials: Record<string, ChaiBlock[]> = {};

      const result = getMergedPartialBlocks(blocks, partials);

      expect(result).toEqual(blocks);
    });

    it("should handle partial with empty partialBlockId", () => {
      const blocks: ChaiBlock[] = [
        { _type: "PartialBlock", _id: "partial-ref-1", partialBlockId: "" },
        { _type: "Container", _id: "c1" },
      ];

      const partials: Record<string, ChaiBlock[]> = {};

      const result = getMergedPartialBlocks(blocks, partials);

      // Empty partialBlockId should be skipped but block remains
      expect(result).toHaveLength(2);
      expect(result[0]._type).toBe("PartialBlock");
      expect(result[1]._type).toBe("Container");
    });
  });
});

// Test addPrefixToClasses function
describe("addPrefixToClasses", () => {
  it("should prefix classes without states or media queries", () => {
    const classes = "bg-red-500 text-white";
    const prefix = "test-";
    const expectedClasses = "test-bg-red-500 test-text-white";
    expect(addPrefixToClasses(classes, prefix)).toBe(expectedClasses);
  });

  it("should prefix classes with states or media queries", () => {
    const classes = "hover:bg-red-500 dark:text-white";
    const prefix = "test-";
    const expectedClasses = "hover:test-bg-red-500 dark:test-text-white";
    expect(addPrefixToClasses(classes, prefix)).toBe(expectedClasses);
  });
});

// Test convertToBlocks function
describe("convertToBlocks", () => {
  it("should return an empty array when given an empty string", () => {
    expect(convertToBlocks("")).toEqual([]);
  });

  it("should return an error block when given invalid JSON", () => {
    const invalidJson = "some invalid json";
    const expectedErrorBlock: ChaiBlock = {
      _type: "Paragraph",
      _id: "error",
      content: "Invalid JSON. Please check the JSON string.",
    };
    expect(convertToBlocks(invalidJson)).toEqual([expectedErrorBlock]);
  });

  it("should filter out blocks with _type starting with @chai/", () => {
    const jsonString = JSON.stringify([
      { _type: "@chai/type", _id: "1", content: "Block 1" },
      { _type: "Paragraph", _id: "2", content: "Block 2" },
    ]);
    const expectedBlocks: ChaiBlock[] = [{ _type: "Paragraph", _id: "2", content: "Block 2" }];
    expect(convertToBlocks(jsonString)).toEqual(expectedBlocks);
  });

  it("should return all blocks if none starts with @chai", () => {
    const jsonString = JSON.stringify([
      { _type: "Paragraph", _id: "1", content: "Block 1" },
      { _type: "Header", _id: "2", content: "Block 2" },
    ]);
    const expectedBlocks: ChaiBlock[] = [
      { _type: "Paragraph", _id: "1", content: "Block 1" },
      { _type: "Header", _id: "2", content: "Block 2" },
    ];
    expect(convertToBlocks(jsonString)).toEqual(expectedBlocks);
  });
});
