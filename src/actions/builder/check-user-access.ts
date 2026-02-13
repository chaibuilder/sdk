import { z } from "zod";
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
}
