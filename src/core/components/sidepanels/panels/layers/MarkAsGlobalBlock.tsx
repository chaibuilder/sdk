import { useTranslation } from "react-i18next";
import { GlobeIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { Button } from "../../../../../ui";
import { useMarkAsGlobalBlock } from "../../../../hooks";
import { capitalize } from "lodash-es";

const MarkAsGlobalBlock = ({ id = null, closeModal }: { id: string | null; closeModal: () => void }) => {
  const { t } = useTranslation();
  const markAsGlobal = useMarkAsGlobalBlock();
  const [name, setName] = useState("");

  return (
    <>
      <h1 className="text-lg font-bold">{t("mark_as_global")}</h1>
      <div className={"py-2 text-sm"}>
        {t("global_block_note")}
        <br />
        <ul className={"mt-4 list-inside list-disc space-y-1"}>
          <li>
            {t("global_block_indicator")} <GlobeIcon className="inline" />
          </li>
          <li>{t("global_block_category")}</li>
        </ul>
      </div>
      <div className={"my-4"}>
        <label className={"block text-sm font-medium text-gray-400"}>{t("enter_global_block_name")}</label>
        <input
          placeholder={t("eg_header_footer")}
          className={"mt-2 w-full"}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="flex items-center justify-end gap-x-4">
        <Button
          onClick={() => {
            // @TODO: UPDATE THIS
            markAsGlobal(id, capitalize(name));
            closeModal();
          }}
          disabled={name.length <= 2}
          variant="default">
          {t("mark_as_global")}
        </Button>
        <Button variant="outline" onClick={closeModal}>
          {t("cancel")}
        </Button>
      </div>
    </>
  );
};

export default MarkAsGlobalBlock;
