import { usePageExternalData } from "@/core/atoms/builder";
import { dataBindingActiveAtom } from "@/core/atoms/ui";
import { useBuilderProp } from "@/core/hooks";
import { cn } from "@/core/functions/common-functions";
import { Button } from "@/ui/shadcn/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/shadcn/components/ui/tooltip";
import { LightningBoltIcon } from "@radix-ui/react-icons";
import { useAtom } from "jotai";
import { isEmpty } from "lodash-es";
import { useTranslation } from "react-i18next";

export const DataBinding = () => {
  const pageExternalData = usePageExternalData();
  const disableDataBinding = useBuilderProp("flags.disableDataBinding", false);
  const [dataBindingActive, setDataBindingActive] = useAtom(dataBindingActiveAtom);
  const { t } = useTranslation();
  if (disableDataBinding || isEmpty(pageExternalData)) return null;
  return (
    <div className="flex items-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button className="rounded-full" variant="ghost" onClick={() => setDataBindingActive(!dataBindingActive)}>
            <LightningBoltIcon className={cn("h-4 w-4", dataBindingActive ? "text-green-500" : "text-gray-500")} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t("Toggle Data Binding")}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
