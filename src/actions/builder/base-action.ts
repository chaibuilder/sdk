import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db, safeQuery, schema } from "../db";
import { ActionError } from "./action-error";
import { ChaiAction, ChaiActionContext } from "./chai-action-interface";

/**
 * Base Action Class
 * Provides common functionality for all action handlers
 */
export abstract class ChaiBaseAction<T = any, K = any> implements ChaiAction<T, K> {
  protected context: ChaiActionContext | null = null;
  /**
   * Abstract method to get the validation schema for the action data
   * Each action must implement this to define its own validation rules
   */
  protected abstract getValidationSchema(): z.ZodType<T>;

  /**
   * Validate the action data using the schema provided by getValidationSchema
   * @param data The data to validate
   * @returns true if the data is valid, false otherwise
   */
  validate(data: T): boolean {
    if (!data) return true;
    try {
      const schema = this.getValidationSchema();
      schema.parse(data);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get validation errors for the action data
   * This can be useful for debugging or providing more detailed error messages
   * @param data The data to validate
   * @returns An array of validation errors or null if the data is valid
   */
  getValidationErrors(data: T): string | null {
    if (!data) return null;
    try {
      const schema = this.getValidationSchema();
      schema.parse(data);
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map((err: any) => `${err.path.join(".")}: ${err.message}`).join(", ");
        return errorMessages;
      }
      return null;
    }
  }

  /**
   * Set the action context
   * @param context The context to set
   */
  setContext(context: ChaiActionContext): void {
    this.context = context;
  }

  /**
   * Abstract method to execute the action
   * Each action must implement this to define its own business logic
   */
  abstract execute(data: T): Promise<any>;

  /**
   * Verify if the user has access to the app
   * @throws ActionError if the user does not have access
   */
  /**
   * Get user access data from the database
   * @returns The user access record
   * @throws ActionError if access check fails
   */
  protected async getUserAccess(): Promise<any> {
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

  protected async verifyAccess(): Promise<void> {
    await this.getUserAccess();
  }

  /**
   * Helper method to handle common errors in actions
   * @param error The error to handle
   * @throws ActionError with appropriate message and code
   */
  protected handleError(error: unknown): never {
    if (error instanceof ActionError) {
      // Re-throw ActionError as is
      throw error;
    } else if (error instanceof z.ZodError) {
      // Convert Zod validation errors to ActionError
      const errorMessage = error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      throw new ActionError(`Validation failed: ${errorMessage}`, "VALIDATION_ERROR");
    } else {
      // Convert other errors to ActionError
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new ActionError(message, "ACTION_ERROR");
    }
  }
}
