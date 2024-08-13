import { useTranslation } from "react-i18next";
import { useAskAi } from "../../hooks/useAskAi.ts";
import { useEffect, useRef, useState } from "react";
import { Loader } from "lucide-react";
import { Button, Skeleton, Textarea } from "../../../ui";
import { FaSpinner } from "react-icons/fa";

export const AskAIStyles = ({ blockId }: { blockId: string | undefined }) => {
  const { t } = useTranslation();
  const { askAi, loading, error } = useAskAi();
  const [prompt, setPrompt] = useState("");
  const promptRef = useRef(null);
  useEffect(() => {
    promptRef.current?.focus();
  }, []);

  const onComplete = () => {
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
        className="w-full border border-gray-400 focus:border-0"
        rows={3}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            askAi("styles", blockId, prompt, onComplete);
          }
        }}
      />

      <div className="my-2 flex items-center gap-2">
        {!loading ? (
          <Button
            disabled={prompt.trim().length < 5 || loading}
            onClick={() => askAi("styles", blockId, prompt, onComplete)}
            variant="default"
            className="w-fit"
            size="sm">
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                {t("Generating... Please wait")}
              </>
            ) : (
              t("Edit with AI")
            )}
          </Button>
        ) : null}
        {loading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="flex w-full items-center space-x-1 px-4 py-1 pl-2">
              <FaSpinner className="h-4 w-4 animate-spin text-gray-500" />
              <p className="text-xs">{t("Generating... Please wait")}</p>
            </Skeleton>
            <Button variant="destructive" onClick={() => stop()} className="hidden w-fit" size="sm">
              {t("Stop")}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
