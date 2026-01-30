import { db, safeQuery, schema } from "@/actions/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { ActionError } from "./action-error";
import { ChaiBaseAction } from "./base-action";

type PublishWebsiteSettingsActionData = Record<string, never>;

type PublishWebsiteSettingsActionResponse = {
  success: boolean;
};

/**
 * Action to publish website settings from apps to apps_online
 */
export class PublishWebsiteSettingsAction extends ChaiBaseAction<
  PublishWebsiteSettingsActionData,
  PublishWebsiteSettingsActionResponse
> {
  protected getValidationSchema() {
    return z.object({}).default({});
  }

  async execute(_data: PublishWebsiteSettingsActionData): Promise<PublishWebsiteSettingsActionResponse> {
    await this.verifyAccess();
    if (!this.context) {
      throw new ActionError("Context not set", "CONTEXT_NOT_SET");
    }

    const { appId } = this.context;

    try {
      // Fetch current settings from apps table
      const { data: current, error: fetchError } = await safeQuery(() =>
        db
          .select({
            settings: schema.apps.settings,
          })
          .from(schema.apps)
          .where(eq(schema.apps.id, appId))
          .limit(1),
      );

      if (fetchError || !current || current.length === 0) {
        throw new ActionError("Error fetching current settings", "ERROR_FETCHING_SETTINGS", 500, fetchError);
      }

      const currentSettings = current[0];

      // Update apps_online table with current settings
      const { error: updateError } = await safeQuery(() =>
        db.update(schema.appsOnline).set({ settings: currentSettings.settings }).where(eq(schema.appsOnline.id, appId)),
      );

      if (updateError) {
        throw new ActionError("Error publishing website settings", "ERROR_PUBLISHING_SETTINGS", 500, updateError);
      }

      return { success: true };
    } catch (error) {
      if (error instanceof ActionError) {
        throw error;
      }
      throw new ActionError(
        `Failed to publish website settings: ${error instanceof Error ? error.message : "Unknown error"}`,
        "PUBLISH_WEBSITE_SETTINGS_FAILED",
      );
    }
  }
}
