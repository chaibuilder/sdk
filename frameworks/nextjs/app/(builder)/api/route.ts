import { getSupabaseAdmin } from "@/app/supabase-admin";
import { ChaiActionsRegistry, initChaiBuilderActionHandler } from "@chaibuilder/sdk/actions";
import { SupabaseAuthActions, SupabaseStorageActions } from "@chaibuilder/sdk/actions/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.CHAIBUILDER_APP_KEY;

  if (!apiKey) {
    console.error("CHAIBUILDER_APP_KEY environment variable is not set.");
    return NextResponse.json({ error: "Server misconfiguration: CHAIBUILDER_APP_KEY is not set" }, { status: 500 });
  }
  const supabase = getSupabaseAdmin();
  ChaiActionsRegistry.registerActions(SupabaseAuthActions(supabase));
  ChaiActionsRegistry.registerActions(SupabaseStorageActions(supabase));
  try {
    // Get authorization header
    let authorization = req.headers.get("authorization") || "";
    authorization = authorization ? authorization.split(" ")[1] : "";

    // Parse request body
    const body = await req.json();

    // Supabase authentication check
    const supabaseUser = await supabase.auth.getUser(authorization);
    if (supabaseUser.error) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    const userId = supabaseUser.data.user?.id || "";

    const actionHandler = initChaiBuilderActionHandler({ apiKey, userId });
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
        headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
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
