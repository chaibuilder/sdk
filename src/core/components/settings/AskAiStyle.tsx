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
      <h2 className="mb-1 text-sm font-semibold leading-none tracking-tight">{t("ask_ai")}</h2>
      <Textarea
        ref={promptRef}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={t("ask_ai_to_edit_styles")}
        className="w-full border border-gray-400 focus:border-0"
        rows={3}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            askAi("styles", blockId, prompt, onComplete);
          }
        }}
      />

      <div className="flex items-center gap-2 my-2">
        {!loading ? (
          <Button
            disabled={prompt.trim().length < 5 || loading}
            onClick={() => askAi("styles", blockId, prompt, onComplete)}
            variant="default"
            className="w-fit"
            size="sm">
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                {t("generating_please_wait")}
              </>
            ) : (
              t("edit_with_ai")
            )}
          </Button>
        ) : null}
        {loading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="flex items-center w-full px-4 py-1 pl-2 space-x-1">
              <FaSpinner className="w-4 h-4 text-gray-500 animate-spin" />
              <p className="text-xs">{t("generating_please_wait")}</p>
            </Skeleton>
            <Button variant="destructive" onClick={() => stop()} className="hidden w-fit" size="sm">
              {t("stop")}
            </Button>
          </div>
        ) : null}
      </div>
      <div className="max-w-full">
        {error && (
          <p className="p-1 text-xs text-red-500 break-words bg-red-100 border border-red-500 rounded">
            {error.message}
          </p>
        )}
      </div>
    </div>
  );
};
