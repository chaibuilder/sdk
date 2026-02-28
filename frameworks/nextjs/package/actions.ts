import { initChaiBuilderActionHandler, ChaiActionsRegistry, PublishChangesAction } from "@chaibuilder/sdk/actions";
import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export class NextJsPublishChangesAction extends PublishChangesAction {
    async execute(data: any) {
        const response = await super.execute(data);
        const { tags, paths } = response;

        // Handle tags revalidation
        if (tags && tags.length > 0) {
            await Promise.all(tags.map((tag: string) => revalidateTag(tag, "max")));
        }

        // Handle paths revalidation
        if (paths && paths.length > 0) {
            await Promise.all(paths.map((path: string) => revalidatePath(path)));
        }

        return response;
    }
}

export * from "@chaibuilder/sdk/actions";
export function initChaiBuilderNextJSActionHandler({ apiKey, userId }: { apiKey: string, userId: string }) {
    (ChaiActionsRegistry as any).register("PUBLISH_CHANGES", new NextJsPublishChangesAction());
    return async function (body: any) {
        const actionHandler = initChaiBuilderActionHandler({ apiKey, userId })
        const response: any = await actionHandler(body)
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

        return NextResponse.json(response, { status: response.status || 200 });
    }
}