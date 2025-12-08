import { chaiDesignTokensAtom } from "@/core/atoms/builder";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/ui/shadcn/components/ui/alert-dialog";
import { Button } from "@/ui/shadcn/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/shadcn/components/ui/dialog";
import { Input } from "@/ui/shadcn/components/ui/input";
import { Label } from "@/ui/shadcn/components/ui/label";
import { ScrollArea } from "@/ui/shadcn/components/ui/scroll-area";
import { Textarea } from "@/ui/shadcn/components/ui/textarea";
import { Pencil1Icon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { useAtom } from "jotai";
import { nanoid } from "nanoid";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useIncrementActionsCount } from "../../use-auto-save";
import { TokenUsagePopover } from "./token-usage-popover";

interface ManageDesignTokensProps {}

export const ManageDesignTokens = ({}: ManageDesignTokensProps) => {
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
  const incrementActionsCount = useIncrementActionsCount();

  const validateTokenName = (tokenName: string): boolean => {
    // Alphanumeric names with hyphens, max 25 characters
    const trimmed = tokenName.trim();
    if (trimmed.length === 0 || trimmed.length > 25) {
      return false;
    }
    // Allow alphanumeric characters and hyphens (no consecutive hyphens)
    const nameRegex = /^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/;
    return nameRegex.test(trimmed);
  };

  const getTokenNameError = (tokenName: string, isEditing: boolean = false, currentTokenId?: string): string => {
    const trimmed = tokenName.trim();

    if (trimmed.length === 0) {
      return "";
    }

    if (trimmed.length > 25) {
      return t("Token name must be 25 characters or less");
    }

    const nameRegex = /^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/;
    if (!nameRegex.test(trimmed)) {
      return t("Only alphanumeric characters and hyphens allowed");
    }

    // Check for duplicates by name
    const existingTokenWithName = Object.entries(designTokens).find(
      ([id, token]) => token.name === trimmed && (!isEditing || id !== currentTokenId),
    );
    if (existingTokenWithName) {
      return t("Token name already exists");
    }

    return "";
  };

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
    const tokenId = `token_${nanoid(12)}`;
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
    const convertedValue = value.replace(/\s+/g, "-"); // Convert spaces to hyphens
    setNewTokenName(convertedValue);
    setNewTokenNameError(getTokenNameError(convertedValue));
  };

  const handleEditTokenNameChange = (value: string) => {
    const convertedValue = value.replace(/\s+/g, "-"); // Convert spaces to hyphens
    setEditTokenName(convertedValue);
    setEditTokenNameError(getTokenNameError(convertedValue, true, editingToken || undefined));
  };

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header */}
      <div className="">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={startAdd}
            disabled={isAdding || editingToken !== null}
            size="sm"
            className="h-7 text-xs">
            <PlusIcon className="mr-1 h-3 w-3" />
            {t("Add")}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="no-scrollbar flex flex-1 flex-col overflow-hidden pt-2">
        {/* Tokens List */}
        <ScrollArea className="h-full flex-1">
          <div className="space-y-1">
            {Object.entries(designTokens).length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">
                <div className="mb-1 text-2xl">🎨</div>
                <p className="text-xs">{t("No design tokens defined")}</p>
              </div>
            ) : (
              Object.entries(designTokens).map(([tokenId, token]) => (
                <div
                  key={tokenId}
                  className={`group flex items-center justify-between hover:bg-muted/90 ${editingToken === tokenId ? "bg-primary/10" : ""}`}>
                  <div className="min-w-0 flex-1">
                    <span className="flex items-center break-all pl-1 text-xs font-semibold">{token.name}</span>
                  </div>
                  <div className="flex flex-shrink-0 items-center opacity-0 group-hover:opacity-100">
                    <TokenUsagePopover tokenId={tokenId} tokenName={token.name} />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(tokenId)}
                      disabled={isAdding || editingToken !== null}
                      className="h-6 w-6 p-0">
                      <Pencil1Icon className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isAdding || editingToken !== null}
                          className="h-6 w-6 p-0">
                          <TrashIcon className="h-3 w-3 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-md">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-base">{t("Delete Token")}</AlertDialogTitle>
                          <AlertDialogDescription className="text-sm">
                            {t("Delete this token?")}
                            <br />
                            <code className="mt-1 inline-block rounded bg-muted px-1 py-0.5 font-mono text-xs">
                              {token.name}
                            </code>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="h-7 text-xs">{t("Cancel")}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteToken(tokenId)}
                            className="h-7 bg-destructive text-xs text-destructive-foreground hover:bg-destructive/90">
                            {t("Delete")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Add Token Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={cancelAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">{t("Add Design Token")}</DialogTitle>
            <DialogDescription className="text-sm">
              {t("Create a new reusable design token with Tailwind classes.")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-selector" className="text-sm">
                {t("Token Name")}
              </Label>
              <Input
                id="new-selector"
                placeholder="Button-Primary"
                value={newTokenName}
                onChange={(e) => handleNewTokenNameChange(e.target.value)}
                className="text-sm"
              />
              {newTokenNameError ? (
                <span className="text-sm text-destructive">{newTokenNameError}</span>
              ) : (
                <span className="text-sm text-muted-foreground">{t("Button-Primary, Card-Header, Text-Large")}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-classes" className="text-sm">
                {t("Tailwind Classes")}
              </Label>
              <Textarea
                id="new-classes"
                placeholder="bg-blue-500 text-white px-4 py-2"
                value={newClasses}
                onChange={(e) => setNewClasses(e.target.value)}
                className="min-h-[80px] resize-none font-mono text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelAdd} className="h-8 text-sm">
              {t("Cancel")}
            </Button>
            <Button onClick={handleAddToken} className="h-8 text-sm">
              {t("Add Token")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Token Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={cancelEdit}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">{t("Edit Design Token")}</DialogTitle>
            <DialogDescription className="text-sm">{t("Update the design token name and classes.")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-selector" className="text-sm">
                {t("Token Name")}
              </Label>
              <Input
                id="edit-selector"
                value={editTokenName}
                onChange={(e) => handleEditTokenNameChange(e.target.value)}
                className="text-sm"
              />
              {editTokenNameError && <span className="text-sm text-destructive">{editTokenNameError}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-classes" className="text-sm">
                {t("Classes")}
              </Label>
              <Textarea
                id="edit-classes"
                value={editClasses}
                onChange={(e) => setEditClasses(e.target.value)}
                className="min-h-[80px] resize-none font-mono text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelEdit} className="h-8 text-sm">
              {t("Cancel")}
            </Button>
            <Button onClick={handleEditToken} className="h-8 text-sm">
              {t("Update Token")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
