"use server";

import { db, safeQuery, schema, initChaiBuilderActionHandler } from "@chaibuilder/sdk/actions";
import { z } from "zod";

type FormSubmitActionData = {
  formData: Record<string, string | boolean | number | null>;
  additionalData?: Record<string, string | boolean | number | null>;
};

type FormSubmitActionResponse = {
  success: boolean;
};

export class FormSubmitAction {
  private context: { appId?: string; userId?: string } | null = null;

  validate(data: FormSubmitActionData): boolean {
    try {
      const validationSchema = z.object({
        formData: z.record(z.string(), z.union([z.string(), z.boolean(), z.number(), z.null()])),
        additionalData: z.record(z.string(), z.union([z.string(), z.boolean(), z.number(), z.null()])).optional(),
      });
      validationSchema.parse(data);
      return true;
    } catch {
      return false;
    }
  }

  setContext(context: { appId?: string; userId?: string }): void {
    this.context = context;
  }

  async execute(data: FormSubmitActionData): Promise<FormSubmitActionResponse> {
    try {
      const { formData, additionalData = {} } = data;
      const appId = this.context?.appId;

      if (!appId) {
        console.error("No appId in context");
        return { success: false };
      }

      const formSubmission = {
        app: appId,
        formName: (formData.formName as string) || "contact",
        formData: formData as unknown,
        additionalData: additionalData as unknown,
        pageUrl: (additionalData.pageUrl as string) || "",
      };
      await safeQuery(db.insert(schema.appFormSubmissions).values(formSubmission));

      return { success: true };
    } catch (error) {
      console.error("Form submission error:", error);
      return { success: false };
    }
  }
}

interface FormSubmissionData {
  formData: Record<string, string | boolean | number | null>;
  additionalData: Record<string, string | boolean | number | null>;
}

export async function formSubmit(data: FormSubmissionData) {
  try {
    const apiKey = process.env.CHAIBUILDER_APP_KEY;

    if (!apiKey) {
      console.error("CHAIBUILDER_APP_KEY not set");
      return { success: false };
    }

    const actionHandler = initChaiBuilderActionHandler({ apiKey, userId: "" });

    const response = await actionHandler({
      action: "FORM_SUBMIT",
      data,
    });

    if (response.error) {
      console.error("Form submission error:", response.error);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error("Form submission error:", error);
    return { success: false };
  }
}
//TODO: Perform Direct Issue 