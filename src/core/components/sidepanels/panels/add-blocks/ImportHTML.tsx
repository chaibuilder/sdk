import { useState } from "react";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import {
  Alert,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  Label,
  Textarea,
} from "../../../../../ui";
import { useAddBlock, useSelectedBlockIds } from "../../../../hooks";
import { activePanelAtom, addBlockOffCanvasAtom } from "../../../../atoms/ui";
import { first } from "lodash-es";
import { addBlocksModalAtom } from "../../../../atoms/blocks";
import { getBlocksFromHTML } from "../../../../import-html/html-to-json";

const ImportHTML = () => {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const { addPredefinedBlock } = useAddBlock();
  const [ids]: any = useSelectedBlockIds();
  const [, setOpen] = useAtom(addBlockOffCanvasAtom);
  const [, setActivePanel] = useAtom(activePanelAtom);
  const [, setAddBlocks] = useAtom(addBlocksModalAtom);

  const importComponents = () => {
    const blocks = getBlocksFromHTML(code);
    addPredefinedBlock([...blocks], first(ids) || null);
    setCode("");
    setOpen(false);
    setActivePanel("layers");
    setAddBlocks(false);
  };

  return (
    <Card className="border-border/0 p-0 shadow-none">
      <CardHeader className="p-3">
        <CardDescription>
          {t("html_snippet_description")}
        </CardDescription>
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
            defaultValue={code}
            onChange={(evt) => setCode(evt.target.value)}
            rows={12}
            placeholder={t("enter_code_snippet")}
            className="resize-none bg-gray-100 overflow-x-auto whitespace-pre text-xs font-mono font-normal"
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col justify-end p-3">
        <Button disabled={code.trim() === ""} onClick={() => importComponents()} size="sm" className="w-full">
          {t("import_html")}
        </Button>
        <Alert variant="default" className="mt-2 p-1 border-none text-gray-400">
          <AlertTitle className="text-xs font-normal leading-4">
            {t("note_imported_html")}
          </AlertTitle>
        </Alert>
      </CardFooter>
    </Card>
  );
};

export default ImportHTML;
