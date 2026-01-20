import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TopbarRight from "./topbar-right";

// Mock hooks
vi.mock("@/pages/hooks/pages/use-current-page", () => ({
  useChaiCurrentPage: vi.fn(),
  useActivePage: vi.fn(),
}));

vi.mock("@/pages/hooks/pages/mutations", () => ({
  usePublishPages: vi.fn(),
}));

vi.mock("@/core/hooks/use-save-page", () => ({
  useSavePage: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  initReactI18next: { type: "3rdParty", init: () => {} },
}));

vi.mock("@/core/hooks/use-languages", () => ({
  useLanguages: vi.fn(),
}));

vi.mock("@/pages/hooks/pages/use-language-pages", () => ({
  useLanguagePages: vi.fn(),
}));

vi.mock("./page-lock/page-lock-hook", () => ({
  usePageLockStatus: vi.fn(),
}));

vi.mock("@/pages/hooks/pages/use-is-languagep-page-created", () => ({
  useIsLanguagePageCreated: vi.fn(),
}));

vi.mock("@/pages/hooks/utils/use-search-params", () => ({
  useSearchParams: () => [new URLSearchParams()],
}));

vi.mock("@/pages/hooks/project/use-builder-prop", () => ({
  usePagesProp: vi.fn(),
  useApiUrl: vi.fn(),
}));

vi.mock("@/pages/hooks/project/use-page-types", () => ({
  usePageTypes: () => ({ data: [] }),
}));

vi.mock("@/core/hooks/use-theme", () => ({
  useRightPanel: () => ["block", vi.fn()],
}));

// Mock components that are not under test but rendered
vi.mock("@/pages/client/components/page-revisions/page-revisions-trigger", () => ({
  default: () => <div>PageRevisions</div>,
}));
vi.mock("@/pages/client/components/permission-checker", () => ({
  default: ({ children }: { children: any }) => <div>{children}</div>,
}));
vi.mock("@/pages/client/components/publish-pages/publish-pages", () => ({
  default: () => <div>PublishPages</div>,
}));

import { useChaiCurrentPage, useActivePage } from "@/pages/hooks/pages/use-current-page";
import { usePublishPages } from "@/pages/hooks/pages/mutations";
import { useSavePage } from "@/core/hooks/use-save-page";
import { useLanguages } from "@/core/hooks/use-languages";
import { useLanguagePages } from "@/pages/hooks/pages/use-language-pages";
import { usePageLockStatus } from "./page-lock/page-lock-hook";
import { useIsLanguagePageCreated } from "@/pages/hooks/pages/use-is-languagep-page-created";

describe("TopbarRight", () => {
  const mockPublishPage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (usePublishPages as any).mockReturnValue({ mutate: mockPublishPage, isPending: false });
    (useSavePage as any).mockReturnValue({ savePageAsync: vi.fn(), saveState: "SAVED", needTranslations: () => false });
    (useLanguages as any).mockReturnValue({ selectedLang: "en", fallbackLang: "en" });
    (useLanguagePages as any).mockReturnValue({ data: [] });
    (usePageLockStatus as any).mockReturnValue({ isLocked: false });
    (useIsLanguagePageCreated as any).mockReturnValue(true);
    (useActivePage as any).mockReturnValue({ data: { id: "page-1" } });
  });

  it("renders Publish button correctly when published with no changes", () => {
    (useChaiCurrentPage as any).mockReturnValue({
      data: { id: "page-1", online: true, changes: {} }, // Published, no changes
    });

    render(<TopbarRight />);

    const button = screen.getByText("Published");
    expect(button).toBeTruthy();
    // Green class
    expect(button.closest("button")?.className).toContain("bg-green-500");
  });

  it("renders Publish button correctly when unpublished", () => {
    (useChaiCurrentPage as any).mockReturnValue({
      data: { id: "page-1", online: false, changes: {} }, // Unpublished
    });

    render(<TopbarRight />);

    const button = screen.getByText("Publish");
    expect(button).toBeTruthy();
    // Not green/blue
    expect(button.closest("button")?.className).not.toContain("bg-green-500");
    expect(button.closest("button")?.className).not.toContain("bg-blue-500");
  });

  it("renders Publish button with blue color when published AND has unpublished changes", () => {
    (useChaiCurrentPage as any).mockReturnValue({
      data: { id: "page-1", online: true, changes: { blocks: [] } }, // Published, WITH changes (not empty)
    });

    render(<TopbarRight />);

    const button = screen.getByText("Publish");
    expect(button).toBeTruthy();
    // Blue class
    expect(button.closest("button")?.className).toContain("bg-blue-500");
  });

  it("shows 'View Unpublished changes' menu item when published with changes", async () => {
    (useChaiCurrentPage as any).mockReturnValue({
      data: { id: "page-1", online: true, changes: { blocks: [] } },
    });

    render(<TopbarRight />);

    const dropdownButton = document.querySelector(".rounded-l-none");
    if (dropdownButton) {
        fireEvent.keyDown(dropdownButton, { key: "Enter" });
    }

    const item = await screen.findByText("View Unpublished changes");
    expect(item).toBeTruthy();
  });

  it("does NOT show 'View Unpublished changes' menu item when NO changes", async () => {
    (useChaiCurrentPage as any).mockReturnValue({
      data: { id: "page-1", online: true, changes: {} }, // Empty changes
    });

    render(<TopbarRight />);

    const dropdownButton = document.querySelector(".rounded-l-none");
    if (dropdownButton) {
        fireEvent.click(dropdownButton);
    }

    expect(screen.queryByText("View Unpublished changes")).toBeNull();
  });
});
