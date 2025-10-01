import { LANGUAGES } from "@/core/constants/LANGUAGES";
import { useAskAi } from "@/core/hooks/use-ask-ai";
import { useLanguages } from "@/core/hooks/use-languages";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/shadcn/components/ui/popover";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChatBubbleIcon,
  CheckIcon,
  FaceIcon,
  LoopIcon,
  Pencil2Icon,
  ShuffleIcon,
} from "@radix-ui/react-icons";
import { get } from "lodash-es";
import { useTranslation } from "react-i18next";

export function QuickPrompts({ onClick }: { onClick: (prompt: string) => void }) {
  const { loading } = useAskAi();
  const { t } = useTranslation();
  const { selectedLang, fallbackLang } = useLanguages();
  const QUICK_PROMPTS = [
    {
      name: t("Improve writing"),
      icon: Pencil2Icon,
      prompt: t(
        "Improving writing in all text elements. Replacing placeholder content with meaningful relevant content.",
      ),
    },
    {
      name: t("Replace placeholder content"),
      icon: LoopIcon,
      prompt: t("Discard current placeholder content and replace with meaningful relevant content."),
    },
    {
      name: t("Fix grammar"),
      icon: CheckIcon,
      prompt: t("Fix grammar in all text elements. Ensuring the text is grammatically correct and free of errors."),
    },
    {
      name: t("Make longer"),
      icon: ArrowUpIcon,
      prompt: t("Make all text elements longer."),
    },
    {
      name: t("Make shorter"),
      icon: ArrowDownIcon,
      prompt: t("Make all text elements shorter."),
    },
    {
      name: t("Add emojis"),
      icon: FaceIcon,
      prompt: t("Add emojis to text elements if relevant."),
    },
    {
      name: t("Randomize"),
      icon: ShuffleIcon,
      prompt: t("Randomize all text elements."),
    },
  ];

  const quickPrompts = [...QUICK_PROMPTS];

  if (selectedLang && selectedLang !== fallbackLang) {
    quickPrompts.splice(0, 0, {
      name: t(`Translate to %s`, get(LANGUAGES, selectedLang, selectedLang)),
      icon: ChatBubbleIcon,
      prompt: t(
        `Translate the content to %s. Maintain same tone, style and length.`,
        get(LANGUAGES, selectedLang, selectedLang),
      ),
    });
  }

  return (
    <div className={loading ? "pointer-events-none opacity-50" : ""}>
      <ul className="space-y-2">
        {quickPrompts.map(({ name, icon: Icon, subMenus, prompt }: any) =>
          subMenus ? (
            <Popover>
              <PopoverTrigger asChild>
                <li
                  className="flex cursor-pointer items-center space-x-2 rounded p-1 pl-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                  key={name}>
                  <Icon className="h-4 w-4" />
                  <span>{name}</span>
                </li>
              </PopoverTrigger>
              <PopoverContent side={"right"}>
                <ul>
                  <li>{t("Happy")}</li>
                </ul>
              </PopoverContent>
            </Popover>
          ) : (
            <li
              onClick={() => onClick(prompt)}
              className="flex cursor-pointer items-center space-x-2 rounded p-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
              key={name}>
              <Icon className="h-4 w-4" />
              <span>{t(name)}</span>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
