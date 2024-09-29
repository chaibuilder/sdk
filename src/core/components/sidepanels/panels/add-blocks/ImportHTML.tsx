import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, Label, Textarea } from "../../../../../ui";
import { useAddBlock } from "../../../../hooks";
import { getBlocksFromHTML } from "../../../../import-html/html-to-json";
import { CHAI_BUILDER_EVENTS, emitChaiBuilderMsg } from "../../../../events.ts";

const ImportHTML = ({ parentId }: { parentId?: string }) => {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const { addPredefinedBlock } = useAddBlock();

  const importComponents = () => {
    const blocks = getBlocksFromHTML(code);
    addPredefinedBlock([...blocks], parentId);
    setCode("");
    emitChaiBuilderMsg({ name: CHAI_BUILDER_EVENTS.CLOSE_ADD_BLOCK });
  };

  return (
    <Card className="border-border/0 p-0 shadow-none">
      <CardHeader className="p-3">
        <CardDescription>{t("html_snippet_description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 px-3 py-0">
        <div className="space-y-1">
          <Label htmlFor="current" className="text-sm">
            {t("tailwind_html_snippet")}
          </Label>
          <Textarea
            autoFocus
            tabIndex={1}
            ref={(el) => el && el.focus()}
            onChange={(evt) => setCode(evt.target.value)}
            rows={12}
            value={code}
            placeholder={t("enter_code_snippet")}
            className="resize-none overflow-x-auto whitespace-pre bg-background font-mono text-xs font-normal"
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col justify-end p-3">
        <Button disabled={code.trim() === ""} onClick={() => importComponents()} size="sm" className="w-fit">
          {t("Import HTML")}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ImportHTML;
