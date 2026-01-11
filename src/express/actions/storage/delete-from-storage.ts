import { z } from "zod";
import { ChaiBaseAction } from "@/server/actions/base-action";
import { supabase } from "@/express/supabase-admin";

const DeleteFromStorageSchema = z.object({
  key: z.string(), // Storage key/path to delete
});

type DeleteFromStorageInput = z.infer<typeof DeleteFromStorageSchema>;

/**
 * DELETE_FROM_STORAGE Action
 * Generic storage delete action using Supabase Storage
 */
export class DeleteFromStorageAction extends ChaiBaseAction<DeleteFromStorageInput> {
  private bucketName = "dam-assets";

  protected getValidationSchema() {
    return DeleteFromStorageSchema;
  }

  async execute(data: DeleteFromStorageInput) {
    try {
      const { key } = data;

      // Delete from Supabase Storage
      const { error } = await supabase.storage.from(this.bucketName).remove([key]);

      if (error) {
        return {
          error: `Failed to delete from Supabase Storage: ${error.message}`,
          status: 500,
        };
      }

      return {
        data: { success: true },
        status: 200,
      };
    } catch (error) {
      console.error("DELETE_FROM_STORAGE error:", error);
      return {
        error: error instanceof Error ? error.message : "Unknown error",
        status: 500,
      };
    }
  }
}
