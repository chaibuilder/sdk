import { db, safeQuery, schema } from "@/actions/db";
import { apiError } from "@/actions/lib";
import { eq } from "drizzle-orm";
import { pick } from "lodash-es";
import { z } from "zod";
import { ChaiBaseAction } from "./base-action";

type UpdateWebsiteFieldsActionData = {
  settings: any;
};

type UpdateWebsiteFieldsActionResponse = {
  success: boolean;
};

/**
 * Action to update website settings (theme, designTokens, etc.)
 * Matches the behavior of the old ChaiBuilderWebsite.updateWebsiteSettings method
 */
export class UpdateWebsiteFieldsAction extends ChaiBaseAction<
  UpdateWebsiteFieldsActionData,
  UpdateWebsiteFieldsActionResponse
> {
  protected getValidationSchema() {
    return z.object({
      settings: z.any(),
    });
  }

  async execute(data: UpdateWebsiteFieldsActionData): Promise<UpdateWebsiteFieldsActionResponse> {
    await this.verifyAccess();
    if (!this.context) {
      throw apiError("CONTEXT_NOT_SET", new Error("CONTEXT_NOT_SET"));
    }

    const { appId } = this.context;

    // Pick only the allowed columns from settings (matching old implementation)
    const columns = pick(data.settings, ["theme", "designTokens"]);

    // Build the changes array based on which fields are being updated
    const changes: string[] = [];
    if (columns.theme !== undefined) {
      changes.push("THEME");
    }
    if (columns.designTokens !== undefined) {
      changes.push("DESIGN_TOKEN");
    }

    // Build the update object with changes flag
    const updateData = {
      ...columns,
      changes,
    };

    // Execute the update query
    const { error } = await safeQuery(() => db.update(schema.apps).set(updateData).where(eq(schema.apps.id, appId)));

    if (error) {
      throw apiError("ERROR_UPDATE_WEBSITE_FIELDS", error);
    }

    return { success: true };
  }
}
