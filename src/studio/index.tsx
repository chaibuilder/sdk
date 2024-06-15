import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ChaiBuilderCmp } from "./components/ChaiBuilderCmp.tsx";
import React, { useEffect } from "react";
import { FullPageLoading } from "./components/FullPageLoading.tsx";
import { useVerify } from "./mutations/useAuth.ts";
import { Toaster } from "sonner";
import { LoginScreen } from "./components/LoginScreen.tsx";
import { ChaiBuilderEditorProps } from "../core/types/chaiBuilderEditorProps.ts";

const ChaiBuilderStudioComponent = (props: ChaiBuilderStudioProps) => {
  const { data, isLoading } = useVerify();
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.setQueryData(["apiBaseUrl"], props.apiBaseUrl || "/api/chaibuilder");
  }, [props.apiBaseUrl, queryClient]);

  if (isLoading) return <FullPageLoading />;
  if (!data?.valid) return <LoginScreen logo={props.logo} />;
  return <ChaiBuilderCmp {...props} />;
};

const queryClient = new QueryClient();

export type ChaiBuilderStudioProps = {
  apiBaseUrl?: string;
  logo?: React.FC<any> | React.LazyExoticComponent<any>;
} & Omit<
  ChaiBuilderEditorProps,
  "topBarComponents" | "editable" | "onSaveBrandingOptions" | "onSaveBlocks" | "blocks" | "brandingOptions"
>;

export const ChaiBuilderStudio = (props: ChaiBuilderStudioProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster richColors />
      <ChaiBuilderStudioComponent {...props} />
    </QueryClientProvider>
  );
};
