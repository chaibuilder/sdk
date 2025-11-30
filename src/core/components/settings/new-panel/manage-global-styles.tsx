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
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface GlobalStyles {
  [selector: string]: string;
}

interface ManageGlobalStylesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ManageGlobalStyles = ({ open, onOpenChange }: ManageGlobalStylesProps) => {
  const { t } = useTranslation();
  const [globalStyles, setGlobalStyles] = useState<GlobalStyles>({});

  const [isAdding, setIsAdding] = useState(false);
  const [editingSelector, setEditingSelector] = useState<string | null>(null);
  const [newSelector, setNewSelector] = useState("");
  const [newClasses, setNewClasses] = useState("");
  const [editSelector, setEditSelector] = useState("");
  const [editClasses, setEditClasses] = useState("");

  const validateSelector = (selector: string): boolean => {
    // Basic CSS selector validation
    const selectorRegex = /^[.#]?[a-zA-Z][a-zA-Z0-9_-]*(\s*[>+~]\s*[.#]?[a-zA-Z][a-zA-Z0-9_-]*)*$/;
    return selectorRegex.test(selector.trim());
  };

  const handleAddStyle = () => {
    if (!newSelector.trim() || !newClasses.trim()) {
      toast.error(t("Please fill in both selector and classes"));
      return;
    }

    if (!validateSelector(newSelector)) {
      toast.error(t("Invalid CSS selector format"));
      return;
    }

    if (globalStyles[newSelector]) {
      toast.error(t("Selector already exists"));
      return;
    }

    setGlobalStyles((prev) => ({
      ...prev,
      [newSelector]: newClasses,
    }));

    setNewSelector("");
    setNewClasses("");
    setIsAdding(false);
    toast.success(t("Style added successfully"));
  };

  const handleEditStyle = () => {
    if (!editSelector.trim() || !editClasses.trim()) {
      toast.error(t("Please fill in both selector and classes"));
      return;
    }

    if (!validateSelector(editSelector)) {
      toast.error(t("Invalid CSS selector format"));
      return;
    }

    if (editingSelector && editSelector !== editingSelector && globalStyles[editSelector]) {
      toast.error(t("Selector already exists"));
      return;
    }

    setGlobalStyles((prev) => {
      const newStyles = { ...prev };
      if (editingSelector && editSelector !== editingSelector) {
        delete newStyles[editingSelector];
      }
      newStyles[editSelector] = editClasses;
      return newStyles;
    });

    setEditingSelector(null);
    setEditSelector("");
    setEditClasses("");
    toast.success(t("Style updated successfully"));
  };

  const handleDeleteStyle = (selector: string) => {
    setGlobalStyles((prev) => {
      const newStyles = { ...prev };
      delete newStyles[selector];
      return newStyles;
    });
    toast.success(t("Style deleted successfully"));
  };

  const startEdit = (selector: string) => {
    setEditingSelector(selector);
    setEditSelector(selector);
    setEditClasses(globalStyles[selector]);
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingSelector(null);
    setEditSelector("");
    setEditClasses("");
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setNewSelector("");
    setNewClasses("");
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingSelector(null);
    setNewSelector("");
    setNewClasses("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] max-w-4xl flex-col">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-base">
            <span>{t("Global Styles")}</span>
            <Button
              variant="outline"
              onClick={startAdd}
              disabled={isAdding || editingSelector !== null}
              size="sm"
              className="ml-3 h-7 text-xs">
              <PlusIcon className="mr-1 h-3 w-3" />
              {t("Add")}
            </Button>
          </DialogTitle>
          <DialogDescription className="text-xs">
            {t("Manage custom CSS styles using Tailwind-like classes.")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 flex-col space-y-3 overflow-hidden">
          {isAdding && (
            <Card className="border-dashed">
              <CardContent className="space-y-3 p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="new-selector" className="text-xs">
                      {t("Selector")}
                    </Label>
                    <Input
                      id="new-selector"
                      placeholder=".my-class"
                      value={newSelector}
                      onChange={(e) => setNewSelector(e.target.value)}
                      className="h-7 text-xs"
                    />
                    <span className="text-xs text-muted-foreground">{t(".my-class, #my-id, h1")}</span>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="new-classes" className="text-xs">
                      {t("Classes")}
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
                  <p className="text-xs">{t("No styles defined")}</p>
                </div>
              ) : (
                Object.entries(globalStyles).map(([selector, classes]) => (
                  <Card
                    key={selector}
                    className={`${editingSelector === selector ? "border-primary" : ""} transition-colors`}>
                    <CardContent className="p-3">
                      {editingSelector === selector ? (
                        // Edit Mode
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label htmlFor="edit-selector" className="text-xs">
                                {t("Selector")}
                              </Label>
                              <Input
                                id="edit-selector"
                                value={editSelector}
                                onChange={(e) => setEditSelector(e.target.value)}
                                className="h-7 text-xs"
                              />
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
                            <code className="text-nowrap rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                              {selector}
                            </code>
                            <div className="mt-1 line-clamp-2 break-words text-xs text-muted-foreground">{classes}</div>
                          </div>
                          <div className="flex flex-shrink-0 space-x-0.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEdit(selector)}
                              disabled={isAdding || editingSelector !== null}
                              className="h-6 w-6 p-0">
                              <Pencil1Icon className="h-3 w-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={isAdding || editingSelector !== null}
                                  className="h-6 w-6 p-0">
                                  <TrashIcon className="h-3 w-3 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="max-w-md">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-base">{t("Delete Style")}</AlertDialogTitle>
                                  <AlertDialogDescription className="text-sm">
                                    {t("Delete this style?")}
                                    <br />
                                    <code className="mt-1 inline-block rounded bg-muted px-1 py-0.5 font-mono text-xs">
                                      {selector}
                                    </code>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="h-7 text-xs">{t("Cancel")}</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteStyle(selector)}
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
