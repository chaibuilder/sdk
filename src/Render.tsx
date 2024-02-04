import { RenderChaiBlocks } from "./render/index.ts";
import "./chai-blocks";
import "./data-providers/data.ts";

export function Render() {
  return (
    <RenderChaiBlocks
      externalData={{ blogs: { heading: "This is external data" } }}
      classPrefix={"c-"}
      blocks={[
        {
          _id: "a",
          _bindings: { content: "blogs.heading" },
          _type: "Heading",
          level: "h2",
          content: "This is static content",
        },
      ]}
    />
  );
}
