import { Loader } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Skeleton, Textarea } from "../../../ui";
import { useAskAi } from "../../hooks/useAskAi.ts";
import { AskAiResponse } from "../../types/chaiBuilderEditorProps.ts";
import Countdown from "../Countdown.tsx";

export const AskAIStyles = ({ blockId }: { blockId: string | undefined }) => {
  const { t } = useTranslation();
  const { askAi, loading, error } = useAskAi();
  const [prompt, setPrompt] = useState("");
  const promptRef = useRef(null);
  const timerRef = useRef(null);
  const [usage, setUsage] = useState<AskAiResponse["usage"] | undefined>();
  useEffect(() => {
    promptRef.current?.focus();
  }, []);

  const onComplete = (response?: AskAiResponse) => {
    const { usage } = response || {};
    if (!error && usage) setUsage(usage);
    timerRef.current = setTimeout(() => setUsage(undefined), 10000);
    if (!error) setPrompt("");
  };

  return (
    <div className="">
      <h2 className="mb-1 text-sm font-semibold leading-none tracking-tight">{t("Ask AI")}</h2>
      <Textarea
        ref={promptRef}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={t("Ask AI to edit styles")}
        className="no-scrollbar my-2 w-full border border-border p-2 text-xs"
        rows={4}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (timerRef.current) clearTimeout(timerRef.current);
            setUsage(undefined);
            askAi("styles", blockId, prompt, onComplete);
          }
        }}
      />

      <div className="my-2 flex items-center gap-2">
        {!loading ? (
          <Button
            disabled={prompt.trim().length < 5 || loading}
            onClick={() => {
              if (timerRef.current) clearTimeout(timerRef.current);
              setUsage(undefined);
              askAi("styles", blockId, prompt, onComplete);
            }}
            variant="default"
            className="w-fit"
            size="sm">
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
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
              <Loader className="h-4 w-4 animate-spin text-gray-500" size={16} />
              <p className="text-xs">{t("Generating... Please wait...")}</p>
            </Skeleton>
            <Button variant="destructive" onClick={() => stop()} className="hidden w-fit" size="sm">
              {t("Stop")}
            </Button>
          </div>
        ) : null}
      </div>
      {usage ? (
        <div className="max-w-full">
          <p className="mb-1 flex justify-between break-words rounded border border-blue-500 bg-blue-100 p-1 text-xs text-blue-500">
            <span>
              {t("Total tokens used")}: {usage.totalTokens}
            </span>
            <Countdown />
          </p>
        </div>
      ) : null}
      <div className="max-w-full">
        {error && (
          <p className="break-words rounded border border-red-500 bg-red-100 p-1 text-xs text-red-500">
            {error.message}
          </p>
        )}
      </div>
    </div>
  );
};
