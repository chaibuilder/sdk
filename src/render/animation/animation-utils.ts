import { isEmpty, join, split, toNumber } from "lodash-es";

export type TAnimation = {
  type: string;
  direction: string;
  duration: number;
  delay: number;
  easing: string;
  triggerOnce: boolean;
};

export const ANIMATION_TYPES = [
  { value: "fade", label: "Fade" },
  { value: "slide", label: "Slide" },
  { value: "zoom", label: "Zoom" },
  { value: "flip", label: "Flip" },
  { value: "rotate", label: "Rotate" },
  { value: "bounce", label: "Bounce" },
];

export const EASING_OPTIONS = [
  { value: "ease-linear", label: "Linear" },
  { value: "ease-in", label: "Ease In" },
  { value: "ease-out", label: "Ease Out" },
  { value: "ease-in-out", label: "Ease In Out" },
  { value: "ease-in-back", label: "Ease In Back" },
  { value: "ease-out-back", label: "Ease Out Back" },
  { value: "ease-in-out-back", label: "Ease In Out Back" },
];

export const getDirectionOptions = (type: string) => {
  switch (type) {
    case "slide":
      return [
        { value: "up", label: "Up" },
        { value: "down", label: "Down" },
        { value: "left", label: "Left" },
        { value: "right", label: "Right" },
      ];
    case "fade":
    case "zoom":
    case "bounce":
      return [
        { value: "none", label: "Default" },
        { value: "up", label: "Up" },
        { value: "down", label: "Down" },
        { value: "left", label: "Left" },
        { value: "right", label: "Right" },
      ];
    case "flip":
      return [
        { value: "x", label: "Horizontal (X)" },
        { value: "y", label: "Vertical (Y)" },
      ];
    case "rotate":
      return [
        { value: "none", label: "Default" },
        { value: "up-left", label: "Up Left" },
        { value: "up-right", label: "Up Right" },
        { value: "down-left", label: "Down Left" },
        { value: "down-right", label: "Down Right" },
      ];
    default:
      return [{ value: "none", label: "Default" }];
  }
};

export const DEFAULT_ANIMATION = {
  delay: 10,
  duration: 500,
  triggerOnce: true,
  type: "fade",
  direction: "up",
  easing: "ease-linear",
};

export const convertToAnimationString = (animation: TAnimation): string => {
  if (isEmpty(animation)) return "";
  const { type, direction, easing, duration, delay, triggerOnce } = animation;
  return join([type, direction, easing, duration, delay, triggerOnce ? "1" : "0"], "|");
};

export const convertToAnimationObject = (animationString: string): TAnimation => {
  const [type, direction, easing, duration, delay, triggerOnce] = split(animationString, "|");
  return {
    type,
    easing,
    direction,
    delay: toNumber(delay),
    duration: toNumber(duration),
    triggerOnce: triggerOnce === "1",
  };
};

export const getAnimationClassName = (type: string, direction: string): string => {
  if (!type) return "";

  // Map type to CSS class base name (CSS uses "fade-in", "slide-in", "zoom-in", etc.)
  const typeMap: Record<string, string> = {
    fade: "fade-in",
    slide: "slide-in",
    zoom: "zoom-in",
    flip: "flip-in",
    rotate: "rotate-in",
    bounce: "bounce-in",
  };

  const baseType = typeMap[type] || type;

  if (!direction || direction === "none") {
    return `chai-reveal--${baseType}`;
  }
  return `chai-reveal--${baseType}-${direction}`;
};

export const applyAnimationStyles = (element: Element, animation: TAnimation): void => {
  const { type, direction, easing, duration, delay } = animation;

  element.classList.add("chai-reveal");

  const animationClass = getAnimationClassName(type, direction);
  if (animationClass) {
    element.classList.add(animationClass);
  }

  if (easing) {
    element.classList.add(`chai-reveal--${easing}`);
  }

  const el = element as HTMLElement;
  if (duration) {
    // Duration is stored in ms, convert to seconds for CSS
    el.style.setProperty("--chai-animation-duration", `${duration / 1000}s`);
  }
  if (delay) {
    // Delay is stored in ms, convert to seconds for CSS
    el.style.setProperty("--chai-animation-delay", `${delay / 1000}s`);
  }

  el.setAttribute("data-animate", "true");
};
