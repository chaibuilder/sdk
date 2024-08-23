import { addPrefixToClasses, convertToBlocks, getBrandingClasses } from "./functions.ts";
import { ThemeConfiguration } from "../core/types/index.ts";
import { ChaiBlock } from "../core/types/ChaiBlock.ts";

// Test getBrandingClasses function
describe("getBrandingClasses", () => {
  it("should return the correct classes when brandingOptions are provided", () => {
    const brandingOptions: ThemeConfiguration = {
      bodyTextLightColor: "#123456",
      bodyTextDarkColor: "#654321",
      bodyBgLightColor: "#abcdef",
      bodyBgDarkColor: "#fedcba",
    };
    const prefix = "test-";
    const expectedClasses =
      "test-font-body test-antialiased test-text-[#123456] test-bg-[#abcdef] dark:test-text-[#654321] dark:test-bg-[#fedcba]";
    expect(getBrandingClasses(brandingOptions, prefix)).toBe(expectedClasses);
  });

  it("should return the correct classes when brandingOptions are empty", () => {
    const brandingOptions: ThemeConfiguration = {};
    const expectedClasses = "font-body antialiased text-[#64748b] bg-[#FFFFFF] dark:text-[#94a3b8] dark:bg-[#0f172a]";
    expect(getBrandingClasses(brandingOptions)).toBe(expectedClasses);
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
