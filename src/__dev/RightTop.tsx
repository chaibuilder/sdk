import { Paintbrush } from "lucide-react";
import { Button } from "../ui";
import { useRightPanel } from "../core/hooks/useTheme.ts";

export default function RightTop() {
  const [panel, setRightPanel] = useRightPanel();
  return (
    <div className="flex items-center gap-2 rounded-lg bg-background p-2">
      <Button
        variant={panel === "theme" ? "secondary" : "ghost"}
        size="sm"
        className="gap-2"
        onClick={() => setRightPanel(panel !== "theme" ? "theme" : "block")}>
        <Paintbrush className="h-4 w-4" />
        Theme
      </Button>
    </div>
  );
}
