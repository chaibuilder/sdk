"use server";

import { db, safeQuery, schema } from "@chaibuilder/sdk/actions";

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

    const { formData, additionalData = {} } = data;

    const formSubmission = {
      app: apiKey,
      formName: (formData.formName as string) || "contact",
      formData: formData as unknown,
      additionalData: additionalData as unknown,
      pageUrl: (additionalData.pageUrl as string) || "",
    };

    const { error } = await safeQuery(() => db.insert(schema.appFormSubmissions).values(formSubmission));

    if (error) {
      console.error("Form submission error:", error);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error("Form submission error:", error);
    return { success: false };
  }
}
