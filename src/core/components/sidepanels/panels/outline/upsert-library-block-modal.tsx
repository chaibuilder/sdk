import { zodResolver } from "@hookform/resolvers/zod";
import { atom, useAtom } from "jotai";
import { find } from "lodash-es";
import { XCircle } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  Textarea,
} from "../../../../../ui";
import ChaiSelect from "../../../../components/ChaiSelect";
import {
  PERMISSIONS,
  useBlocksStore,
  useBuilderProp,
  usePermissions,
  useUpdateBlocksPropsRealtime,
} from "../../../../main";

export const saveToLibraryModalAtom = atom<{
  isOpen: boolean;
  blockId: string | null;
}>({
  isOpen: false,
  blockId: null,
});

// Save to Library Modal Component
export const SaveToLibraryModal = () => {
  const [modalState, setModalState] = useAtom(saveToLibraryModalAtom);
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const [blocks] = useBlocksStore();
  const uiLibraries = useBuilderProp("uiLibraries", []);
  // Find the selected block
  const selectedBlock = useMemo(() => {
    if (!modalState.blockId) return null;
    return find(blocks, { _id: modalState.blockId });
  }, [blocks, modalState.blockId]);

  const isUpdateMode = !!selectedBlock?._libBlockId;

  // Form validation schema
  const formSchema = z.object({
    library: z.string().min(1, { message: t("Library is required") }),
    name: z.string().min(1, { message: t("Name is required") }),
    group: z.string().min(1, { message: t("Group is required") }),
    description: z.string().optional(),
    screenshot: z.any().optional(),
  });

  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      library: "",
      name: selectedBlock?._name || "",
      group: "",
      description: "",
    },
    mode: "onChange",
  });

  // Image preview state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("screenshot", file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle removing selected image
  const handleRemoveImage = () => {
    setImagePreview(null);
    form.setValue("screenshot", undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const updateBlockPropsRealtime = useUpdateBlocksPropsRealtime();
  const upsertLibraryBlock = useBuilderProp("upsertLibraryBlock", null);
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!upsertLibraryBlock || typeof upsertLibraryBlock !== "function") {
      console.error("Something went wrong!!");
      return;
    }
    try {
      // Mock library block saving - replace with actual implementation
      const result: { id: string } | Error = await upsertLibraryBlock({
        ...values,
        ...(selectedBlock?._libBlockId && { id: selectedBlock?._libBlockId }),
      });
      debugger;
      if (result instanceof Error) {
        toast.error(result.message);
        return;
      }
      const { id } = result;

      updateBlockPropsRealtime([selectedBlock?._id], {
        _libBlockId: id,
      });
      // Show success message
      toast.success(isUpdateMode ? t("Library block updated") : t("Added to library"));

      // Close modal
      setModalState({ isOpen: false, blockId: null });
    } catch (error) {
      toast.error(t("Failed to save to library"));
      console.error("Error saving to library:", error);
    }
  };

  // Mock data for libraries and groups - replace with actual data source

  const [groups, setGroups] = useState([]);

  const [newGroupName, setNewGroupName] = useState("");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  const handleGroupChange = (value: string) => {
    form.setValue("group", value);
  };

  const handleCreateNewGroup = () => {
    setIsCreatingGroup(true);
  };

  const handleCreateGroup = () => {
    if (newGroupName) {
      // Create a new group ID from the name (simplified)
      const newGroupId = newGroupName.toLowerCase().replace(/\s+/g, "-");

      // Add new group to the groups array
      setGroups([...groups, { id: newGroupId, name: newGroupName }]);

      // Set the form value to the new group ID
      form.setValue("group", newGroupId);

      // Reset states
      setNewGroupName("");
      setIsCreatingGroup(false);
    }
  };

  const handleCancelGroupCreation = () => {
    setNewGroupName("");
    setIsCreatingGroup(false);
  };

  return (
    <Dialog open={modalState.isOpen} onOpenChange={(open) => !open && setModalState({ isOpen: false, blockId: null })}>
      <DialogContent className="p-4 sm:max-w-[450px]">
        <DialogHeader className="pb-2">
          <DialogTitle>{isUpdateMode ? t("Update Library Block") : t("Save to Library")}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="library"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs">{t("Library")}</FormLabel>
                  <FormControl>
                    <ChaiSelect
                      height="h-8"
                      options={uiLibraries.map((library) => ({
                        value: library.id,
                        label: library.name,
                      }))}
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder={t("Select a library")}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs">{t("Name")}</FormLabel>
                  <FormControl>
                    <Input className="h-8" placeholder={t("Enter name")} {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="group"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs">{t("Group")}</FormLabel>
                  {isCreatingGroup ? (
                    <div className="flex space-x-1">
                      <Input
                        className="h-8"
                        placeholder={t("Enter new group name")}
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                      />
                      <Button
                        type="button"
                        onClick={handleCreateGroup}
                        disabled={!newGroupName}
                        size="sm"
                        className="h-8">
                        {t("Add")}
                      </Button>
                      <Button
                        type="button"
                        onClick={handleCancelGroupCreation}
                        variant="outline"
                        size="sm"
                        className="h-8">
                        {t("Cancel")}
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex space-x-1">
                        <FormControl className="flex-1">
                          <ChaiSelect
                            height="h-8"
                            options={groups.map((group) => ({
                              value: group.id,
                              label: group.name,
                            }))}
                            defaultValue={field.value}
                            onValueChange={handleGroupChange}
                            placeholder={t("Select a group")}
                          />
                        </FormControl>
                        {hasPermission(PERMISSIONS.CREATE_LIBRARY_GROUP) && (
                          <Button
                            type="button"
                            variant="outline"
                            className="h-8 whitespace-nowrap text-xs"
                            onClick={handleCreateNewGroup}
                            size="sm">
                            {t("Create new")}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormItem className="space-y-1">
              <FormLabel className="text-xs">{t("Screenshot")}</FormLabel>
              <div className="mt-0">
                {imagePreview ? (
                  <div className="relative h-20 w-full">
                    <img
                      src={imagePreview}
                      alt="Screenshot preview"
                      className="h-full w-full rounded-md border border-gray-200 object-contain"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -right-2 -top-2 rounded-full bg-background text-foreground hover:text-destructive"
                      aria-label="Remove image">
                      <XCircle size={20} />
                    </button>
                  </div>
                ) : (
                  <Label
                    htmlFor="screenshot"
                    className="flex h-20 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center py-2">
                      <p className="text-xs text-gray-500">{t("Drop your image here, or click to browse")}</p>
                    </div>
                    <Input
                      id="screenshot"
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </Label>
                )}
              </div>
            </FormItem>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs">{t("Description")}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t("Enter description for AI")} className="h-20 resize-none" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalState({ isOpen: false, blockId: null })}
                size="sm">
                {t("Cancel")}
              </Button>
              <Button
                type="submit"
                onClick={form.handleSubmit(onSubmit)}
                disabled={!form.formState.isValid || form.formState.isSubmitting}
                size="sm">
                {isUpdateMode ? t("Update") : t("Save")}
              </Button>
            </DialogFooter>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
