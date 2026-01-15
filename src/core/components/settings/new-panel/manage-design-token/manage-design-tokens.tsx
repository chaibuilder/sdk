import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { chaiDesignTokensAtom } from "@/core/atoms/builder";
import { DESIGN_TOKEN_PREFIX } from "@/core/constants/STRINGS";
import { orderClassesByBreakpoint } from "@/core/functions/order-classes-by-breakpoint";
import { removeDuplicateClasses } from "@/core/functions/remove-duplicate-classes";
import {
  ArrowLeftIcon,
  EyeOpenIcon,
  MagnifyingGlassIcon,
  Pencil1Icon,
  PlusIcon,
  TokensIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { useAtom } from "jotai";
import { nanoid } from "nanoid";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import { useIncrementActionsCount } from "../../../use-auto-save";
import { ManualClasses } from "../manual-classes";
import { convertTokenNameInput, getTokenNameError, validateTokenName } from "./design-token-utils";

const DeleteDesignToken = lazy(() => import("./delete-design-token"));
const DesignTokenUsage = lazy(() => import("./design-token-usage"));

type ViewMode = "view" | "add" | "edit";

interface SingleDesignTokenProps {
  tokenId: string;
  token: { name: string; value: string };
  isDisabled: boolean;
  onEdit: (tokenId: string) => void;
  onDelete: (tokenId: string) => void;
}

const SingleDesignToken = ({ tokenId, token, isDisabled, onEdit, onDelete }: SingleDesignTokenProps) => {
  return (
    <div className="group relative flex items-center justify-between overflow-hidden rounded border p-2 transition-all duration-150 hover:bg-muted/90">
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="text-xs font-semibold">{token.name}</div>
        <div className="w-full max-w-52 truncate text-[10px] font-light">{token.value}</div>
      </div>
      <div className="absolute right-1 top-1 flex flex-shrink-0 items-center opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        <Suspense fallback={null}>
          <DesignTokenUsage tokenId={tokenId} tokenName={token.name}>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 rounded-full p-0 hover:bg-primary/10 hover:text-primary">
              <EyeOpenIcon className="h-3 w-3" />
            </Button>
          </DesignTokenUsage>
        </Suspense>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(tokenId)}
          disabled={isDisabled}
          className="h-6 w-6 rounded-full p-0 hover:bg-primary/10 hover:text-primary">
          <Pencil1Icon className="h-3 w-3" />
        </Button>
        <Suspense fallback={null}>
          <DeleteDesignToken tokenName={token.name} tokenValue={token.value} onDelete={() => onDelete(tokenId)}>
            <Button
              variant="ghost"
              size="sm"
              disabled={isDisabled}
              className="h-6 w-6 rounded-full p-0 hover:bg-destructive/10">
              <TrashIcon className="h-3 w-3 text-destructive" />
            </Button>
          </DeleteDesignToken>
        </Suspense>
      </div>
    </div>
  );
};

interface ManageDesignTokensProps {}

const ManageDesignTokens = ({}: ManageDesignTokensProps) => {
  const { t } = useTranslation();
  const [designTokens, setDesignTokens] = useAtom(chaiDesignTokensAtom);
  const incrementActionsCount = useIncrementActionsCount();

  // Unified view state
  const [viewMode, setViewMode] = useState<ViewMode>("view");
  const [editingTokenId, setEditingTokenId] = useState<string | null>(null);

  // Form state
  const [tokenName, setTokenName] = useState("");
  const [classes, setClasses] = useState("");
  const [tokenNameError, setTokenNameError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Debounce timer ref for real-time editing
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const filteredTokens = useMemo(() => {
    return Object.entries(designTokens).filter(
      ([, token]) =>
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.value.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [designTokens, searchQuery]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Real-time update for editing (debounced)
  const debouncedUpdateToken = useCallback(
    (name: string, value: string) => {
      if (!editingTokenId || viewMode !== "edit") return;

      // Validate before updating
      if (!name.trim() || !value.trim()) return;
      if (!validateTokenName(name)) return;

      // Check for duplicate names (excluding current token)
      const existingToken = Object.entries(designTokens).find(
        ([id, token]) => token.name === name.trim() && id !== editingTokenId,
      );
      if (existingToken) return;

      setIsSaving(true);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        const newTokens = {
          ...designTokens,
          [editingTokenId]: {
            name: name.trim(),
            value: value.trim(),
          },
        };
        setDesignTokens(newTokens);
        incrementActionsCount();
        setIsSaving(false);
      }, 250);
    },
    [editingTokenId, viewMode, designTokens, setDesignTokens, incrementActionsCount],
  );

  const handleAddToken = () => {
    if (!tokenName.trim() || !classes.trim()) {
      toast.error(t("Please fill in both token name and classes"));
      return;
    }

    if (!validateTokenName(tokenName)) {
      toast.error(t("Invalid design token name format"));
      return;
    }

    const existingTokenWithName = Object.values(designTokens).find((token) => token.name === tokenName.trim());
    if (existingTokenWithName) {
      toast.error(t("Token already exists"));
      return;
    }

    const tokenId = `${DESIGN_TOKEN_PREFIX}${nanoid(12)}`;
    const newTokens = {
      ...designTokens,
      [tokenId]: {
        name: tokenName.trim(),
        value: classes.trim(),
      },
    };
    setDesignTokens(newTokens);
    incrementActionsCount();
    toast.success(t("Token added successfully"));
    resetAndGoToView();
  };

  const handleDeleteToken = (tokenId: string) => {
    const newTokens = { ...designTokens };
    delete newTokens[tokenId];
    setDesignTokens(newTokens);
    incrementActionsCount();
    toast.success(t("Token deleted successfully"));
  };

  const startEdit = (tokenId: string) => {
    const token = designTokens[tokenId];
    if (!token) return;

    setEditingTokenId(tokenId);
    setTokenName(token.name);
    setClasses(token.value);
    setTokenNameError("");
    setViewMode("edit");
  };

  const startAdd = () => {
    setEditingTokenId(null);
    setTokenName("");
    setClasses("");
    setTokenNameError("");
    setViewMode("add");
  };

  const resetAndGoToView = () => {
    // Clear any pending debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setEditingTokenId(null);
    setTokenName("");
    setClasses("");
    setTokenNameError("");
    setIsSaving(false);
    setViewMode("view");
  };

  const handleTokenNameChange = (value: string) => {
    const convertedValue = convertTokenNameInput(value);
    setTokenName(convertedValue);
    const error = getTokenNameError(convertedValue, designTokens, t, viewMode === "edit", editingTokenId || undefined);
    setTokenNameError(error);

    // Real-time update for edit mode
    if (viewMode === "edit" && !error) {
      debouncedUpdateToken(convertedValue, classes);
    }
  };

  const handleClassesChange = (newClasses: string) => {
    setClasses(newClasses);

    // Real-time update for edit mode
    if (viewMode === "edit" && !tokenNameError && tokenName.trim()) {
      debouncedUpdateToken(tokenName, newClasses);
    }
  };

  const handleAddClass = (cls: string) => {
    const newCls = orderClassesByBreakpoint(removeDuplicateClasses(twMerge(classes, cls)));
    handleClassesChange(newCls);
  };

  const handleRemoveClass = (cls: string) => {
    const updatedClasses = classes
      .split(" ")
      .filter((c) => c !== cls)
      .join(" ");
    handleClassesChange(updatedClasses);
  };

  // Render Add/Edit Form
  const renderForm = () => {
    const isEditMode = viewMode === "edit";
    const title = isEditMode ? t("Edit Design Token") : t("Add Design Token");
    const description = isEditMode ? t("Update design token. Auto-saved.") : t("Create a reusable design token");

    return (
      <div className="flex h-full flex-col">
        {/* Header with back button */}
        <div className="mb-3 flex items-center gap-2 rounded-md border border-border/50 bg-muted p-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetAndGoToView}
            className="h-6 w-6 rounded-full p-0 hover:bg-muted">
            <ArrowLeftIcon className="h-3 w-3" />
          </Button>
          <div className="flex-1">
            <h3 className="text-xs font-semibold text-foreground">{title}</h3>
            <p className="text-[10px] text-muted-foreground">{description}</p>
          </div>
          {isEditMode && isSaving && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            </div>
          )}
        </div>

        {/* Form Content */}
        <div className="flex-1 space-y-3 overflow-y-auto">
          <div className="space-y-1.5">
            <Label htmlFor="token-name" className="text-xs font-medium">
              {t("Token Name")}
            </Label>
            <Input
              id="token-name"
              placeholder="Button-Primary"
              value={tokenName}
              onChange={(e) => handleTokenNameChange(e.target.value)}
              className="h-7 text-xs"
            />
            {tokenNameError ? (
              <span className="text-[10px] text-destructive">{tokenNameError}</span>
            ) : (
              <span className="text-[10px] font-light text-muted-foreground">
                {t("Button-Primary, Card-Header, Text-Large etc.")}
              </span>
            )}
          </div>

          <ManualClasses
            from="designToken"
            classFromProps={classes}
            onAddNew={handleAddClass}
            onRemove={handleRemoveClass}
          />

          {/* Footer - only show Add button for add mode */}
          {!isEditMode && (
            <div className="mt-3 flex items-center justify-end gap-2 pt-3">
              <Button variant="outline" onClick={resetAndGoToView} className="h-7 text-xs">
                {t("Cancel")}
              </Button>
              <Button
                onClick={handleAddToken}
                disabled={!tokenName.trim() || !classes.trim() || !!tokenNameError}
                className="h-7 text-xs">
                {t("Add Token")}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Token List View
  const renderTokenList = () => {
    return (
      <>
        {/* Header */}
        {Object.entries(designTokens).length > 0 && (
          <div className="flex items-center justify-between gap-x-2">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("Search tokens")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-6 pl-7 text-xs"
              />
            </div>
            <Button
              variant="outline"
              onClick={startAdd}
              size="sm"
              className="h-6 border-primary text-xs text-primary hover:bg-primary/10 hover:text-primary">
              <PlusIcon className="h-3 w-3" />
              {t("Add")}
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="no-scrollbar flex flex-1 flex-col overflow-hidden pt-2">
          <ScrollArea className="h-full flex-1">
            <div className="space-y-1">
              {Object.entries(designTokens).length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted bg-muted/20 py-8">
                  <div className="mb-2 text-3xl">
                    <TokensIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <p className="mb-1 text-sm font-medium text-foreground">{t("No design tokens yet")}</p>
                  <p className="text-center text-xs text-muted-foreground">
                    {t("Create reusable design tokens to streamline your styling")}
                  </p>
                  <Button variant="default" onClick={startAdd} size="sm" className="mt-4 h-7 text-xs leading-tight">
                    <PlusIcon className="mr-1 h-3 w-3" />
                    {t("Add first design token")}
                  </Button>
                </div>
              ) : filteredTokens.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted bg-muted/20 py-8">
                  <div className="mb-2">
                    <MagnifyingGlassIcon className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="mb-1 text-sm font-medium text-foreground">{t("No tokens found")}</p>
                  <p className="text-center text-xs text-muted-foreground">{t("No design tokens match your search")}</p>
                </div>
              ) : (
                filteredTokens.map(([tokenId, token]) => (
                  <SingleDesignToken
                    key={tokenId}
                    token={token}
                    tokenId={tokenId}
                    onEdit={startEdit}
                    onDelete={handleDeleteToken}
                    isDisabled={false}
                  />
                ))
              )}
              <div className="h-44" />
            </div>
          </ScrollArea>
        </div>
      </>
    );
  };

  return <div className="flex h-full w-full flex-col">{viewMode === "view" ? renderTokenList() : renderForm()}</div>;
};

export default ManageDesignTokens;
