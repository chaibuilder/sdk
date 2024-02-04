import { each, find } from "lodash";
import { useEffect } from "react";
import { useChaiExternalData } from "./useChaiExternalData.ts";
import { usePageDataProviders } from "../../../hooks/usePageDataProviders.ts";
import { useAllDataProviders } from "../../../hooks/useAllDataProviders.ts";

const BlocksExternalDataProvider = ({ children }: any) => {
  const [, setExternalData] = useChaiExternalData();
  const [pageProviders] = usePageDataProviders();
  const allProviders = useAllDataProviders();

  useEffect(() => {
    setExternalData({});
    each(pageProviders, (provider: any) => {
      const dataProvider = find(allProviders, { providerKey: provider.providerKey });
      if (dataProvider) {
        const dataFn = dataProvider?.mockFn || dataProvider?.dataFn;
        if (dataFn) {
          // @ts-ignore
          dataFn(provider.args).then((data) =>
            setExternalData((prev: any) => ({ ...prev, [provider.providerKey]: data })),
          );
        }
      }
    });
    return () => {
      each(pageProviders, (provider: any) => {
        setExternalData((prev: any) => {
          delete prev[provider.providerKey];
          return prev;
        });
      });
    };
  }, [allProviders, pageProviders, setExternalData]);

  return <>{children}</>;
};

export { BlocksExternalDataProvider };
