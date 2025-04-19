import { registerChaiSidebarPanel } from "@/core/main";
import { Button } from "@/ui/shadcn/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/shadcn/components/ui/popover";
import { ThermometerIcon } from "lucide-react";

// const Panel1Button = ({ isActive, show }: { isActive: boolean; show: () => void }) => {
//   return (
//     <Button variant={isActive ? "default" : "ghost"} size="icon" onClick={show}>
//       <ThermometerIcon />
//     </Button>
//   );
// };

// registerChaiSidebarPanel("panel-1", {
//   panel: () => <div>Panel 1</div>,
//   button: Panel1Button,
//   label: "Panel 1",
//   position: "top",
// });

// const WhenEmptyCanvasButton = ({ isActive, show }: { isActive: boolean; show: () => void }) => {
//   const [blocks] = useBlocksStore();
//   if (blocks.length > 0) {
//     return null;
//   }
//   return (
//     <Button variant={isActive ? "default" : "ghost"} size="icon" onClick={show}>
//       <ThermometerIcon />
//     </Button>
//   );
// };

// registerChaiSidebarPanel("when-empty-canvas", {
//   panel: ({ close }: { close: () => void }) => (
//     <div>
//       WhenEmptyCanvas
//       <Button onClick={close}>Close</Button>
//     </div>
//   ),
//   button: WhenEmptyCanvasButton,
//   label: "WhenEmptyCanvas",
//   position: "top",
//   view: "modal",
// });

const PopoverButton = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="default" size="icon">
          <ThermometerIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="right">
        <div className="p-0">
          <h4 className="font-medium leading-none">Popover Content</h4>
        </div>
      </PopoverContent>
    </Popover>
  );
};

registerChaiSidebarPanel("popover", {
  button: PopoverButton,
  label: "Popover",
  position: "bottom",
});
