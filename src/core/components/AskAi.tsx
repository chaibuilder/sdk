import { useTranslation } from "react-i18next";
import { useAskAi } from "../hooks/useAskAi.ts";
import { useEffect, useRef, useState } from "react";
import { Button, Skeleton, Textarea } from "../../ui";
import { Loader, SparklesIcon } from "lucide-react";
import { useSelectedBlockIds } from "../hooks";
import { first } from "lodash-es";
import { FaSpinner } from "react-icons/fa";

const AskAIPrompt = ({ blockId }: { blockId: string | undefined }) => {
  const { t } = useTranslation();
  const { askAi, loading, error } = useAskAi();
  const [prompt, setPrompt] = useState("");
  const promptRef = useRef(null);
  useEffect(() => {
    promptRef.current?.focus();
  }, []);

  const onComplete = () => {
    setPrompt("");
  };

  if (!blockId)
    return (
      <div className="p-4 text-center">
        <div className="space-y-4 rounded-xl p-4">
          <SparklesIcon className="mx-auto text-3xl" />
          <h1>{t("no_block_selected_for_ask_ai")}</h1>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xs font-semibold">{t("Ask AI")} (GPT-4o mini)</h2>
      <Textarea
        ref={promptRef}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={t("Ask AI to edit something")}
        className="w-full border border-gray-400 focus:border-0"
        rows={3}
      />

      <div className="flex items-center gap-2">
        {!loading ? (
          <Button
            disabled={prompt.trim().length < 5 || loading}
            onClick={() => askAi(blockId, prompt, onComplete)}
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
      <div>
        {error && <p className="rounded border border-red-500 bg-red-100 p-1 text-xs text-red-500">{error.message}</p>}
      </div>
    </div>
  );
};

export const AskAI = () => {
  const [ids] = useSelectedBlockIds();
  return (
    <div className="absolute inset-0 z-50 h-full w-full bg-white p-4">
      <AskAIPrompt blockId={first(ids)} />
    </div>
  );
};
