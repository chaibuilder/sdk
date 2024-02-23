import { RenderChaiBlocks } from "./render";

function Preview() {
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

export default Preview;
