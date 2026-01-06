import { noop } from "lodash-es";
import { usePagesProp } from "./project/use-builder-prop";

export const useChaiAuthTokens = () => {
  const getAccessToken = usePagesProp("getAuthToken", noop);
  const getRefreshToken = usePagesProp("getAuthToken", noop);
  return {
    getAccessToken,
    getRefreshToken,
  };
};
