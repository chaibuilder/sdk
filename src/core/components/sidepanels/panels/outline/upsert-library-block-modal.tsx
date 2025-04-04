import { zodResolver } from "@hookform/resolvers/zod";
import { atom, useAtom } from "jotai";
import { find } from "lodash-es";
import { useMemo, useState } from "react";
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
import { useBlocksStore, usePermissions } from "../../../../main";

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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Mock library block saving - replace with actual implementation
      console.log("Saving to library:", values, "Block:", selectedBlock);

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
  const libraries = [
    { id: "default", name: "Default Library" },
    { id: "custom", name: "Custom Library" },
  ];

  const [groups, setGroups] = useState([
    { id: "layout", name: "Layout" },
    { id: "components", name: "Components" },
    { id: "forms", name: "Forms" },
  ]);

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isUpdateMode ? t("Update Library Block") : t("Save to Library")}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="library"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Library")}</FormLabel>
                  <FormControl>
                    <ChaiSelect
                      height="h-8"
                      options={libraries.map((library) => ({
                        value: library.id,
                        label: library.name,
                      }))}
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder={t("Select a library")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("Enter name")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="group"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Group")}</FormLabel>
                  {isCreatingGroup ? (
                    <div className="flex space-x-2">
                      <Input
                        placeholder={t("Enter new group name")}
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                      />
                      <Button type="button" onClick={handleCreateGroup} disabled={!newGroupName} size="sm">
                        {t("Add")}
                      </Button>
                      <Button type="button" onClick={handleCancelGroupCreation} variant="outline" size="sm">
                        {t("Cancel")}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex space-x-2">
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
                        <Button
                          type="button"
                          variant="outline"
                          className="whitespace-nowrap text-xs"
                          onClick={handleCreateNewGroup}>
                          {t("Create new")}
                        </Button>
                      </div>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>{t("Screenshot")}</FormLabel>
              <div className="mt-1 flex items-center">
                <Label
                  htmlFor="screenshot"
                  className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pb-6 pt-5">
                    <p className="mb-2 text-sm text-gray-500">{t("Drop your image here, or click to browse")}</p>
                  </div>
                  <Input
                    id="screenshot"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => form.setValue("screenshot", e.target.files?.[0])}
                  />
                </Label>
              </div>
            </FormItem>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Description")}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t("Enter description for AI")} className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalState({ isOpen: false, blockId: null })}>
                {t("Cancel")}
              </Button>
              <Button
                type="submit"
                onClick={form.handleSubmit(onSubmit)}
                disabled={!form.formState.isValid || form.formState.isSubmitting}>
                {isUpdateMode ? t("Update") : t("Save")}
              </Button>
            </DialogFooter>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
