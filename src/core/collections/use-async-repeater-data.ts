import { atom, useAtom } from "jotai";

export const repeaterAsyncDataAtom = atom({});

export const useAsyncRepeaterData = () => useAtom(repeaterAsyncDataAtom);
