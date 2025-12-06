import React from "react";
import { FontStyleIcon } from "@radix-ui/react-icons";
interface DesignTokensIconProps {
  className?: string;
}

export const DesignTokensIcon: React.FC<DesignTokensIconProps> = ({ className = "" }) => {
  return <FontStyleIcon className={className} />;
};
