import {
  ChaiBlockComponentProps,
  ChaiStyles,
  closestBlockProp,
  registerChaiBlock,
  registerChaiBlockSchema,
  runtimeProp,
  StylesProp,
} from "@chaibuilder/runtime";
import {
  AlignHorizontalJustifyStart,
  AppWindowIcon,
  PanelRightClose,
  PanelRightOpen,
  UnfoldHorizontal,
} from "lucide-react";

export type SliderProps = {
  children: React.ReactNode;
  styles: ChaiStyles;
  slider: {
    currentSlide: number | null;
    autoplay: boolean;
    autoplayInterval: number;
    showSlideButton: boolean;
    showSlideNavbar: boolean;
  };
};

const alpineAttrs = (key: string, option?: any) => {
  const attrs = {
    slider: {
      "x-data": `{
        currentSlide: 0,
        totalSlides: ${option?.totalSlides || 0},
        autoplay: ${Boolean(option?.autoplay)},
        autoplayInterval: null,
        init() {
          if (this.autoplay) {
            this.startAutoplay();
          }
        },
        startAutoplay() {
          this.autoplayInterval = setInterval(() => {
            this.nextSlide();
          }, ${isNaN(option?.autoplayInterval) ? 3000 : option?.autoplayInterval * 1000});
        },
        stopAutoplay() {
          clearInterval(this.autoplayInterval);
        },
        nextSlide() {
          this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        },
        prevSlide() {
          this.currentSlide = (this.currentSlide - 1 + this.totalSlides) %this.totalSlides;
        },
        updateCurrentSlide(slide) {
          this.currentSlide = slide;
        },
      }`,
    },
    slides: {
      ":style": "'transform: translateX(-' + currentSlide * 100 + '%)'",
    },
    prevButton: {
      "x-on:click": "stopAutoplay(); prevSlide();",
    },
    nextButton: {
      "x-on:click": "stopAutoplay(); nextSlide();",
    },
    sliderNav: {
      ":class": `currentSlide === ${option?.slide} ? '${option?.activeDotClassName}' : '${option?.className}'`,
      "x-on:click": `stopAutoplay(); updateCurrentSlide(${option?.slide});`,
    },
  };
  return attrs[key] || {};
};

const SlidePreviousButton = (props: any) => {
  const { blockProps, styles, children, slider } = props;

  if (!slider?.showSlideButton && typeof slider?.showSlideButton === "boolean") return null;

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
      styles: StylesProp(
        "h-max w-max absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center p-2 cursor-pointer",
      ),
      slider: closestBlockProp("Slider", "slider"),
    },
  }),
});

const SlideNextButton = (props: any) => {
  const { blockProps, styles, children, slider } = props;

  if (!slider?.showSlideButton && typeof slider?.showSlideButton === "boolean") return null;

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
      styles: StylesProp(
        "h-max w-max absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center p-2 cursor-pointer",
      ),
      slider: closestBlockProp("Slider", "slider"),
    },
  }),
});

const Slides = (props: any) => {
  const { blockProps, styles, children = null, inBuilder, slider } = props;

  if (inBuilder) {
    const blocks = props?.children?.props?.allBlocks || props?.children?.props?.blocks || [];
    const currentSlide = slider?.currentSlide;
    const activeIndex = blocks
      ?.filter((block) => block?._parent === props?._id)
      ?.findIndex((block) => block?._id === currentSlide);

    return (
      <div {...blockProps} {...styles} style={{ transform: `translateX(-${Math.max(0, activeIndex) * 100}%)` }}>
        {children || (
          <div className="h-full p-2">
            <div className="h-full border-2 border-dashed" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div {...blockProps} {...styles} {...alpineAttrs("slides")}>
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
      slider: closestBlockProp("Slider", "slider"),
      styles: StylesProp("h-full flex transition-transform duration-500 ease-in-out"),
    },
  }),
});

const Slide = (props: any) => {
  const { blockProps, styles, children = null } = props;

  return (
    <div {...blockProps} {...styles}>
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
      styles: StylesProp("min-w-full h-full"),
    },
  }),
});

const SliderNav = (props: any) => {
  const { blockProps, styles, dotStyles, activeDotStyles, slider, inBuilder, children } = props;

  if (!slider?.showSlideNavbar && typeof slider?.showSlideNavbar === "boolean") return null;

  const blocks = props?.children?.props?.allBlocks || props?.children?.props?.blocks || [];
  const thisBlock = blocks?.find((block) => block?._id === props?._id);
  const slidesBlock = blocks?.find((block) => block?._parent === thisBlock?._parent && block?._type === "Slides");
  const totalSlides = blocks?.filter((block) => block?._parent === slidesBlock?._id);

  if (inBuilder) {
    return (
      <div {...blockProps} {...styles}>
        {totalSlides?.map((slide: any, index: number) => (
          <div
            {...dotStyles}
            {...(!slider?.currentSlide
              ? index === 0
                ? activeDotStyles
                : {}
              : slide?._id === slider?.currentSlide
                ? activeDotStyles
                : {})}>
            {children}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div {...blockProps} {...styles}>
      {totalSlides?.map((slide: any, index: number) => (
        <div
          key={slide?._id}
          {...alpineAttrs("sliderNav", {
            slide: index,
            className: dotStyles?.className,
            activeDotClassName: activeDotStyles?.className ?? "",
          })}
        />
      ))}
    </div>
  );
};

registerChaiBlock(SliderNav, {
  type: "SliderNav",
  label: "Slider Navigation",
  group: "basic",
  category: "core",
  icon: PanelRightOpen,
  canDelete: () => false,
  canAcceptBlock: () => false,
  canBeNested: (type: string) => type === "Slider",
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp("w-full absolute left-0 bottom-0 flex items-center justify-center gap-x-2 p-2"),
      dotStyles: StylesProp("w-4 h-4 border border-gray-500 rounded-full cursor-pointer"),
      activeDotStyles: StylesProp("w-4 h-4 rounded-full bg-blue-500"),
      slider: closestBlockProp("Slider", "slider"),
    },
  }),
});

const SliderNavItem = () => {
  return null;
};

registerChaiBlock(SliderNavItem, {
  type: "SliderNavItem",
  label: "Slider Nav Item",
  group: "basic",
  category: "core",
  hidden: true,
  icon: PanelRightOpen,
  canDelete: () => false,
  canDuplicate: () => false,
  canAcceptBlock: () => false,
  canBeNested: (type: string) => type === "SliderNav",
  ...registerChaiBlockSchema({
    properties: {},
  }),
});

const Component = (props: ChaiBlockComponentProps<SliderProps>) => {
  const { blockProps, styles, children = null } = props;

  // @ts-ignore
  const blocks = props?.children?.props?.allBlocks || props?.children?.props?.blocks || [];
  const slidesBlock = blocks?.find((block) => block?._parent === props?._id && block?._type === "Slides");
  const totalSlides = blocks?.filter((block) => block?._parent === slidesBlock?._id)?.length || 0;

  const slideProps = {
    totalSlides,
    ...(typeof props.slider === "object" ? props.slider : {}),
  };

  return (
    <div {...blockProps} {...styles} {...alpineAttrs("slider", slideProps)}>
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
      _type: "Slider",
      _id: "slider",
    },
    {
      _type: "Slides",
      _id: "slider-slides",
      _parent: "slider",
    },
    {
      _type: "Slide",
      _id: "slider-slides-slide-1",
      _parent: "slider-slides",
    },
    {
      _type: "Slide",
      _id: "slider-slides-slide-2",
      _parent: "slider-slides",
    },
    {
      _type: "Slide",
      _id: "slider-slides-slide-3",
      _parent: "slider-slides",
    },
    {
      _type: "SlidePreviousButton",
      _parent: "slider",
      _id: "slider-left-arrow",
    },
    {
      _type: "Icon",
      _id: "slider-left-arrow-content",
      icon: '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 320 512"><path d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z"/></svg>',
      _parent: "slider-left-arrow",
    },
    {
      _type: "SlideNextButton",
      _parent: "slider",
      _id: "slider-right-arrow",
    },
    {
      _type: "Icon",
      _id: "slider-right-arrow-content",
      icon: '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 320 512"><path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"/></svg>',
      _parent: "slider-right-arrow",
    },
    {
      _type: "SliderNav",
      _parent: "slider",
      _id: "slider-nav",
    },
    {
      _type: "SliderNavItem",
      _parent: "slider-nav",
      _id: "slider-nav-item",
    },
  ],
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp("w-full h-[60vh] relative overflow-x-hidden"),
      slider: runtimeProp({
        type: "object",
        properties: {},
        default: {
          currentSlide: null,
          autoplay: false,
          autoplayInterval: 2,
          showSlideButton: true,
          showSlideNavbar: true,
        },
        ui: {
          "ui:field": "slider",
        },
      }),
    },
  }),
};

export { Component, Config };
