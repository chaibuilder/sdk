import { atom } from "jotai/index";

export type HistoryPayload = {
  type: "add" | "edit" | "remove";
  payload: Array<{ _id: string } & Record<string, any>>;
};
export const historyPayloadAtom = atom<{
  past: HistoryPayload[];
  future: HistoryPayload[];
}>({
  past: [],
  future: [],
});
