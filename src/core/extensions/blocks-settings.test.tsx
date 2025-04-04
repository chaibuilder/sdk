import { beforeEach, describe, expect, it } from "vitest";
import {
  RJSF_EXTENSIONS,
  registerBlockSettingField,
  registerBlockSettingTemplate,
  registerBlockSettingWidget,
  useBlockSettingComponents,
} from "./blocks-settings";

describe("Block Settings Extensions", () => {
  const MockComponent = () => <div>Mock Component</div>;

  beforeEach(() => {
    // Clear the extensions object before each test
    Object.keys(RJSF_EXTENSIONS).forEach((key) => {
      delete RJSF_EXTENSIONS[key];
    });
  });

  describe("registerBlockSettingWidget", () => {
    it("should register a widget with the correct properties", () => {
      // Act
      registerBlockSettingWidget("test-widget", MockComponent);

      // Assert
      expect(RJSF_EXTENSIONS["test-widget"]).toBeDefined();
      expect(RJSF_EXTENSIONS["test-widget"].id).toBe("test-widget");
      expect(RJSF_EXTENSIONS["test-widget"].component).toBe(MockComponent);
      expect(RJSF_EXTENSIONS["test-widget"].type).toBe("widget");
    });
  });

  describe("registerBlockSettingField", () => {
    it("should register a field with the correct properties", () => {
      // Act
      registerBlockSettingField("test-field", MockComponent);

      // Assert
      expect(RJSF_EXTENSIONS["test-field"]).toBeDefined();
      expect(RJSF_EXTENSIONS["test-field"].id).toBe("test-field");
      expect(RJSF_EXTENSIONS["test-field"].component).toBe(MockComponent);
      expect(RJSF_EXTENSIONS["test-field"].type).toBe("field");
    });
  });

  describe("registerBlockSettingTemplate", () => {
    it("should register a template with the correct properties", () => {
      // Act
      registerBlockSettingTemplate("test-template", MockComponent);

      // Assert
      expect(RJSF_EXTENSIONS["test-template"]).toBeDefined();
      expect(RJSF_EXTENSIONS["test-template"].id).toBe("test-template");
      expect(RJSF_EXTENSIONS["test-template"].component).toBe(MockComponent);
      expect(RJSF_EXTENSIONS["test-template"].type).toBe("template");
    });
  });

  it("should override existing extension with the same id", () => {
    // Arrange
    const FirstComponent = () => <div>First</div>;
    const SecondComponent = () => <div>Second</div>;

    // Act
    registerBlockSettingWidget("test-id", FirstComponent);
    registerBlockSettingField("test-id", SecondComponent);

    // Assert
    expect(RJSF_EXTENSIONS["test-id"].component).toBe(SecondComponent);
    expect(RJSF_EXTENSIONS["test-id"].type).toBe("field");
  });

  describe("useBlockSettingComponents", () => {
    beforeEach(() => {
      // Register multiple components of different types
      const WidgetComponent1 = () => <div>Widget 1</div>;
      const WidgetComponent2 = () => <div>Widget 2</div>;
      const FieldComponent = () => <div>Field</div>;
      const TemplateComponent = () => <div>Template</div>;

      registerBlockSettingWidget("widget-1", WidgetComponent1);
      registerBlockSettingWidget("widget-2", WidgetComponent2);
      registerBlockSettingField("field-1", FieldComponent);
      registerBlockSettingTemplate("template-1", TemplateComponent);
    });

    it("should return only widgets when type is 'widget'", () => {
      // Act
      const widgets = useBlockSettingComponents("widget");

      // Assert
      expect(widgets).toHaveLength(2);
      expect(widgets[0].id).toBe("widget-1");
      expect(widgets[1].id).toBe("widget-2");
      expect(widgets.every((item) => item.component && item.id)).toBe(true);
    });

    it("should return only fields when type is 'field'", () => {
      // Act
      const fields = useBlockSettingComponents("field");

      // Assert
      expect(fields).toHaveLength(1);
      expect(fields[0].id).toBe("field-1");
      expect(fields.every((item) => item.component && item.id)).toBe(true);
    });

    it("should return only templates when type is 'template'", () => {
      // Act
      const templates = useBlockSettingComponents("template");

      // Assert
      expect(templates).toHaveLength(1);
      expect(templates[0].id).toBe("template-1");
      expect(templates.every((item) => item.component && item.id)).toBe(true);
    });

    it("should return an empty array when no components match the type", () => {
      // Arrange
      Object.keys(RJSF_EXTENSIONS).forEach((key) => {
        delete RJSF_EXTENSIONS[key];
      });

      // Act
      const widgets = useBlockSettingComponents("widget");

      // Assert
      expect(widgets).toHaveLength(0);
      expect(widgets).toEqual([]);
    });
  });
});
