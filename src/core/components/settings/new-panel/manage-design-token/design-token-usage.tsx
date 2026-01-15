import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useBlocksStore } from "@/core/history/use-blocks-store-undoable-actions";
import { useLanguages } from "@/core/hooks";
import { useBuilderProp } from "@/core/hooks/use-builder-prop";
import { useSavePage } from "@/core/hooks/use-save-page";
import { useSelectedBlockIds } from "@/core/hooks/use-selected-blockIds";
import { ChaiBlock } from "@/types/chai-block";
import { ArrowRightIcon, FileIcon, GlobeIcon } from "@radix-ui/react-icons";
import { noop } from "lodash-es";
import { ReactNode, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TokenUsageSection, TokenUsageSectionItem } from "../token-usage-section";

const STYLES_PREFIX = "#styles:";

export interface DesignTokenUsageProps {
  tokenId: string;
  tokenName: string;
  children: ReactNode;
}

interface BlockUsageSummary {
  id: string;
  label: string;
}

const getBlockLabel = (block: ChaiBlock): string => {
  const nameCandidates = [
    typeof (block as any)._name === "string" ? (block as any)._name : undefined,
    typeof block._type === "string" ? block._type : undefined,
  ].filter(Boolean) as string[];

  const label = nameCandidates.find((candidate) => candidate.trim().length > 0);
  if (!label) {
    return block._id;
  }

  return label.length > 40 ? `${label.slice(0, 37)}...` : label;
};

const collectTokenUsageOnPage = (blocks: ChaiBlock[], tokenId: string): BlockUsageSummary[] => {
  const tokenMarker = `${tokenId}`;

  return blocks
    .filter((block) => {
      return Object.values(block).some((value) => {
        if (typeof value !== "string") return false;
        if (!value.startsWith(STYLES_PREFIX)) return false;
        return value.includes(tokenMarker);
      });
    })
    .map((block) => ({
      id: block._id,
      label: getBlockLabel(block),
    }));
};

const DesignTokenUsage = ({ tokenId, tokenName, children }: DesignTokenUsageProps) => {
  const { t } = useTranslation();
  const [blocks] = useBlocksStore();
  const [selectedBlockIds, setSelectedBlockIds] = useSelectedBlockIds();
  const currentPageId = useBuilderProp("pageId");
  const siteWideUsage = useBuilderProp("siteWideUsage");

  const blocksOnThisPage = useMemo(() => collectTokenUsageOnPage(blocks, tokenId), [blocks, tokenId]);
  const currentPageItems: TokenUsageSectionItem[] = useMemo(
    () =>
      blocksOnThisPage.map((usage) => ({
        id: usage.id,
        label: usage.label,
        isSelected: selectedBlockIds.includes(usage.id),
      })),
    [blocksOnThisPage, selectedBlockIds],
  );

  const pagesUsingToken = useMemo(() => {
    if (!siteWideUsage) return [];
    return Object.entries(siteWideUsage).reduce<Array<{ id: string; name: string; isPartial: boolean }>>(
      (acc, [pageId, pageUsage]) => {
        if (pageId === currentPageId || !pageUsage?.designTokens) return acc;

        const hasToken = Object.keys(pageUsage.designTokens).some((tokenKey) => {
          if (typeof tokenKey !== "string") return false;
          return tokenKey === tokenId;
        });

        if (!hasToken) return acc;

        acc.push({ id: pageId, name: pageUsage.name || pageId, isPartial: Boolean(pageUsage.isPartial) });
        return acc;
      },
      [],
    );
  }, [siteWideUsage, tokenName, tokenId, currentPageId]);

  const otherPagesItems: TokenUsageSectionItem[] = useMemo(
    () =>
      pagesUsingToken
        .filter((page) => !page.isPartial)
        .map((page) => ({
          id: page.id,
          label: page.name,
        })),
    [pagesUsingToken],
  );

  const partialPagesItems: TokenUsageSectionItem[] = useMemo(
    () =>
      pagesUsingToken
        .filter((page) => page.isPartial)
        .map((page) => ({
          id: page.id,
          label: page.name,
        })),
    [pagesUsingToken],
  );

  const handleSelectBlock = useCallback(
    (blockId: string) => {
      setSelectedBlockIds([blockId]);
    },
    [setSelectedBlockIds],
  );
  const gotoPage = useBuilderProp("gotoPage", noop);
  const { selectedLang, fallbackLang } = useLanguages();
  const { savePageAsync } = useSavePage();
  const handleSelectPage = async (pageId: string) => {
    if (!pageId) return;
    await savePageAsync(true);
    gotoPage({ pageId, lang: selectedLang || fallbackLang });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="w-80 p-0">
        <div className="space-y-1 px-4 py-3">
          <p className="text-xs font-semibold">{tokenName}</p>
          <p className="text-[11px] text-muted-foreground">
            {t("Usage summary for this design token across your site.")}
          </p>
        </div>
        <div className="no-scrollbar max-h-64 space-y-4 overflow-y-auto px-4 pb-4">
          <TokenUsageSection
            title={t("Blocks affected on this page")}
            items={currentPageItems}
            emptyLabel={t("None")}
            onSelect={handleSelectBlock}
            icon={<ArrowRightIcon fontSize={4} />}
          />
          <TokenUsageSection
            title={t("Blocks affected on other pages")}
            items={otherPagesItems}
            emptyLabel={t("None")}
            onSelect={handleSelectPage}
            icon={<FileIcon fontSize={8} />}
          />
          <TokenUsageSection
            title={t("Blocks affected on partial blocks")}
            items={partialPagesItems}
            emptyLabel={t("None")}
            onSelect={handleSelectPage}
            icon={<GlobeIcon fontSize={8} />}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DesignTokenUsage;
