import { useTranslation } from "react-i18next";
import { useAskAi } from "../hooks/useAskAi.ts";
import { useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Skeleton,
  Textarea,
  useToast,
} from "../../ui";
import { ChevronDown, Loader, SparklesIcon } from "lucide-react";
import { useBuilderProp, useSelectedBlockIds } from "../hooks";
import { first, noop } from "lodash-es";
import { FaSpinner } from "react-icons/fa";
import { QuickPrompts } from "./QuickPrompts.tsx";

export const AIUserPrompt = ({ blockId }: { blockId: string | undefined }) => {
  const { t } = useTranslation();
  const { askAi, loading, error } = useAskAi();
  const [prompt, setPrompt] = useState("");
  const [open, setOpen] = useState(true);
  const promptRef = useRef(null);
  useEffect(() => {
    promptRef.current?.focus();
  }, []);

  const onComplete = () => {
    if (!error) setPrompt("");
  };

  return (
    <div className="">
      <div
        onClick={() => setOpen(!open)}
        className="flex cursor-default items-center justify-between border-b border-gray-300 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50">
        <span>{t("ask_ai")}</span>
        <span>
          <ChevronDown className={"h-4 w-4 text-gray-500 " + (open ? "rotate-180" : "")} />
        </span>
      </div>
      {open && blockId ? (
        <div className="mt-2">
          <Textarea
            ref={promptRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t("ask_ai_to_edit_content")}
            className="w-full border border-gray-400 focus:border-0"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                askAi("content", blockId, prompt, onComplete);
              }
            }}
          />

          <div className="my-2 flex items-center gap-2">
            {!loading ? (
              <Button
                disabled={prompt.trim().length < 5 || loading}
                onClick={() => askAi("content", blockId, prompt, onComplete)}
                variant="default"
                className="w-fit"
                size="sm">
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    {t("generating_please_wait")}
                  </>
                ) : (
                  t("edit_with_ai")
                )}
              </Button>
            ) : null}
            {loading ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="flex w-full items-center space-x-1 px-4 py-1 pl-2">
                  <FaSpinner className="h-4 w-4 animate-spin text-gray-500" />
                  <p className="text-xs">{t("generating_please_wait")}</p>
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
          <QuickPrompts onClick={(prompt: string) => askAi("content", blockId, prompt, onComplete)} />
        </div>
      ) : open ? (
        <div className="p-4 text-center">
          <div className="space-y-4 rounded-xl p-4">
            <SparklesIcon className="mx-auto text-3xl" />
            <h1>{t("please_select_a_block_to_ask_ai")}</h1>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export const AISetContext = () => {
  const { t } = useTranslation();
  const aiContext = useBuilderProp("aiContext", "");
  const [context, setContext] = useState(aiContext);
  const promptRef = useRef(null);
  const savePageContext = useBuilderProp("saveAiContextCallback", noop);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [, setOpened] = useState(false);
  const { toast } = useToast();
  const btnRef = useRef(null);

  useEffect(() => {
    if (aiContext) {
      setContext(aiContext);
    }
  }, [aiContext]);

  const saveContext = async () => {
    try {
      setLoading(true);
      setError(null);
      await savePageContext(context);
      toast({
        title: t("ai_context_updated"),
        description: t("you_can_now_ask_ai_to_edit_your_content"),
        variant: "default",
      });
      btnRef.current.click();
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Accordion
      onValueChange={(value) => {
        setOpened(value !== "");
      }}
      type="single"
      collapsible>
      <AccordionItem value="set-context" className="border-none">
        {/*  @ts-ignore */}
        <AccordionTrigger ref={btnRef} className="border-b py-2 text-gray-600 hover:no-underline">
          <div className="flex w-full items-center justify-between">
            <span className="font-bold">{t("ai_context")}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {/*<h2 className="mb-1 text-sm font-semibold leading-none tracking-tight"> {t("Enter page details")}</h2>*/}
          <Textarea
            ref={promptRef}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder={t("tell_about_this_page_eg_this_page_is_about")}
            className="w-full border border-gray-400 bg-background focus:border"
            rows={10}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                saveContext();
              }
            }}
          />
          {aiContext.trim().length === 0 ? (
            <p className="mt-2 text-xs text-gray-500">
              {t(
                "eg_this_page_is_about_an_ai_assistant_app_called_chai_studio_it_allows_users_to_create_beautiful_webpages_and_edit_content_with_ai",
              )}
            </p>
          ) : null}
          <div className="mt-2 flex items-center">
            <Button
              disabled={context.trim().length < 5}
              onClick={() => saveContext()}
              variant="default"
              className="w-fit"
              size="sm">
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  {t("generating_please_wait")}
                </>
              ) : (
                t("save")
              )}
            </Button>
            {aiContext.trim().length > 0 ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button disabled={aiContext.trim().length === 0} variant="ghost" className="w-fit" size="sm">
                    {loading ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        {t("generating_please_wait")}
                      </>
                    ) : (
                      t("delete")
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("remove_context?")}</AlertDialogTitle>
                    <AlertDialogDescription></AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        setContext("");
                        saveContext();
                      }}>
                      Yes, Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}
          </div>
          <div className="mt-2 max-w-full">
            {error && (
              <p className="break-words rounded border border-red-500 bg-red-100 p-1 text-xs text-red-500">
                {error.message}
              </p>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export const AskAI = () => {
  const [ids] = useSelectedBlockIds();
  return (
    <div className="mt-2">
      <AISetContext />
      <AIUserPrompt blockId={first(ids)} />
    </div>
  );
};
