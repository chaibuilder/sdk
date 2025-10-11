import { QuickPrompts } from "@/core/components/QuickPrompts";
import { useAskAi, useSelectedBlockIds } from "@/core/hooks";
import { Button } from "@/ui/shadcn/components/ui/button";
import { Skeleton } from "@/ui/shadcn/components/ui/skeleton";
import { Textarea } from "@/ui/shadcn/components/ui/textarea";
import { MagicWandIcon, ReloadIcon } from "@radix-ui/react-icons";
import { first } from "lodash-es";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export const AIUserPrompt = ({ blockId }: { blockId: string | undefined }) => {
  const { t } = useTranslation();
  const { askAi, loading, error } = useAskAi();
  const [prompt, setPrompt] = useState("");
  const promptRef = useRef(null);
  const timerRef = useRef(null);
  useEffect(() => {
    promptRef.current?.focus();
  }, []);

  const onComplete = () => {
    if (!error) setPrompt("");
  };

  return (
    <div className="">
      {blockId ? (
        <div className="mt-2">
          <Textarea
            ref={promptRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t("Ask AI to edit content")}
            className="w-full"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (timerRef.current) clearTimeout(timerRef.current);
                askAi("content", blockId, prompt, onComplete);
              }
            }}
          />

          <div className="my-2 flex items-center gap-2">
            {!loading ? (
              <Button
                disabled={prompt.trim().length < 5 || loading}
                onClick={() => {
                  if (timerRef.current) clearTimeout(timerRef.current);
                  askAi("content", blockId, prompt, onComplete);
                }}
                variant="default"
                className="w-fit"
                size="sm">
                {loading ? (
                  <>
                    <ReloadIcon className="h-5 w-5 animate-spin" />
                    {t("Generating... Please wait...")}
                  </>
                ) : (
                  t("Edit with AI")
                )}
              </Button>
            ) : null}
            {loading ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="flex w-full items-center space-x-1 px-4 py-1 pl-2">
                  <ReloadIcon className="h-4 w-4 animate-spin text-gray-500" />
                  <p className="text-xs">{t("Generating... Please wait...")}</p>
                </Skeleton>
                <Button variant="destructive" onClick={() => stop()} className="hidden w-fit" size="sm">
                  {t("Stop")}
                </Button>
              </div>
            ) : null}
          </div>
          <div className="max-w-full">
            {error && (
              <p className="break-words rounded border border-red-500 bg-red-100 p-1 text-xs text-red-500">
                {error.message}
              </p>
            )}
          </div>
          <br />

          <QuickPrompts
            onClick={(prompt: string) => {
              if (timerRef.current) clearTimeout(timerRef.current);
              askAi("content", blockId, prompt, onComplete);
            }}
          />
        </div>
      ) : (
        <div className="p-4 text-center">
          <div className="space-y-4 rounded-xl p-4 text-muted-foreground">
            <MagicWandIcon className="mx-auto text-3xl text-muted-foreground" />
            <h1>{t("Please select a block to Ask AI")}</h1>
          </div>
        </div>
      )}
    </div>
  );
};
export const AskAI = () => {
  const [ids] = useSelectedBlockIds();
  return (
    <div className="no-scrollbar mt-2 flex-1 overflow-y-auto">
      <AIUserPrompt blockId={first(ids)} />
    </div>
  );
};
