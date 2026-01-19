import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguages } from "@/core/hooks/use-languages";
import { useSavePage } from "@/core/hooks/use-save-page";
import { useRightPanel } from "@/core/hooks/use-theme";
import PageRevisions from "@/pages/client/components/page-revisions/page-revisions-trigger";
import PermissionChecker from "@/pages/client/components/permission-checker";
import PublishPages from "@/pages/client/components/publish-pages/publish-pages";
import { PAGES_PERMISSIONS } from "@/pages/constants/PERMISSIONS";
import { usePublishPages } from "@/pages/hooks/pages/mutations";
import { useActivePage, useChaiCurrentPage } from "@/pages/hooks/pages/use-current-page";
import { useIsLanguagePageCreated } from "@/pages/hooks/pages/use-is-languagep-page-created";
import { useLanguagePages } from "@/pages/hooks/pages/use-language-pages";
import { usePagesProp } from "@/pages/hooks/project/use-builder-prop";
import { usePageTypes } from "@/pages/hooks/project/use-page-types";
import { useSearchParams } from "@/pages/hooks/utils/use-search-params";
import { throwConfetti } from "@/pages/utils/confetti";
import Tooltip from "@/pages/utils/tooltip";
import { compact, find, isEmpty, map, upperCase } from "lodash-es";
import { CheckCircle, ChevronDown, Loader, Palette, Pencil, Play, Rocket, Save, Send } from "lucide-react";
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePageLockStatus } from "./page-lock/page-lock-hook";

const UnpublishPage = lazy(() => import("@/pages/client/components/unpublish-page"));
const TranslationWarningModal = lazy(
  () => import("@/pages/client/components/save-ui-blocks/translation-warning-modal"),
);
const JsonDiffViewer = lazy(() => import("@/pages/client/components/json-diff-viewer"));

const PreviewButton = () => {
  const { t } = useTranslation();
  const { selectedLang, fallbackLang } = useLanguages();
  const getPreviewUrl = usePagesProp("getPreviewUrl", async (_slug: string) => _slug);

  const [previewUrl, setPreviewUrl] = useState("");
  const { data: currentPage } = useChaiCurrentPage();
  const { data: languagePages } = useLanguagePages();
  const { data: pageTypes } = usePageTypes();
  const slug = useMemo(
    () => languagePages?.find((page) => page?.lang === selectedLang)?.slug,
    [selectedLang, languagePages],
  );
  const hasSlug = useCallback((pageType: string) => find(pageTypes, { key: pageType })?.hasSlug, [pageTypes]);
  const pageLang = selectedLang === fallbackLang ? "" : selectedLang;

  useEffect(() => {
    (async () => {
      if (typeof getPreviewUrl === "function") {
        const isPartial = !hasSlug(currentPage?.pageType);
        const url: string = await getPreviewUrl(
          isPartial ? `${pageLang !== "" ? pageLang + "/" : ""}${currentPage?.id}` : slug || "",
        );
        setPreviewUrl(url);
      } else {
        setPreviewUrl("");
      }
    })();
  }, [getPreviewUrl, slug, currentPage?.pageType, hasSlug, currentPage?.id, pageLang]);

  return (
    <>
      <Tooltip content={t("Open preview in new tab")} delayDuration={0}>
        <a href={previewUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="sm" className="gap-2">
            <Play className="h-4 w-4" />
          </Button>
        </a>
      </Tooltip>
    </>
  );
};

const ThemeButton = () => {
  const { t } = useTranslation();
  const [rightPanel, setRightPanel] = useRightPanel();
  return (
    <>
      <Tooltip content={t("Theme")} delayDuration={0}>
        <Button
          variant={rightPanel === "theme" ? "outline" : "ghost"}
          size="icon"
          className="gap-2"
          onClick={() => setRightPanel(rightPanel === "theme" ? "block" : "theme")}>
          <Palette className="h-4 w-4" />
        </Button>
      </Tooltip>
      <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
    </>
  );
};

const SaveButton = () => {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const { isLocked } = usePageLockStatus();
  const { savePageAsync, saveState } = useSavePage();

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (saveState === "UNSAVED") {
        event.preventDefault();
        event.returnValue = false;
      }
    };

    if (saveState === "UNSAVED") {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [saveState]);

  const handleSave = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    await savePageAsync();
    setIsSaving(false);
  }, [savePageAsync, isSaving]);

  const { buttonIcon, buttonClass, tooltipContent }: any = useMemo(() => {
    switch (saveState) {
      case "UNSAVED":
        return {
          tooltipContent: t("Save draft"),
          buttonIcon: <Save className="h-4 w-4" />,
          buttonClass: "gap-x-1",
        };
      case "SAVING":
        return {
          tooltipContent: t("Saving"),
          buttonIcon: <Loader className="h-4 w-4 animate-spin text-sky-700" />,
          buttonClass: "gap-x-1",
        };
      case "SAVED":
        return {
          tooltipContent: t("Saved"),
          buttonIcon: <CheckCircle className="h-4 w-4" />,
          buttonClass: "text-green-500 gap-x-1",
        };
    }
  }, [saveState, t]);

  if (isLocked) return null;

  return (
    <Button size="sm" variant="ghost" onClick={handleSave} className={`${buttonClass} w-24 max-w-24`}>
      {buttonIcon} {tooltipContent}
    </Button>
  );
};

const PublishButton = () => {
  const { t } = useTranslation();
  const { selectedLang } = useLanguages();
  const { data: activePage } = useActivePage();
  const { data: languagePages } = useLanguagePages();
  const [showModal, setShowModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [unpublishPage, setUnpublishPage] = useState(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const { savePageAsync } = useSavePage();
  const [showTranslationWarning, setShowTranslationWarning] = useState(false);

  const { data: currentPage } = useChaiCurrentPage();
  const { mutate: publishPage, isPending } = usePublishPages();
  const { needTranslations } = useSavePage();
  const needTranslation = needTranslations();

  const { buttonText, buttonClassName, isPublished, hasUnpublishedChanges } = useMemo(() => {
    const isPublished = currentPage && currentPage?.online;
    const hasUnpublishedChanges = !isEmpty(currentPage?.changes);
    let buttonClassName = isPublished ? "hover:bg-green-600 bg-green-500" : "";
    let buttonText = isPublished ? t("Published") : t("Publish");

    if (isPublished && hasUnpublishedChanges) {
      buttonClassName = "hover:bg-blue-600 bg-blue-500";
      buttonText = t("Publish");
    }

    return {
      buttonClassName,
      isPublished,
      hasUnpublishedChanges,
      buttonText,
    };
  }, [currentPage, t]);

  const handlePublishCurrentage = async () => {
    if (needTranslation) {
      setShowTranslationWarning(true);
      return;
    }

    performPublishCurrentPage();
  };

  const performPublishCurrentPage = () => {
    const pages = [activePage?.id, activePage?.primaryPage];
    //TODO: Check if the partial blocks are not live and send them
    // * Publishing current page and consumed global blocks
    publishPage({ ids: compact(pages) }, { onSuccess: () => throwConfetti("TOP_RIGHT") });
  };

  const handleContinueAnyway = () => {
    setShowTranslationWarning(false);
    performPublishCurrentPage();
  };

  const handleCancelTranslation = async () => {
    setShowTranslationWarning(false);
    await savePageAsync();
  };

  const allPages = useMemo(() => {
    return map(languagePages ?? [], "id");
  }, [languagePages]);

  return (
    <>
      <div className="flex">
        <Button
          size="sm"
          onClick={handlePublishCurrentage}
          disabled={isPending || !currentPage?.id}
          className={`relative flex items-center gap-1 overflow-hidden rounded-r-none text-white transition-all duration-300 ease-in-out ${buttonClassName}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}>
          <span
            className={`flex items-center transition-transform duration-300 ease-in-out ${isHovered ? "-translate-y-10" : ""}`}>
            {isPublished ? (
              hasUnpublishedChanges ? (
                <Pencil className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )
            ) : (
              <Rocket className="h-4 w-4" />
            )}
          </span>
          <span
            className={`absolute inset-0 left-3 flex items-center transition-transform duration-300 ease-in-out ${isHovered ? "" : "translate-y-10"}`}>
            {isPublished ? <Rocket className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          </span>
          <span>{buttonText}</span>
          {selectedLang ? `(${upperCase(selectedLang)})` : ""}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              disabled={isPending || !currentPage?.id}
              className={`rounded-l-none border-l border-white/50 px-2 text-white ${buttonClassName}`}>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem
              disabled={isPending}
              className="cursor-pointer text-xs"
              onClick={() => publishPage({ ids: allPages }, { onSuccess: () => throwConfetti("TOP_RIGHT") })}>
              {t("Publish")} with translation pages
            </DropdownMenuItem>
            {!isPublished && (
              <DropdownMenuItem
                disabled={isPending}
                className="cursor-pointer text-xs"
                onClick={() =>
                  publishPage({ ids: [currentPage?.id] }, { onSuccess: () => throwConfetti("TOP_RIGHT") })
                }>
                {t("Publish")} page
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => setShowModal(true)} className="cursor-pointer text-xs">
              {t("Open")} publish menu
            </DropdownMenuItem>
            {isPublished && hasUnpublishedChanges && (
              <DropdownMenuItem onClick={() => setShowCompareModal(true)} className="cursor-pointer text-xs">
                {t("View Unpublished changes")}
              </DropdownMenuItem>
            )}
            {isPublished && (
              <DropdownMenuItem onClick={() => setUnpublishPage(activePage)} className="cursor-pointer text-xs">
                {t("Unpublish")} page {selectedLang ? `(${upperCase(selectedLang)})` : ""}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <PublishPages showModal={showModal} onClose={() => setShowModal(false)} />
      {unpublishPage && (
        <Suspense>
          <UnpublishPage page={unpublishPage} onClose={() => setUnpublishPage(null)} />
        </Suspense>
      )}
      {showCompareModal && (
        <Suspense>
          <JsonDiffViewer
            open={showCompareModal}
            onOpenChange={setShowCompareModal}
            compare={[
              { label: "live", uid: `live:${currentPage?.id}`, item: {} },
              { label: "draft", uid: `draft:${currentPage?.id}`, item: currentPage },
            ]}
          />
        </Suspense>
      )}

      {showTranslationWarning && (
        <Suspense>
          <TranslationWarningModal
            isOpen={showTranslationWarning}
            onClose={handleCancelTranslation}
            onContinue={handleContinueAnyway}
            isPending={isPending}
          />
        </Suspense>
      )}
    </>
  );
};

export default function TopbarRight() {
  const { isLocked } = usePageLockStatus();
  const [searchParams] = useSearchParams();
  const lang = searchParams.get("lang");
  const isLanguagePageCreated = useIsLanguagePageCreated(lang as string);
  if (isLocked || !isLanguagePageCreated) return <div />;
  return (
    <div className="flex items-center justify-end gap-1">
      <PageRevisions />
      <PermissionChecker permission={PAGES_PERMISSIONS.EDIT_THEME}>
        <ThemeButton />
      </PermissionChecker>
      <PreviewButton />
      <PermissionChecker permission={PAGES_PERMISSIONS.SAVE_PAGE}>
        <SaveButton />
      </PermissionChecker>
      <PermissionChecker permission={PAGES_PERMISSIONS.PUBLISH_PAGE}>
        <PublishButton />
      </PermissionChecker>
    </div>
  );
}
