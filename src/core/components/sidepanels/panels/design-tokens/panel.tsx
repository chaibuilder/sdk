import { useBuilderProp } from "@/core/hooks";
import { Button } from "@/ui";
import { FontStyleIcon } from "@radix-ui/react-icons";

export const PanelButton = ({ show, isActive }: { show: () => void; isActive: boolean }) => {
  const designTokensEnabled = useBuilderProp("flags.designTokens", false);
  if (!designTokensEnabled) {
    return null;
  }
  return (
    <Button variant={isActive ? "default" : "ghost"} size="icon" onClick={show} disabled={!designTokensEnabled}>
      <FontStyleIcon />
    </Button>
  );
};
