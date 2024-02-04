import { atom, useAtom } from "jotai";

const chaiExternalDataAtom = atom({});

export const useChaiExternalData = () => useAtom(chaiExternalDataAtom);
