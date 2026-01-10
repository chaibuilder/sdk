import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db, safeQuery, schema } from "../db";
import { apiError } from "../lib";
import { ChaiBaseAction } from "./base-action";

type GetRoleAndPermissionsActionData = Record<string, never>;

type GetRoleAndPermissionsActionResponse = {
  role: string;
  permissions: string[] | null;
};

/**
 * Get Role and Permissions Action
 * Retrieves the user's role and permissions for the current app
 */
export class GetRoleAndPermissionsAction extends ChaiBaseAction<
  GetRoleAndPermissionsActionData,
  GetRoleAndPermissionsActionResponse
> {
  protected getValidationSchema() {
    return z.object({});
  }

  async execute(_data: GetRoleAndPermissionsActionData): Promise<GetRoleAndPermissionsActionResponse> {
    if (!this.context) {
      throw apiError("CONTEXT_NOT_SET", new Error("CONTEXT_NOT_SET"));
    }

    const { appId, userId } = this.context;

    if (!userId) {
      throw apiError("USER_NOT_AUTHENTICATED", new Error("User ID not found in context"));
    }

    try {
      // Query the app_users table to get role and permissions
      const { data: appUser, error } = await safeQuery(() => {
        if (!db) {
          throw new Error("Database not configured");
        }
        return db
          .select({
            role: schema.appUsers.role,
            permissions: schema.appUsers.permissions,
          })
          .from(schema.appUsers)
          .where(and(eq(schema.appUsers.app, appId), eq(schema.appUsers.user, userId)))
          .limit(1);
      });

      if (error) {
        throw apiError("ERROR_GETTING_USER_ROLE", error);
      }

      if (!appUser || appUser.length === 0) {
        // Return default role if user not found in app_users table
        return {
          role: "editor",
          permissions: null,
        };
      }

      return {
        role: appUser[0].role || "editor",
        permissions: (appUser[0].permissions as string[]) || null,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
}
