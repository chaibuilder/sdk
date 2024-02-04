import { useState } from "react";
import { useAtom } from "jotai";
import {
  Alert,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Label,
  Textarea,
} from "../../../../../ui";
import { useAddBlock, useSelectedBlockIds } from "../../../../hooks";
import { activePanelAtom, addBlockOffCanvasAtom } from "../../../../store/ui";
import { first } from "lodash";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { addBlocksModalAtom } from "../../../../store/blocks";
import { getBlocksFromHTML } from "../../../../import-html/html-to-json";

const ImportHTML = () => {
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
        <CardTitle>Import HTML</CardTitle>
        <CardDescription>
          Use HTML snippets from component libraries like Tailwind UI, Flowbite, Preline, Kitwind, Tailblocks etc. or
          just copy paste your own HTML code. Only Tailwind CSS markup is supported.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 px-3 py-0">
        <div className="space-y-1">
          <Label htmlFor="current" className="text-sm">
            Enter HTML Code:
          </Label>
          <Textarea
            autoFocus
            tabIndex={1}
            ref={(el) => el && el.focus()}
            defaultValue={code}
            onChange={(evt) => setCode(evt.target.value)}
            rows={12}
            placeholder={`<div>
    <h1>Enter code here</h1>
</div>`}
            className="resize-none overflow-x-auto whitespace-pre font-mono font-normal"
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col justify-end p-3">
        <Button disabled={code.trim() === ""} onClick={() => importComponents()} size="sm" className="w-full">
          Import
        </Button>
        <Alert variant="default" className="mt-2 p-1 text-blue-400">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle className="text-sm leading-4">
            Imported html will be added to the currently selected block. If no block is selected, the html will be added
            to the page.
          </AlertTitle>
        </Alert>
      </CardFooter>
    </Card>
  );
};

export default ImportHTML;
