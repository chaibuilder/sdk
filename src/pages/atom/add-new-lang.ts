import { atom } from "jotai";

export const addNewLangAtom = atom<null | {
  edit: boolean;
  primaryPage: string;
  id?: string;
  preselectedLang?: string;
}>(null);
