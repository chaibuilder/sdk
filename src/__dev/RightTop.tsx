import { Check, Eye, Globe, Paintbrush, Upload } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui";
import { Button } from "../ui";
import { useSavePage } from "../core/hooks";
import { useThemeSelected } from "../core/hooks/useTheme.ts";

export default function RightTop() {
  const { savePage } = useSavePage();

  const { selectThemeSettings } = useThemeSelected();
  return (
    <div className="flex items-center gap-2 rounded-lg bg-background p-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <Globe className="h-4 w-4" />
            French
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>English</DropdownMenuItem>
          <DropdownMenuItem>French</DropdownMenuItem>
          <DropdownMenuItem>Spanish</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="h-4 w-px bg-border" />

      <Button onClick={() => savePage(false)} variant="ghost" size="sm" className="gap-2 text-green-500">
        <Check className="h-4 w-4" />
        Saved
      </Button>

      <div className="h-4 w-px bg-border" />

      <Button variant="ghost" size="sm" className="gap-2">
        <Eye className="h-4 w-4" />
        Preview
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={() => {
          selectThemeSettings();
        }}>
        <Paintbrush className="h-4 w-4" />
        Theme
      </Button>

      <Button variant="default" size="sm" className="gap-2">
        <Upload className="h-4 w-4" />
        Publish
      </Button>
    </div>
  );
}
