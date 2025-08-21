import { atom, useAtom } from "jotai";

export const isBuilderReadyAtom = atom<boolean>(false);

// * Hook to identify if the builder is ready
export const useIsBuilderReady = () => {
  const [isBuilderReady] = useAtom(isBuilderReadyAtom);
  return isBuilderReady;
};
