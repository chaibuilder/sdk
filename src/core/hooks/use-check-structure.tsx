import {
  hasStructureErrorsAtom,
  hasStructureWarningsAtom,
  structureErrorsAtom,
  structureValidationValidAtom,
} from "@/core/atoms/blocks";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { convertToBlocksTree } from "../functions/blocks-fn";
import { useBlocksStore, useBuilderProp } from "./hooks";
import { StructureError, StructureRule, defaultRuleRegistry } from "./structure-rules";

export interface UseCheckStructureOptions {
  enableAccessibilityRules?: boolean;
  customRules?: StructureRule[];
}

export const useCheckStructure = (options: UseCheckStructureOptions = {}) => {
  const [blocks] = useBlocksStore();
  const validateStructure = useBuilderProp("flags.validateStructure", true);
  // Atoms to update
  const setStructureErrors = useSetAtom(structureErrorsAtom);
  const setStructureValidationValid = useSetAtom(structureValidationValidAtom);
  const setHasStructureErrors = useSetAtom(hasStructureErrorsAtom);
  const setHasStructureWarnings = useSetAtom(hasStructureWarningsAtom);

  useEffect(() => {
    if (!validateStructure) return;

    const tree = convertToBlocksTree(blocks);
    const allErrors: StructureError[] = [];

    // Get rules to apply
    let rulesToApply = defaultRuleRegistry.getRules();

    // Enable accessibility rules if requested
    if (options.enableAccessibilityRules) {
      defaultRuleRegistry.enableAccessibilityRules();
      rulesToApply = defaultRuleRegistry.getRules();
    }

    // Add custom rules if provided
    if (options.customRules && options.customRules.length > 0) {
      rulesToApply.push(...options.customRules);
    }

    // Run all structure validation rules
    rulesToApply.forEach((rule) => {
      try {
        const ruleErrors = rule.validate(blocks, tree);
        allErrors.push(...ruleErrors);
      } catch (error) {
        console.error(`Error running structure rule "${rule.name}":`, error);
      }
    });

    const hasErrors = allErrors.filter((e) => e.severity === "error").length > 0;
    const hasWarnings = allErrors.filter((e) => e.severity === "warning").length > 0;
    const isStructureValid = !hasErrors;

    // Update atoms
    setStructureErrors(allErrors);
    setStructureValidationValid(isStructureValid);
    setHasStructureErrors(hasErrors);
    setHasStructureWarnings(hasWarnings);
  }, [
    validateStructure,
    blocks,
    options.enableAccessibilityRules,
    options.customRules,
    setStructureErrors,
    setStructureValidationValid,
    setHasStructureErrors,
    setHasStructureWarnings,
  ]);

  return null;
};

// Export the rule registry for external use
export { defaultRuleRegistry } from "./structure-rules";
export type { StructureError, StructureRule } from "./structure-rules";
