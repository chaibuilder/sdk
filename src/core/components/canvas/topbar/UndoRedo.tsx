import { ResetIcon } from "@radix-ui/react-icons";
import { Button } from "../../../../ui";
import { useUndoManager } from "../../../history/useUndoManager.ts";
import { cn } from "../../../functions/Functions.ts";

interface ButtonProps {
  defaultClasses?: string | undefined
  onDisabledClasses?: string | undefined
}

interface UndoRedoProps {
  containerClasses?: string | undefined,
  undoButtonProps?: ButtonProps,
  redoButtonProps?: ButtonProps
}

export const UndoRedo = ({
  containerClasses,
  redoButtonProps,
  undoButtonProps
}: UndoRedoProps) => {
  const { hasUndo, hasRedo, undo, redo } = useUndoManager();
  return (
    <div className={cn("flex items-center", containerClasses)}>
      <Button disabled={!hasUndo()} size="sm" onClick={undo as any} className={cn("rounded-full", undoButtonProps?.defaultClasses, !hasUndo() && undoButtonProps?.onDisabledClasses)} variant="ghost">
        <ResetIcon />
      </Button>
      <Button disabled={!hasRedo()} onClick={redo as any} size="sm" className={cn("rounded-full", redoButtonProps?.defaultClasses, !hasRedo() && redoButtonProps?.onDisabledClasses)} variant="ghost">
        <ResetIcon className="rotate-180 scale-y-[-1] transform" />
      </Button>
    </div>
  );
};
