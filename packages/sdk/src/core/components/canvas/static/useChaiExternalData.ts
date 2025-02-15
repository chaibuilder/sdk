import { useAtom } from "jotai";
import { chaiExternalDataAtom } from "../../../atoms/builder.ts";

export const useChaiExternalData = () => useAtom(chaiExternalDataAtom);
