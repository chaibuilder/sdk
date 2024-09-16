import { useState } from "react";
import { Image, Layers, Settings, Type } from "lucide-react";
import { BlockPropsEditor, Outline } from "../../main";

const menuItems = [
  { icon: <Layers size={24} />, label: "Outline", component: Outline },
  { icon: <Settings size={24} />, label: "Settings", component: BlockPropsEditor },
  { icon: <Type size={24} />, label: "Typography", component: () => <div>Typography</div> },
  { icon: <Image size={24} />, label: "Images", component: () => <div>Images</div> },
];

export const RootSidebar = () => {
  const [activePanelIndex, setActivePanelIndex] = useState(0);
  const handleMenuItemClick = (index: number) => {
    setActivePanelIndex(activePanelIndex === index ? null : index);
  };
  return (
    <div className="flex w-16 flex-col items-center bg-neutral-900 py-4">
      {menuItems.map((item, index) => (
        <button
          key={index}
          className={`mb-4 rounded-lg p-2 text-white transition-colors ${
            activePanelIndex === index ? "bg-blue-500 text-white" : "hover:bg-blue-500"
          }`}
          onClick={() => handleMenuItemClick(index)}>
          {item.icon}
        </button>
      ))}
    </div>
  );
};
