import { ChaiBuilderEditor } from "./core/main";

function ChaiEditor() {
  return (
    <ChaiBuilderEditor
      onSavePage={async (args: any) => {
        console.log(args);
        return true;
      }}
      onSaveBrandingOptions={async (args: any) => {
        console.log(args);
        return true;
      }}
    />
  );
}

export default ChaiEditor;
