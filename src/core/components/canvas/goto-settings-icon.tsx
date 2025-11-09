import { CHAI_BUILDER_EVENTS } from "@/core/events";
import { usePubSub, useSelectedBlockIds } from "@/core/hooks";
import { useRightPanel } from "@/core/hooks/use-theme";
import { pubsub } from "@/core/pubsub";
import { GearIcon } from "@radix-ui/react-icons";
import { useCallback } from "react";

interface GotoSettingsIconProps {
  blockId?: string;
  className?: string;
}

export const GotoSettingsIcon = ({ blockId, className }: GotoSettingsIconProps) => {
  const [, setSelectedIds] = useSelectedBlockIds();
  const [, setRightPanel] = useRightPanel();

  const handleGotoSettings =useCallback(
    (id?: string) => {
      if (id) {
        setSelectedIds([id]);
        setRightPanel("block");
      }
    },
    [setSelectedIds, setRightPanel],
  )
  // PubSub listener for GOTO_BLOCK_SETTINGS event
  usePubSub(
    CHAI_BUILDER_EVENTS.GOTO_BLOCK_SETTINGS,
    handleGotoSettings,
  );

  const handleClick = () => {
    if (blockId) {
      pubsub.publish(CHAI_BUILDER_EVENTS.GOTO_BLOCK_SETTINGS, blockId);
    }
  };

  return <GearIcon className={className} onClick={handleClick} />;
};
