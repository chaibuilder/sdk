import { ChaiBuilderEditor } from "./core/main";
import { useAtom } from "jotai";
import { lsBlocksAtom, lsBrandingOptionsAtom, lsProvidersAtom } from "./atoms-dev.ts";

function ChaiEditor() {
  const [blocks, setBlocks] = useAtom(lsBlocksAtom);
  const [brandingOptions, setBrandingOptions] = useAtom(lsBrandingOptionsAtom);
  const [providers, setProviders] = useAtom(lsProvidersAtom);
  return (
    <ChaiBuilderEditor
      topBarComponents={{
        left: [
          () => (
            <div className={"font-normal text-sm"}>
              This is dev mode. Visit{" "}
              <a target={"_blank"} className="text-orange-500 underline" href={"/preview"}>
                /preview
              </a>{" "}
              to see page preview
            </div>
          ),
        ],
      }}
      blocks={blocks}
      dataProviders={providers}
      brandingOptions={brandingOptions}
      onSavePage={async ({ blocks, providers }: any) => {
        setBlocks(blocks);
        setProviders(providers);
        return true;
      }}
      onSaveBrandingOptions={async (options: any) => {
        setBrandingOptions(options);
        return true;
      }}
    />
  );
}

export default ChaiEditor;
