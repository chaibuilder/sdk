import { z } from "zod";
import { ChaiBaseAction } from "@/server/actions/base-action";
import { ChaiAssets } from "../../assets/class-chai-assets";

const UploadAssetSchema = z.object({
  name: z.string(),
  file: z.string(),
  folderId: z.string().optional().nullable(),
  optimize: z.boolean().optional(),
});

type UploadAssetInput = z.infer<typeof UploadAssetSchema>;

export class UploadAssetAction extends ChaiBaseAction<UploadAssetInput> {
  protected getValidationSchema() {
    return UploadAssetSchema;
  }

  async execute(data: UploadAssetInput) {
    try {
      if (!this.context) {
        return { error: "Context not set", status: 400 };
      }

      const { appId, userId } = this.context;
      if (!userId) {
        return { error: "User ID is required", status: 401 };
      }

      const backend = new ChaiAssets(appId, userId);
      const response = await backend.upload(data);

      if ("error" in response) {
        return { error: response.error, status: 400 };
      }

      return response;
    } catch (error) {
      console.error("UPLOAD_ASSET error:", error);
      return { error: error instanceof Error ? error.message : "Unknown error", status: 500 };
    }
  }
}
