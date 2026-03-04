import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db, safeQuery, schema } from "../db";
import { ActionError } from "./action-error";
import { ChaiBaseAction } from "./base-action";

type CheckUserAccessResponse = {
  access: boolean;
  role: string;
  permissions: string[] | null;
};

export class CheckUserAccessAction extends ChaiBaseAction<any, CheckUserAccessResponse> {
  protected getValidationSchema() {
    return z.any();
  }

  async execute(): Promise<CheckUserAccessResponse> {
    const user = await this.getUserAccess();
    return {
      access: true,
      role: user.role || "user",
      permissions: (user.permissions as string[]) || null,
    };
  }

  async getUserAccess(): Promise<any> {
    if (!this.context) {
      throw new ActionError("Context not set", "CONTEXT_NOT_SET", 500);
    }
    const { appId, userId } = this.context;
    if (!userId) {
      // If no userId, maybe we should assume unauthorized? Or is it optional?
      // For write actions, userId should probably be present.
      // But the context interface says userId?: string
      throw new ActionError("User ID not found in context", "UNAUTHORIZED", 401);
    }
    const { data: userAccess, error } = await safeQuery(() =>
      db
        .select()
        .from(schema.appUsers)
        .where(
          and(eq(schema.appUsers.app, appId), eq(schema.appUsers.user, userId), eq(schema.appUsers.status, "active")),
        ),
    );

    if (error) {
      throw new ActionError("Error checking user access", "ERROR_CHECKING_USER_ACCESS", 500, error);
    }

    if (!userAccess || userAccess.length === 0) {
      throw new ActionError("User does not have access to this app", "UNAUTHORIZED", 401);
    }

    return userAccess[0];
  }
}
