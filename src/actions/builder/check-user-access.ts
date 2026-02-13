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
    await this.verifyAccess();
    return {
      access: true,
      role: "admin",
      permissions: null,
    };
  }
}
