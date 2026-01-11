import { z } from "zod";
import { ChaiBaseAction } from "@/server/actions/base-action";
import { ChaiAssets } from "../../assets/class-chai-assets";

const GetAssetsSchema = z.object({
  search: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

type GetAssetsInput = z.infer<typeof GetAssetsSchema>;

export class GetAssetsAction extends ChaiBaseAction<GetAssetsInput> {
  protected getValidationSchema() {
    return GetAssetsSchema;
  }

  async execute(data: GetAssetsInput) {
    try {
      if (!this.context) {
        return { error: "Context not set", status: 400 };
      }

      const { appId, userId } = this.context;
      if (!userId) {
        return { error: "User ID is required", status: 401 };
      }

      const backend = new ChaiAssets(appId, userId);
      const response = await backend.getAssets(data);

      if ("error" in response) {
        return { error: response.error, status: 400 };
      }

      return response ;
    } catch (error) {
      console.error("GET_ASSETS error:", error);
      return { error: error instanceof Error ? error.message : "Unknown error", status: 500 };
    }
  }
}
