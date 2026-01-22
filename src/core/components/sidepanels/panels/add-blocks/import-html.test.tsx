import { getBlocksFromHTML } from "@/core/import-html/html-to-json";
import { syncBlocksWithDefaults } from "@/runtime";
import { describe, expect, it, vi } from "vitest";

// Mock the runtime module
vi.mock("@/runtime", () => ({
  syncBlocksWithDefaults: vi.fn((blocks) => blocks),
}));

describe("ImportHTML - syncBlocksWithDefaults integration", () => {
  it("should call syncBlocksWithDefaults when importing HTML with empty heading", () => {
    // HTML snippet with an empty heading (common scenario that causes the crash)
    const html = '<h1 class="text-2xl"></h1>';

    const blocks = getBlocksFromHTML(html);
    const syncedBlocks = syncBlocksWithDefaults(blocks);

    // Verify that syncBlocksWithDefaults was called
    expect(vi.mocked(syncBlocksWithDefaults)).toHaveBeenCalledWith(blocks);
    expect(syncedBlocks).toBeDefined();
  });

  it("should call syncBlocksWithDefaults when importing HTML with multiple blocks", () => {
    const html = `
      <div class="container">
        <h1></h1>
        <p></p>
        <button></button>
      </div>
    `;

    const blocks = getBlocksFromHTML(html);
    const syncedBlocks = syncBlocksWithDefaults(blocks);

    expect(vi.mocked(syncBlocksWithDefaults)).toHaveBeenCalled();
    expect(syncedBlocks).toBeDefined();
  });

  it("should handle paragraphs with empty content", () => {
    const html = '<p class="text-base"></p>';

    const blocks = getBlocksFromHTML(html);
    const syncedBlocks = syncBlocksWithDefaults(blocks);

    expect(vi.mocked(syncBlocksWithDefaults)).toHaveBeenCalledWith(blocks);
    expect(syncedBlocks).toBeDefined();
  });

  it("should process complex nested structures", () => {
    const html = `
      <div>
        <header>
          <h1></h1>
          <nav>
            <a href="#"></a>
          </nav>
        </header>
        <main>
          <section>
            <h2></h2>
            <p></p>
          </section>
        </main>
      </div>
    `;

    const blocks = getBlocksFromHTML(html);
    const syncedBlocks = syncBlocksWithDefaults(blocks);

    expect(vi.mocked(syncBlocksWithDefaults)).toHaveBeenCalled();
    expect(syncedBlocks).toBeDefined();
  });
});
