import { chaiDesignTokensAtom } from "@/core/atoms/builder";
import { useBuilderProp } from "@/core/hooks";
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
import { Card, CardContent } from "@/ui/shadcn/components/ui/card";
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
import { CheckIcon, Cross2Icon, Pencil1Icon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { useAtom } from "jotai";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface ManageDesignTokensProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ManageDesignTokens = ({ open, onOpenChange }: ManageDesignTokensProps) => {
  const { t } = useTranslation();
  const [globalStyles, setGlobalStyles] = useAtom(chaiDesignTokensAtom);
  const onDesignTokenChange = useBuilderProp("onDesignTokenChange", null);

  const [isAdding, setIsAdding] = useState(false);
  const [editingToken, setEditingToken] = useState<string | null>(null);
  const [newTokenName, setNewTokenName] = useState("");
  const [newClasses, setNewClasses] = useState("");
  const [editTokenName, setEditTokenName] = useState("");
  const [editClasses, setEditClasses] = useState("");
  const [newTokenNameError, setNewTokenNameError] = useState("");
  const [editTokenNameError, setEditTokenNameError] = useState("");

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
    const existingTokenWithName = Object.entries(globalStyles).find(
      ([id, token]) => token.name === trimmed && (!isEditing || id !== currentTokenId),
    );
    if (existingTokenWithName) {
      return t("Token name already exists");
    }

    return "";
  };

  const handleAddStyle = () => {
    if (!newTokenName.trim() || !newClasses.trim()) {
      toast.error(t("Please fill in both token name and classes"));
      return;
    }

    if (!validateTokenName(newTokenName)) {
      toast.error(t("Invalid design token name format"));
      return;
    }

    // Check if token name already exists
    const existingTokenWithName = Object.values(globalStyles).find((token) => token.name === newTokenName.trim());
    if (existingTokenWithName) {
      toast.error(t("Token already exists"));
      return;
    }

    // Generate a unique ID for the token
    const tokenId = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newStyles = {
      ...globalStyles,
      [tokenId]: {
        name: newTokenName.trim(),
        value: newClasses.trim(),
      },
    };
    setGlobalStyles(newStyles);
    if (onDesignTokenChange) {
      onDesignTokenChange(newStyles);
    }

    setNewTokenName("");
    setNewClasses("");
    setIsAdding(false);
    toast.success(t("Token added successfully"));
  };

  const handleEditStyle = () => {
    if (!editTokenName.trim() || !editClasses.trim()) {
      toast.error(t("Please fill in both token name and classes"));
      return;
    }

    if (!validateTokenName(editTokenName)) {
      toast.error(t("Invalid design token name format"));
      return;
    }

    // Check if token name already exists (excluding current token)
    const existingTokenWithName = Object.entries(globalStyles).find(
      ([id, token]) => token.name === editTokenName.trim() && id !== editingToken,
    );
    if (existingTokenWithName) {
      toast.error(t("Token already exists"));
      return;
    }

    if (!editingToken) {
      return;
    }

    const newStyles = {
      ...globalStyles,
      [editingToken]: {
        name: editTokenName.trim(),
        value: editClasses.trim(),
      },
    };
    setGlobalStyles(newStyles);
    if (onDesignTokenChange) {
      onDesignTokenChange(newStyles);
    }

    setEditingToken(null);
    setEditTokenName("");
    setEditClasses("");
    toast.success(t("Token updated successfully"));
  };

  const handleDeleteStyle = (tokenId: string) => {
    const newStyles = { ...globalStyles };
    delete newStyles[tokenId];
    setGlobalStyles(newStyles);
    if (onDesignTokenChange) {
      onDesignTokenChange(newStyles);
    }
    toast.success(t("Token deleted successfully"));
  };

  const startEdit = (tokenId: string) => {
    const token = globalStyles[tokenId];
    if (!token) return;

    setEditingToken(tokenId);
    setEditTokenName(token.name);
    setEditClasses(token.value);
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingToken(null);
    setEditTokenName("");
    setEditClasses("");
    setEditTokenNameError("");
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setNewTokenName("");
    setNewClasses("");
    setNewTokenNameError("");
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

  const startAdd = () => {
    setIsAdding(true);
    setEditingToken(null);
    setNewTokenName("");
    setNewClasses("");
    setNewTokenNameError("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] max-w-4xl flex-col">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-base">
            <span>{t("Design Tokens")}</span>
            <Button
              variant="outline"
              onClick={startAdd}
              disabled={isAdding || editingToken !== null}
              size="sm"
              className="ml-3 h-7 text-xs">
              <PlusIcon className="mr-1 h-3 w-3" />
              {t("Add")}
            </Button>
          </DialogTitle>
          <DialogDescription className="text-xs">
            {t("Manage reusable design tokens using Tailwind-like classes.")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 flex-col space-y-3 overflow-hidden">
          {isAdding && (
            <Card className="border-dashed">
              <CardContent className="space-y-3 p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="new-selector" className="text-xs">
                      {t("Token Name")}
                    </Label>
                    <Input
                      id="new-selector"
                      placeholder="Button-Primary"
                      value={newTokenName}
                      onChange={(e) => handleNewTokenNameChange(e.target.value)}
                      className="h-7 text-xs"
                    />
                    {newTokenNameError ? (
                      <span className="text-xs text-destructive">{newTokenNameError}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {t("Button-Primary, Card-Header, Text-Large")}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="new-classes" className="text-xs">
                      {t("Tailwind Classes")}
                    </Label>
                    <Textarea
                      id="new-classes"
                      placeholder="bg-blue-500 text-white px-4 py-2"
                      value={newClasses}
                      onChange={(e) => setNewClasses(e.target.value)}
                      className="min-h-[60px] resize-none text-xs"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={cancelAdd} className="h-6 px-2 text-xs">
                    <Cross2Icon className="h-3 w-3" />
                  </Button>
                  <Button size="sm" onClick={handleAddStyle} className="h-6 px-2 text-xs">
                    <CheckIcon className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Styles List */}
          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {Object.entries(globalStyles).length === 0 ? (
                <div className="py-6 text-center text-muted-foreground">
                  <div className="mb-1 text-2xl">🎨</div>
                  <p className="text-xs">{t("No design tokens defined")}</p>
                </div>
              ) : (
                Object.entries(globalStyles).map(([tokenId, token]) => (
                  <Card
                    key={tokenId}
                    className={`${editingToken === tokenId ? "border-primary" : ""} transition-colors` + " " + "p-0"}>
                    <CardContent className="p-1">
                      {editingToken === tokenId ? (
                        // Edit Mode
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label htmlFor="edit-selector" className="text-xs">
                                {t("Token Name")}
                              </Label>
                              <Input
                                id="edit-selector"
                                value={editTokenName}
                                onChange={(e) => handleEditTokenNameChange(e.target.value)}
                                className="h-7 text-xs"
                              />
                              {editTokenNameError && (
                                <span className="text-xs text-destructive">{editTokenNameError}</span>
                              )}
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="edit-classes" className="text-xs">
                                {t("Classes")}
                              </Label>
                              <Textarea
                                id="edit-classes"
                                value={editClasses}
                                onChange={(e) => setEditClasses(e.target.value)}
                                className="min-h-[60px] resize-none text-xs"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm" onClick={cancelEdit} className="h-6 px-2 text-xs">
                              <Cross2Icon className="h-3 w-3" />
                            </Button>
                            <Button size="sm" onClick={handleEditStyle} className="h-6 px-2 text-xs">
                              <CheckIcon className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <code className="text-nowrap rounded bg-muted p-1 font-mono text-xs">{token.name}</code>
                          </div>
                          <div className="flex flex-shrink-0 space-x-0.5">
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
                                    onClick={() => handleDeleteStyle(tokenId)}
                                    className="h-7 bg-destructive text-xs text-destructive-foreground hover:bg-destructive/90">
                                    {t("Delete")}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="pt-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-7 text-xs">
            {t("Close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
