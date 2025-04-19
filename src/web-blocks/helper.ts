import { cn } from "@/core/functions/Functions";

export const addForcedClasses = (styles, ...classes: string[]) => {
  // get all the classes from the blockStateClasses if the value is true
  return {
    ...styles,
    className: cn(styles.className, ...classes),
  };
};
