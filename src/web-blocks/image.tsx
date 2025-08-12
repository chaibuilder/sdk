import EmptySlot from "@/web-blocks/empty-slot";
import { ChaiBlockComponentProps, ChaiStyles, registerChaiBlockSchema, StylesProp } from "@chaibuilder/runtime";
import { ImageIcon } from "@radix-ui/react-icons";
import { isEmpty } from "lodash-es";

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
        default: "https://fakeimg.pl/400x200?text=Choose&font=bebas",
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
  i18nProps: ["alt", "image", "imageId", "mobileImage", "mobileImageId"],
};

export { ImageBlock as Component, Config };
