import {
  hasStructureErrorsAtom,
  hasStructureWarningsAtom,
  structureErrorsAtom,
  structureValidationValidAtom,
} from "@/core/atoms/blocks";
import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { convertToBlocksTree } from "../functions/blocks-fn";
import { useBlocksStore } from "./hooks";
import { StructureError, StructureRule, defaultRuleRegistry } from "./structure-rules";

export interface UseCheckStructureOptions {
  enableAccessibilityRules?: boolean;
  customRules?: StructureRule[];
}

export const useCheckStructure = (options: UseCheckStructureOptions = {}) => {
  const [blocks] = useBlocksStore();
  const [errors, setErrors] = useState<StructureError[]>([]);
  const [isValid, setIsValid] = useState(true);

  // Atoms to update
  const setStructureErrors = useSetAtom(structureErrorsAtom);
  const setStructureValidationValid = useSetAtom(structureValidationValidAtom);
  const setHasStructureErrors = useSetAtom(hasStructureErrorsAtom);
  const setHasStructureWarnings = useSetAtom(hasStructureWarningsAtom);

  useEffect(() => {
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

    // Update local state
    setErrors(allErrors);
    setIsValid(isStructureValid);

    // Update atoms
    setStructureErrors(allErrors);
    setStructureValidationValid(isStructureValid);
    setHasStructureErrors(hasErrors);
    setHasStructureWarnings(hasWarnings);

    if (allErrors.length > 0) {
      console.log("Structure validation found issues:", allErrors);
    }
  }, [
    blocks,
    options.enableAccessibilityRules,
    options.customRules,
    setStructureErrors,
    setStructureValidationValid,
    setHasStructureErrors,
    setHasStructureWarnings,
  ]);

  return {
    isValid,
    errors,
    hasErrors: errors.filter((e) => e.severity === "error").length > 0,
    hasWarnings: errors.filter((e) => e.severity === "warning").length > 0,
    errorCount: errors.filter((e) => e.severity === "error").length,
    warningCount: errors.filter((e) => e.severity === "warning").length,
    // Helper to get errors for a specific block
    getBlockErrors: (blockId: string) => errors.filter((e) => e.blockId === blockId),
    // Helper to get errors by severity
    getErrorsBySeverity: (severity: "error" | "warning") => errors.filter((e) => e.severity === severity),
    // Helper to get all error messages
    getErrorMessages: () => errors.map((e) => e.message),
    // Helper to get all error messages by severity
    getErrorMessagesBySeverity: (severity: "error" | "warning") =>
      errors.filter((e) => e.severity === severity).map((e) => e.message),
  };
};

// Export the rule registry for external use
export { defaultRuleRegistry } from "./structure-rules";
export type { StructureError, StructureRule } from "./structure-rules";
