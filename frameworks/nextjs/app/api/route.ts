import { ChaiActionsRegistry, initChaiBuilderActionHandler } from "@chaibuilder/sdk/server";
import { SupabaseAuthActions, SupabaseStorageActions } from "@chaibuilder/sdk/supabase-actions";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "../supabase";
import { getSupabaseAdmin } from "../supabase-admin";

const supabase = getSupabaseAdmin();
ChaiActionsRegistry.registerActions(SupabaseAuthActions(supabase));
ChaiActionsRegistry.registerActions(SupabaseStorageActions(supabase));

export async function POST(req: NextRequest) {
  const apiKey = process.env.CHAIBUILDER_API_KEY;
  
  if (!apiKey) {
    console.error("CHAIBUILDER_API_KEY environment variable is not set.");
    return NextResponse.json(
      { error: "Server misconfiguration: CHAIBUILDER_API_KEY is not set" },
      { status: 500 }
    );
  }
  try {
    // Get authorization header
    const authorization = req.headers.get("authorization") || "";
    let authTokenOrUserId: string = "";
    authTokenOrUserId = authorization ? authorization.split(" ")[1] : "";

    // Parse request body
    const body = await req.json();

    // Supabase authentication check
    const supabase = getSupabaseClient();
    const supabaseUser = await supabase.auth.getUser(authTokenOrUserId);
    if (supabaseUser.error) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    authTokenOrUserId = supabaseUser.data.user?.id || "";

    const actionHandler = initChaiBuilderActionHandler({
      apiKey,
      userId: authTokenOrUserId,
    });
    const response = await actionHandler(body);

    // Handle streaming responses
    if (response?._streamingResponse && response?._streamResult) {
      const result = response._streamResult;

      if (!result?.textStream) {
        return NextResponse.json({ error: "No streaming response available" }, { status: 500 });
      }

      // Create a ReadableStream for streaming response
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          try {
            for await (const chunk of result.textStream) {
              if (chunk) {
                controller.enqueue(encoder.encode(chunk));
              }
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error handling POST request", {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
