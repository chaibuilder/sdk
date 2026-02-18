
import { PublishChangesAction } from "@chaibuilder/sdk/actions";
import { revalidatePath, revalidateTag } from "next/cache";

export class NextJsPublishChangesAction extends PublishChangesAction {
  async execute(data: any) {
    const response = await super.execute(data);
    const { tags, paths } = response;

    // Handle tags revalidation
    if (tags && tags.length > 0) {
      await Promise.all(tags.map((tag:string) => revalidateTag(tag, "max")));
    }

    // Handle paths revalidation and regeneration
    if (paths && paths.length > 0) {
      await Promise.all(paths.map((path:string) => revalidatePath(path)));

      // Trigger immediate regeneration of the pages
      const hostname = this.context?.hostname;
      if (hostname) {
        const protocol = hostname.includes("localhost") ? "http" : "https";
        const origin = `${protocol}://${hostname}`;
        
        await Promise.allSettled(
          paths.map(async (path:string) => {
            if (!path || !path.startsWith("/")) return;
            try {
              const url = `${origin}${path}`;
              await fetch(url, {
                method: "GET",
                headers: {
                  "x-isr-regeneration": "true",
                },
              });
              console.log(`Triggered regeneration for ${path}`);
            } catch (err) {
              console.error(`Failed to trigger regeneration for ${path}`, err);
            }
          })
        );
      } else {
        console.warn("Hostname not found in context. Skipping page regeneration.");
      }
    }

    return response;
  }
}
