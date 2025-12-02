import { Button } from "@/ui";
import { TransformIcon } from "@radix-ui/react-icons";

export const PanelButton = ({ show, isActive }: { show: () => void; isActive: boolean }) => {
  return (
    <Button variant={isActive ? "default" : "ghost"} size="icon" onClick={show}>
      <TransformIcon />
    </Button>
  );
};
