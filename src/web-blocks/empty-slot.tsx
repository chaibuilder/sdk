import { cn } from "../core/functions/Functions.ts";

type EmptySlotProps = {
  className?: any;
  inBuilder?: boolean;
};
const EmptySlot = ({ className = "", inBuilder }: EmptySlotProps) => {
  if (!inBuilder) return null;
  return (
    <div className={cn("pointer-events-none flex h-20 flex-col items-center justify-center p-2", className)}>
      <div className="h-full w-full rounded bg-gray-200 p-2 dark:bg-gray-800">
        <div className="flex h-full w-full items-center justify-center outline-dashed outline-1 -outline-offset-1 outline-gray-400 duration-300 dark:outline-gray-700"></div>
      </div>
    </div>
  );
};

export default EmptySlot;
