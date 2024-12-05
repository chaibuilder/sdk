import {
  AlignHorizontalJustifyStart,
  AppWindowIcon,
  PanelRightClose,
  PanelRightOpen,
  UnfoldHorizontal,
} from "lucide-react";
import {
  ChaiBlockComponentProps,
  ChaiStyles,
  closestBlockProp,
  registerChaiBlock,
  registerChaiBlockSchema,
  runtimeProp,
  StylesProp,
} from "@chaibuilder/runtime";

export type SliderProps = {
  styles: ChaiStyles;
};

const alpineAttrs = (key: string, option?: any) => {
  const attrs = {
    slider: { "x-data": "{ currentSlide: 1, autoplay: false, autoplayInterval: 2 }" },
    slide: { "x-show": `currentSlide === ${option?.slide}` },
    prevButton: { "x-on:click": "currentSlide = currentSlide - 1" },
    nextButton: { "x-on:click": "currentSlide = currentSlide + 1" },
  };
  return attrs[key] || {};
};

const SlidePreviousButton = (props: any) => {
  const { blockProps, styles, children } = props;
  return (
    <div {...blockProps} {...styles} {...alpineAttrs("prevButton")}>
      {children}
    </div>
  );
};

registerChaiBlock(SlidePreviousButton, {
  type: "SlidePreviousButton",
  label: "Slide Previous",
  group: "basic",
  category: "core",
  icon: PanelRightOpen,
  canDelete: () => false,
  canAcceptBlock: () => true,
  canBeNested: (type: string) => type === "Slider",
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp(""),
    },
  }),
});

const SlideNextButton = (props: any) => {
  const { blockProps, styles, children } = props;
  return (
    <div {...blockProps} {...styles} {...alpineAttrs("nextButton")}>
      {children}
    </div>
  );
};

registerChaiBlock(SlideNextButton, {
  type: "SlideNextButton",
  label: "Slide Next",
  group: "basic",
  category: "core",
  icon: PanelRightClose,
  canDelete: () => false,
  canAcceptBlock: () => true,
  canBeNested: (type: string) => type === "Slider",
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp(""),
    },
  }),
});

const Slides = (props: any) => {
  const { blockProps, styles, children = null } = props;

  return (
    <div {...blockProps} {...styles}>
      {children || (
        <div className="h-full p-2">
          <div className="h-full border-2 border-dashed" />
        </div>
      )}
    </div>
  );
};

registerChaiBlock(Slides, {
  type: "Slides",
  label: "Slides",
  group: "basic",
  category: "core",
  icon: AlignHorizontalJustifyStart,
  canDelete: () => false,
  canAcceptBlock: (type: string) => type === "Slide",
  canBeNested: (type: string) => type === "Slider",
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp(""),
    },
  }),
});

const Slide = (props: any) => {
  const { blockProps, styles, children = null, inBuilder } = props;
  console.log("## styles", styles);

  if (inBuilder) {
    const thisSlide = props?._id;
    let currentSlide = props?.slider?.currentSlide;
    if (!currentSlide && props?.index === 0) currentSlide = thisSlide;
    if (currentSlide === thisSlide) {
      return (
        <div {...blockProps} {...styles}>
          {children || (
            <div className="flex h-full flex-grow items-center justify-center">Slide {props?.index + 1}</div>
          )}
        </div>
      );
    }
    return null;
  }

  return (
    <div {...blockProps} {...alpineAttrs("slide", { slide: props.index })} {...styles}>
      {children || <div className="flex h-full min-w-full items-center justify-center">Slide {props?.index + 1}</div>}
    </div>
  );
};

registerChaiBlock(Slide, {
  type: "Slide",
  label: "Slide",
  group: "basic",
  category: "core",
  icon: AppWindowIcon,
  canDelete: () => true,
  canAcceptBlock: () => true,
  canBeNested: (type: string) => type === "Slides",
  ...registerChaiBlockSchema({
    properties: {
      slider: closestBlockProp("Slider", "slider"),
      styles: StylesProp("w-full h-full flex"),
    },
  }),
});

const Component = (props: ChaiBlockComponentProps<SliderProps>) => {
  const { blockProps, styles, children = null } = props;

  return (
    <div {...blockProps} {...styles} {...alpineAttrs("slider")}>
      {children || (
        <div className="h-[60vh] p-2">
          <div className="h-full border-2 border-dashed" />
        </div>
      )}
    </div>
  );
};

const Config = {
  type: "Slider",
  label: "Slider",
  category: "core",
  icon: UnfoldHorizontal,
  group: "basic",
  wrapper: true,
  blocks: () => [
    {
      styles: "#styles:,h-[60vh] relative",
      _type: "Slider",
      _id: "slider",
    },
    {
      styles: "#styles:,h-full w-full flex items-center",
      _type: "Slides",
      _id: "slider-slides",
      _parent: "slider",
    },
    {
      styles: "#styles:,w-full h-full",
      _type: "Slide",
      _id: "slider-slides-slide-1",
      _parent: "slider-slides",
    },
    {
      styles: "#styles:,w-full h-full",
      _type: "Slide",
      _id: "slider-slides-slide-2",
      _parent: "slider-slides",
    },
    {
      styles: "#styles:,w-full h-full",
      _type: "Slide",
      _id: "slider-slides-slide-3",
      _parent: "slider-slides",
    },
    {
      styles: "#styles:,h-max w-max absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center p-2",
      _type: "SlidePreviousButton",
      _parent: "slider",
      _id: "slider-left-arrow",
    },
    {
      _type: "Icon",
      _id: "slider-left-arrow-content",
      styles: "#styles:,text-black cursor-pointer",
      icon: '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 320 512"><path d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z"/></svg>',
      _parent: "slider-left-arrow",
    },
    {
      styles: "#styles:,h-max w-max absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center p-2",
      _type: "SlideNextButton",
      _parent: "slider",
      _id: "slider-right-arrow",
    },
    {
      _type: "Icon",
      _id: "slider-right-arrow-content",
      styles: "#styles:,text-black cursor-pointer",
      icon: '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 320 512"><path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"/></svg>',
      _parent: "slider-right-arrow",
    },
  ],
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp("w-full"),
      slider: runtimeProp({
        type: "object",
        properties: {},
        default: {
          currentSlide: null,
          autoplay: false,
          autoplayInterval: 2,
        },
        ui: {
          "ui:field": "slider",
        },
      }),
    },
  }),
};

export { Component, Config };
