import { chaiDesignTokensAtom } from "@/core/atoms/builder";
import { DESIGN_TOKEN_PREFIX } from "@/core/constants/STRINGS";
import { Button } from "@/ui/shadcn/components/ui/button";
import { Input } from "@/ui/shadcn/components/ui/input";
import { ScrollArea } from "@/ui/shadcn/components/ui/scroll-area";
import { EyeOpenIcon, MagnifyingGlassIcon, Pencil1Icon, PlusIcon, TokensIcon, TrashIcon } from "@radix-ui/react-icons";
import { useAtom } from "jotai";
import { nanoid } from "nanoid";
import { lazy, Suspense, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useIncrementActionsCount } from "../../../use-auto-save";
import { convertTokenNameInput, getTokenNameError, validateTokenName } from "./design-token-utils";

const AddDesignTokenModal = lazy(() => import("./add-design-token").then((m) => ({ default: m.AddDesignTokenModal })));
const EditDesignTokenModal = lazy(() =>
  import("./edit-design-token").then((m) => ({ default: m.EditDesignTokenModal })),
);
const DeleteDesignToken = lazy(() => import("./delete-design-token"));
const DesignTokenUsage = lazy(() => import("./design-token-usage"));

interface SingleDesignTokenProps {
  tokenId: string;
  token: { name: string; value: string };
  isEditing: boolean;
  isDisabled: boolean;
  onEdit: (tokenId: string) => void;
  onDelete: (tokenId: string) => void;
}

const SingleDesignToken = ({ tokenId, token, isEditing, isDisabled, onEdit, onDelete }: SingleDesignTokenProps) => {
  return (
    <div
      className={`group relative flex items-center justify-between rounded border p-2 hover:bg-muted/90 ${isEditing ? "bg-primary/10" : ""}`}>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold">{token.name}</div>
        <div className="w-full max-w-52 truncate text-[10px] font-light">{token.value}</div>
      </div>
      <div className="absolute right-1 top-1 flex flex-shrink-0 items-center opacity-0 group-hover:opacity-100">
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

  const [isAdding, setIsAdding] = useState(false);
  const [editingToken, setEditingToken] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newTokenName, setNewTokenName] = useState("");
  const [newClasses, setNewClasses] = useState("");
  const [editTokenName, setEditTokenName] = useState("");
  const [editClasses, setEditClasses] = useState("");
  const [newTokenNameError, setNewTokenNameError] = useState("");
  const [editTokenNameError, setEditTokenNameError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const incrementActionsCount = useIncrementActionsCount();

  const filteredTokens = useMemo(() => {
    return Object.entries(designTokens).filter(
      ([, token]) =>
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.value.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [designTokens, searchQuery]);

  const handleAddToken = () => {
    if (!newTokenName.trim() || !newClasses.trim()) {
      toast.error(t("Please fill in both token name and classes"));
      return;
    }

    if (!validateTokenName(newTokenName)) {
      toast.error(t("Invalid design token name format"));
      return;
    }

    // Check if token name already exists
    const existingTokenWithName = Object.values(designTokens).find((token) => token.name === newTokenName.trim());
    if (existingTokenWithName) {
      toast.error(t("Token already exists"));
      return;
    }
    // Generate a unique ID for the token
    const tokenId = `${DESIGN_TOKEN_PREFIX}${nanoid(12)}`;
    const newTokens = {
      ...designTokens,
      [tokenId]: {
        name: newTokenName.trim(),
        value: newClasses.trim(),
      },
    };
    setDesignTokens(newTokens);

    setNewTokenName("");
    setNewClasses("");
    setIsAdding(false);
    setIsAddModalOpen(false);
    incrementActionsCount();
    toast.success(t("Token added successfully"));
  };

  const handleEditToken = () => {
    if (!editTokenName.trim() || !editClasses.trim()) {
      toast.error(t("Please fill in both token name and classes"));
      return;
    }

    if (!validateTokenName(editTokenName)) {
      toast.error(t("Invalid design token name format"));
      return;
    }

    // Check if token name already exists (excluding current token)
    const existingTokenWithName = Object.entries(designTokens).find(
      ([id, token]) => token.name === editTokenName.trim() && id !== editingToken,
    );
    if (existingTokenWithName) {
      toast.error(t("Token already exists"));
      return;
    }

    if (!editingToken) {
      return;
    }

    const newTokens = {
      ...designTokens,
      [editingToken]: {
        name: editTokenName.trim(),
        value: editClasses.trim(),
      },
    };
    setDesignTokens(newTokens);

    setEditingToken(null);
    setEditTokenName("");
    setEditClasses("");
    setIsEditModalOpen(false);
    incrementActionsCount();
    toast.success(t("Token updated successfully"));
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

    setEditingToken(tokenId);
    setEditTokenName(token.name);
    setEditClasses(token.value);
    setIsAdding(false);
    setIsEditModalOpen(true);
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingToken(null);
    setNewTokenName("");
    setNewClasses("");
    setNewTokenNameError("");
    setIsAddModalOpen(true);
  };

  const cancelEdit = () => {
    setEditingToken(null);
    setEditTokenName("");
    setEditClasses("");
    setEditTokenNameError("");
    setIsEditModalOpen(false);
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setNewTokenName("");
    setNewClasses("");
    setNewTokenNameError("");
    setIsAddModalOpen(false);
  };

  const handleNewTokenNameChange = (value: string) => {
    const convertedValue = convertTokenNameInput(value);
    setNewTokenName(convertedValue);
    setNewTokenNameError(getTokenNameError(convertedValue, designTokens, t));
  };

  const handleEditTokenNameChange = (value: string) => {
    const convertedValue = convertTokenNameInput(value);
    setEditTokenName(convertedValue);
    setEditTokenNameError(getTokenNameError(convertedValue, designTokens, t, true, editingToken || undefined));
  };

  return (
    <div className="flex h-full w-full flex-col">
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
            disabled={isAdding || editingToken !== null}
            size="sm"
            className="h-6 border-primary text-xs text-primary hover:bg-primary/10 hover:text-primary">
            <PlusIcon className="h-3 w-3" />
            {t("Add")}
          </Button>
        </div>
      )}

      {/* Content */}
      <div className="no-scrollbar flex flex-1 flex-col overflow-hidden pt-2">
        {/* Tokens List */}
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
                <Button
                  variant="default"
                  onClick={startAdd}
                  disabled={isAdding || editingToken !== null}
                  size="sm"
                  className="mt-4 h-7 text-xs leading-tight">
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
                  isEditing={editingToken === tokenId}
                  isDisabled={isAdding || editingToken !== null}
                />
              ))
            )}
            <div className="h-44" />
          </div>
        </ScrollArea>
      </div>

      {isAddModalOpen && (
        <Suspense fallback={null}>
          <AddDesignTokenModal
            onClose={cancelAdd}
            classes={newClasses}
            onAdd={handleAddToken}
            isOpen={isAddModalOpen}
            tokenName={newTokenName}
            onClassesChange={setNewClasses}
            tokenNameError={newTokenNameError}
            onTokenNameChange={handleNewTokenNameChange}
          />
        </Suspense>
      )}
      {isEditModalOpen && (
        <Suspense fallback={null}>
          <EditDesignTokenModal
            onClose={cancelEdit}
            classes={editClasses}
            onEdit={handleEditToken}
            isOpen={isEditModalOpen}
            tokenName={editTokenName}
            onClassesChange={setEditClasses}
            tokenNameError={editTokenNameError}
            onTokenNameChange={handleEditTokenNameChange}
          />
        </Suspense>
      )}
    </div>
  );
};

export default ManageDesignTokens;
