import { atom, useAtom } from "jotai";

export const isPageLoadedAtom = atom<boolean>(false);

// * Hook to identify if the builder is ready
export const useIsPageLoaded = () => {
  const [isPageLoaded] = useAtom(isPageLoadedAtom);
  return isPageLoaded;
};
