"use server";

export type ClientSettings = {
  logo: string;
  favicon: string;
  name: string;
  feedbackSubmissions: string;
  loginProviders: string[];
  loginHtml: string;
  features: Record<string, any>;
  theme: string;
  paymentConfig: {
    token: string;
    provider: string;
    environment: "sandbox" | "live";
    plans: Array<Array<{ id: string; period: "monthly" | "yearly" }>>;
  };
} & Record<string, any>;
