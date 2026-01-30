import { db, safeQuery, schema } from "@/actions/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { ActionError } from "./action-error";
import { ChaiBaseAction } from "./base-action";

type UpdateWebsiteSettingActionData = {
  name?: string;
  languages?: string[];
  settings?: Record<string, any>;
};

type UpdateWebsiteSettingActionResponse = {
  success: boolean;
  data?: any;
};

/**
 * Action to update website settings (name, languages, settings)
 */
export class UpdateWebsiteSettingAction extends ChaiBaseAction<
  UpdateWebsiteSettingActionData,
  UpdateWebsiteSettingActionResponse
> {
  protected getValidationSchema() {
    return z.object({
      name: z.string().optional(),
      languages: z.array(z.string()).optional(),
      settings: z.record(z.string(), z.any()).optional(),
    });
  }

  async execute(data: UpdateWebsiteSettingActionData): Promise<UpdateWebsiteSettingActionResponse> {
    await this.verifyAccess();
    if (!this.context) {
      throw new ActionError("Context not set", "CONTEXT_NOT_SET");
    }

    const { appId } = this.context;

    if (!data || Object.keys(data).length === 0) {
      throw new ActionError("Missing updates", "MISSING_UPDATES");
    }

    try {
      // Fetch current data
      const { data: current, error: fetchError } = await safeQuery(() =>
        db
          .select({
            name: schema.apps.name,
            languages: schema.apps.languages,
            settings: schema.apps.settings,
          })
          .from(schema.apps)
          .where(eq(schema.apps.id, appId))
          .limit(1),
      );

      if (fetchError || !current || current.length === 0) {
        throw new ActionError("Error fetching current data", "ERROR_FETCHING_DATA", 500, fetchError);
      }

      const currentData = current[0];
      const update = { ...currentData, ...data };

      // Update apps table
      const { error: updateError } = await safeQuery(() =>
        db.update(schema.apps).set(update).where(eq(schema.apps.id, appId)),
      );

      if (updateError) {
        throw new ActionError("Error updating website settings", "ERROR_UPDATING_SETTINGS", 500, updateError);
      }

      // Check if name or languages changed
      const isNameChanged = data.name && currentData?.name !== data?.name;
      const isLanguagesChanged = data?.languages
        ? JSON.stringify(currentData?.languages || []) !== JSON.stringify(data?.languages || [])
        : false;

      // Update apps_online table if name or languages changed
      if (isNameChanged || isLanguagesChanged) {
        const onlineUpdate: any = {};
        if (isNameChanged) onlineUpdate.name = data.name;
        if (isLanguagesChanged) onlineUpdate.languages = data.languages;

        const { error: onlineUpdateError } = await safeQuery(() =>
          db.update(schema.appsOnline).set(onlineUpdate).where(eq(schema.appsOnline.id, appId)),
        );

        if (onlineUpdateError) {
          throw new ActionError(
            "Error updating online settings",
            "ERROR_UPDATING_ONLINE_SETTINGS",
            500,
            onlineUpdateError,
          );
        }
      }

      return { success: true, data: update };
    } catch (error) {
      if (error instanceof ActionError) {
        throw error;
      }
      throw new ActionError(
        `Failed to update website settings: ${error instanceof Error ? error.message : "Unknown error"}`,
        "UPDATE_WEBSITE_SETTINGS_FAILED",
      );
    }
  }
}
