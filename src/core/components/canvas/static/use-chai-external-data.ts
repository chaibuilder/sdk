import { chaiExternalDataAtom } from "@/core/atoms/builder";
import { useAtom } from "jotai";

export const useChaiExternalData = () => useAtom(chaiExternalDataAtom);
