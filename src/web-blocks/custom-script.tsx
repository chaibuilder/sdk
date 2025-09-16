import { cn } from "@/core/functions/common-functions";
import { ChaiBlockComponentProps, registerChaiBlockSchema } from "@chaibuilder/runtime";
import { FileCode } from "lucide-react";

export type CustomScriptBlockProps = {
  scripts: string;
};

const CustomScript = (props: ChaiBlockComponentProps<CustomScriptBlockProps>) => {
  const { scripts, inBuilder, blockProps } = props;
  if (inBuilder)
    return (
      <div {...blockProps}>
        <div className={cn("pointer-events-none flex flex-col items-center justify-center p-2", "")}>
          <div className="h-full w-full rounded bg-gray-200 p-1 dark:bg-gray-800">
            <p className="text-left text-xs text-gray-400">
              Scripts will be only executed in preview and live mode. Place your script at the bottom of the
            </p>
          </div>
        </div>
      </div>
    );
  return <div dangerouslySetInnerHTML={{ __html: scripts }}></div>;
};

const Config = {
  type: "CustomScript",
  description: "similar to a script element in HTML",
  label: "Custom Script",
  category: "core",
  icon: FileCode,
  group: "advanced",
  ...registerChaiBlockSchema({
    properties: {
      scripts: {
        type: "string",
        title: "Script",
        default: "",
        format: "code",
        placeholder: "<script>console.log('Hello, world!');</script>",
      },
    },
  }),
  hidden: true,
};

export { CustomScript as Component, Config };
