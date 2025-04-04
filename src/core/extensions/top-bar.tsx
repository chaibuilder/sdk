import { useMemo } from "react";

const DefaultTopBar = () => {
  return <div>TopBar</div>;
};

const TOP_BAR: { component: React.ComponentType } = {
  component: DefaultTopBar,
};

export const registerChaiTopBar = (component: React.ComponentType) => {
  TOP_BAR.component = component;
};

export const useTopBarComponent = () => {
  return useMemo(() => {
    return TOP_BAR.component;
  }, []);
};
