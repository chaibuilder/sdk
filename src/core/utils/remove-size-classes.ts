import { STYLES_KEY } from "@/core/constants/STRINGS";
import { getSplitChaiClasses } from "@/hooks/get-split-classes";

/**
 * Removes w-full and h-full classes from a styles string when dimensions are provided.
 * This is useful for image blocks where default styles include w-full/h-full,
 * but should be removed when explicit width/height dimensions are set.
 *
 * @param styles - The styles string in Chai format (e.g., "#styles:base-classes,custom-classes")
 * @param width - Whether a width dimension is provided (truthy value removes w-full)
 * @param height - Whether a height dimension is provided (truthy value removes h-full)
 * @returns The modified styles string with w-full/h-full removed as appropriate
 */
export function removeSizeClasses(styles: string, width?: number, height?: number): string {
  if (!styles) return styles;

  const { baseClasses, classes } = getSplitChaiClasses(styles);

  const removeClasses = (str: string) =>
    str
      .split(" ")
      .filter((cls: string) => cls && !(width && cls === "w-full") && !(height && cls === "h-full"))
      .join(" ");

  const newBaseClasses = removeClasses(baseClasses);
  const newClasses = removeClasses(classes);

  return `${STYLES_KEY}${newBaseClasses},${newClasses}`;
}
