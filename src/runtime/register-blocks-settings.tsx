export const RJSF_EXTENSIONS: Record<string, { id: string; component: React.ComponentType<any>; type: string }> = {};

export const registerBlockSettingWidget = (id: string, component: React.ComponentType<any>) => {
  RJSF_EXTENSIONS[id] = {
    id,
    component,
    type: "widget",
  };
};

export const registerBlockSettingField = (id: string, component: React.ComponentType<any>) => {
  RJSF_EXTENSIONS[id] = {
    id,
    component,
    type: "field",
  };
};

export const registerBlockSettingTemplate = (id: string, component: React.ComponentType<any>) => {
  RJSF_EXTENSIONS[id] = {
    id,
    component,
    type: "template",
  };
};

export const useBlockSettingComponents = (
  type: "widget" | "field" | "template",
): Record<string, React.ComponentType<any>> => {
  return Object.values(RJSF_EXTENSIONS)
    .filter((component) => component.type === type)
    .reduce(
      (acc, component) => {
        acc[component.id] = component.component;
        return acc;
      },
      {} as Record<string, React.ComponentType<any>>,
    );
};
