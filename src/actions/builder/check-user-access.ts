import { z } from "zod";
import { ChaiBaseAction } from "./base-action";

export class CheckUserAccessAction extends ChaiBaseAction<any, { access: boolean }> {
  protected getValidationSchema() {
    return z.any();
  }

  async execute(data: any): Promise<{ access: boolean }> {
    await this.verifyAccess();
    return { access: true };
  }
}
