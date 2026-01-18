import { z } from "zod";
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

  async execute(): Promise<GetRoleAndPermissionsActionResponse> {
    return {
      role: "admin",
      permissions: null,
    };
  }
}
