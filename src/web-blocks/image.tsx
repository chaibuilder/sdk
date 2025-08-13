import EmptySlot from "@/web-blocks/empty-slot";
import { ChaiBlockComponentProps, ChaiStyles, registerChaiBlockSchema, StylesProp } from "@chaibuilder/runtime";
import { ImageIcon } from "@radix-ui/react-icons";
import { isEmpty } from "lodash-es";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2Q1ZDdkYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIFBsYWNlaG9sZGVyPC90ZXh0Pjwvc3ZnPg==";

export type ImageBlockProps = {
  styles: ChaiStyles;
  image: string;
  alt: string;
  width: number;
  height: number;
  lazyLoading: boolean;
  mobileImage: string;
  assetId?: string;
};

const ImageBlock = (props: ChaiBlockComponentProps<ImageBlockProps>) => {
  const { blockProps, image, mobileImage, styles, alt, height, width, lazyLoading } = props;

  if (isEmpty(image)) return <EmptySlot className="h-36" />;

  return (
    <picture>
      {mobileImage && <source srcSet={mobileImage} media="(max-width: 480px)" />}
      <img
        {...blockProps}
        {...styles}
        src={image}
        alt={alt}
        loading={lazyLoading ? "lazy" : "eager"}
        width={width}
        height={height}
      />
    </picture>
  );
};

const Config = {
  type: "Image",
  description: "A image component",
  label: "Image",
  category: "core",
  icon: ImageIcon,
  group: "media",
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp(""),
      image: {
        type: "string",
        title: "Image",
        default: PLACEHOLDER_IMAGE,
        ui: { "ui:widget": "image" },
      },
      alt: {
        type: "string",
        title: "Alt text",
        default: "",
        ui: { "ui:placeholder": "Enter  alt text" },
      },
      lazyLoading: {
        type: "boolean",
        title: "Lazy Load",
        default: true,
      },
      width: {
        type: "number",
        title: "Width",
        default: "",
        ui: { "ui:placeholder": "Enter width" },
      },
      height: {
        type: "number",
        title: "Height",
        default: "",
        ui: { "ui:placeholder": "Enter height" },
      },
      mobileImage: {
        type: "string",
        title: "Mobile Image",
        default: "",
        ui: { "ui:widget": "image" },
      },
    },
  }),
  aiProps: ["alt"],
  i18nProps: ["alt", "image", "_imageId", "mobileImage", "_mobileImageId"],
};

export { ImageBlock as Component, Config };
