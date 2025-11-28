import { ChaiBlock } from "@/types/chai-block";
import React from "react";
import { defaultRuleRegistry, StructureRule, useCheckStructure } from "./use-check-structure";

// Example 1: Basic usage
export const BasicStructureCheck = () => {
  const { isValid, errors, hasErrors, hasWarnings, errorCount, warningCount } = useCheckStructure();

  return (
    <div>
      <h3>Structure Validation</h3>
      <p>Status: {isValid ? "✅ Valid" : "❌ Invalid"}</p>
      {hasErrors && <p>Errors: {errorCount}</p>}
      {hasWarnings && <p>Warnings: {warningCount}</p>}

      {errors.length > 0 && (
        <ul>
          {errors.map((error) => (
            <li key={error.id} style={{ color: error.severity === "error" ? "red" : "orange" }}>
              {error.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Example 2: With accessibility rules enabled
export const StructureCheckWithAccessibility = () => {
  const { isValid, getErrorMessagesBySeverity } = useCheckStructure({
    enableAccessibilityRules: true,
  });

  const errorMessages = getErrorMessagesBySeverity("error");
  const warningMessages = getErrorMessagesBySeverity("warning");

  return (
    <div>
      <h3>Structure + Accessibility Check</h3>
      <p>Status: {isValid ? "✅ Valid" : "❌ Invalid"}</p>

      {errorMessages.length > 0 && (
        <div>
          <h4>Errors:</h4>
          <ul>
            {errorMessages.map((message, index) => (
              <li key={index} style={{ color: "red" }}>
                {message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {warningMessages.length > 0 && (
        <div>
          <h4>Warnings:</h4>
          <ul>
            {warningMessages.map((message, index) => (
              <li key={index} style={{ color: "orange" }}>
                {message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Example 3: Adding custom rules
const customRule: StructureRule = {
  name: "no-empty-divs",
  description: "Warns about empty div containers",
  validate: (_blocks: ChaiBlock[], tree: any[]) => {
    const errors: any[] = [];

    const findEmptyDivs = (nodes: any[]) => {
      nodes.forEach((node) => {
        if (node._type === "Box" && (!node.children || node.children.length === 0)) {
          errors.push({
            id: `empty-div-${node._id}`,
            message: "Empty Box (div) detected - consider removing it or adding content",
            severity: "warning" as const,
            blockId: node._id,
          });
        }

        if (node.children && node.children.length > 0) {
          findEmptyDivs(node.children);
        }
      });
    };

    findEmptyDivs(tree);
    return errors;
  },
};

export const StructureCheckWithCustomRules = () => {
  const { isValid, errors } = useCheckStructure({
    customRules: [customRule],
  });

  return (
    <div>
      <h3>Structure Check with Custom Rules</h3>
      <p>Status: {isValid ? "✅ Valid" : "❌ Invalid"}</p>
      <p>Total issues: {errors.length}</p>

      {/* Example: Get errors for a specific block */}
      {/* const specificBlockErrors = getBlockErrors('some-block-id'); */}
    </div>
  );
};

// Example 4: Managing rules dynamically
export const RuleManagement = () => {
  const [rulesEnabled, setRulesEnabled] = React.useState({
    nestedLinks: true,
    tableStructure: true,
    headingStructure: false,
  });

  // Dynamically manage which rules are active
  React.useEffect(() => {
    // Remove all rules first
    const allRuleNames = defaultRuleRegistry.getRuleNames();
    allRuleNames.forEach((name) => {
      defaultRuleRegistry.removeRule(name);
    });

    // Add back only enabled rules
    if (rulesEnabled.nestedLinks) {
      const nestedLinkRule = defaultRuleRegistry.getRules().find((r) => r.name === "no-nested-links");
      if (nestedLinkRule) defaultRuleRegistry.addRule(nestedLinkRule);
    }

    if (rulesEnabled.tableStructure) {
      const tableRule = defaultRuleRegistry.getRules().find((r) => r.name === "table-cell-structure");
      if (tableRule) defaultRuleRegistry.addRule(tableRule);
    }

    if (rulesEnabled.headingStructure) {
      const headingRule = defaultRuleRegistry.getRules().find((r) => r.name === "heading-structure");
      if (headingRule) defaultRuleRegistry.addRule(headingRule);
    }
  }, [rulesEnabled]);

  const { isValid, errors } = useCheckStructure();

  return (
    <div>
      <h3>Dynamic Rule Management</h3>
      <div>
        <label>
          <input
            type="checkbox"
            checked={rulesEnabled.nestedLinks}
            onChange={(e) => setRulesEnabled((prev) => ({ ...prev, nestedLinks: e.target.checked }))}
          />
          No Nested Links
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={rulesEnabled.tableStructure}
            onChange={(e) => setRulesEnabled((prev) => ({ ...prev, tableStructure: e.target.checked }))}
          />
          Table Structure Validation
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={rulesEnabled.headingStructure}
            onChange={(e) => setRulesEnabled((prev) => ({ ...prev, headingStructure: e.target.checked }))}
          />
          Heading Structure Validation
        </label>
      </div>

      <p>Status: {isValid ? "✅ Valid" : "❌ Invalid"}</p>
      <p>Issues found: {errors.length}</p>
    </div>
  );
};
