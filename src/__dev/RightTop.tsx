import { Paintbrush, Save } from "lucide-react";
import { Button } from "../ui";
import { useRightPanel, useSavePage } from "../core/hooks";

export default function RightTop() {
  const [panel, setRightPanel] = useRightPanel();
  const { savePage } = useSavePage();
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
      <Button variant="default" size="sm" className="gap-2" onClick={() => savePage(false)}>
        <Save className="h-4 w-4" />
        Save
      </Button>
    </div>
  );
}
