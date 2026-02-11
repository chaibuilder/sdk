import { beforeEach, describe, expect, it, vi } from "vitest";
import { UpdateWebsiteFieldsAction } from "./update-website-fields";

// Mock the database modules
vi.mock("@/actions/db", () => ({
  db: {
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
  },
  safeQuery: vi.fn((fn) => {
    fn();
    return { error: null };
  }),
  schema: {
    apps: {},
  },
}));

vi.mock("@/actions/lib", () => ({
  apiError: (code: string, error: Error) => error,
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
}));

describe("UpdateWebsiteFieldsAction", () => {
  let action: UpdateWebsiteFieldsAction;
  const mockContext = {
    appId: "test-app-id",
    userId: "test-user-id",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    action = new UpdateWebsiteFieldsAction();
    // Set context directly on the action instance
    (action as any).context = mockContext;
    // Mock verifyAccess to do nothing
    vi.spyOn(action as any, "verifyAccess").mockResolvedValue(undefined);
  });

  describe("changes tracking", () => {
    it("should set changes to ['THEME'] when only theme is updated", async () => {
      const { db, safeQuery } = await import("@/actions/db");
      const mockSet = vi.fn(() => ({ where: vi.fn() }));
      const mockUpdate = vi.fn(() => ({ set: mockSet }));
      (db.update as any) = mockUpdate;

      await action.execute({
        settings: {
          theme: { primaryColor: "blue" },
        },
      });

      expect(mockSet).toHaveBeenCalledWith({
        theme: { primaryColor: "blue" },
        changes: ["THEME"],
      });
    });

    it("should set changes to ['DESIGN_TOKEN'] when only designTokens is updated", async () => {
      const { db } = await import("@/actions/db");
      const mockSet = vi.fn(() => ({ where: vi.fn() }));
      const mockUpdate = vi.fn(() => ({ set: mockSet }));
      (db.update as any) = mockUpdate;

      await action.execute({
        settings: {
          designTokens: { spacing: "16px" },
        },
      });

      expect(mockSet).toHaveBeenCalledWith({
        designTokens: { spacing: "16px" },
        changes: ["DESIGN_TOKEN"],
      });
    });



    it("should ignore non-whitelisted fields", async () => {
      const { db } = await import("@/actions/db");
      const mockSet = vi.fn(() => ({ where: vi.fn() }));
      const mockUpdate = vi.fn(() => ({ set: mockSet }));
      (db.update as any) = mockUpdate;

      await action.execute({
        settings: {
          theme: { primaryColor: "blue" },
          nonWhitelistedField: "should be ignored",
        },
      });

      expect(mockSet).toHaveBeenCalledWith({
        theme: { primaryColor: "blue" },
        changes: ["THEME"],
      });
    });

    it("should set empty changes array when no valid fields are provided", async () => {
      const { db } = await import("@/actions/db");
      const mockSet = vi.fn(() => ({ where: vi.fn() }));
      const mockUpdate = vi.fn(() => ({ set: mockSet }));
      (db.update as any) = mockUpdate;

      await action.execute({
        settings: {
          nonWhitelistedField: "should be ignored",
        },
      });

      expect(mockSet).toHaveBeenCalledWith({
        changes: [],
      });
    });
  });

  describe("edge cases", () => {
    it("should handle null theme value", async () => {
      const { db } = await import("@/actions/db");
      const mockSet = vi.fn(() => ({ where: vi.fn() }));
      const mockUpdate = vi.fn(() => ({ set: mockSet }));
      (db.update as any) = mockUpdate;

      await action.execute({
        settings: {
          theme: null,
        },
      });

      expect(mockSet).toHaveBeenCalledWith({
        theme: null,
        changes: ["THEME"],
      });
    });

    it("should handle empty object as theme value", async () => {
      const { db } = await import("@/actions/db");
      const mockSet = vi.fn(() => ({ where: vi.fn() }));
      const mockUpdate = vi.fn(() => ({ set: mockSet }));
      (db.update as any) = mockUpdate;

      await action.execute({
        settings: {
          theme: {},
        },
      });

      expect(mockSet).toHaveBeenCalledWith({
        theme: {},
        changes: ["THEME"],
      });
    });

    it("should handle complex nested theme object", async () => {
      const { db } = await import("@/actions/db");
      const mockSet = vi.fn(() => ({ where: vi.fn() }));
      const mockUpdate = vi.fn(() => ({ set: mockSet }));
      (db.update as any) = mockUpdate;

      const complexTheme = {
        colors: {
          primary: "blue",
          secondary: "green",
        },
        typography: {
          fontFamily: "Arial",
          fontSize: "16px",
        },
      };

      await action.execute({
        settings: {
          theme: complexTheme,
        },
      });

      expect(mockSet).toHaveBeenCalledWith({
        theme: complexTheme,
        changes: ["THEME"],
      });
    });
  });

  describe("response handling", () => {
    it("should return success: true on successful update", async () => {
      const result = await action.execute({
        settings: {
          theme: { primaryColor: "blue" },
        },
      });

      expect(result).toEqual({ success: true });
    });

    it("should throw error when database update fails", async () => {
      const { safeQuery } = await import("@/actions/db");
      (safeQuery as any).mockReturnValueOnce({
        error: new Error("Database error"),
      });

      await expect(
        action.execute({
          settings: {
            theme: { primaryColor: "blue" },
          },
        }),
      ).rejects.toThrow("Database error");
    });

    it("should throw error when context is not set", async () => {
      (action as any).context = null;

      await expect(
        action.execute({
          settings: {
            theme: { primaryColor: "blue" },
          },
        }),
      ).rejects.toThrow();
    });
  });
});
