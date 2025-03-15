import { useAtom } from "jotai";
import { filter, find, isEmpty, isNull, map, noop } from "lodash-es";
import { useEffect, useMemo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useTranslation } from "react-i18next";
import { allExpanded, defaultStyles, JsonView } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui";
import { useBuilderProp } from "../../hooks";
import { usePageDataProviders } from "../../hooks/usePageDataProviders.ts";
import { builderSaveStateAtom } from "../../hooks/useSavePage.ts";
import { FallbackError } from "../FallbackError.tsx";

const ViewProviderData = ({ provider, onClose }) => {
  const { t } = useTranslation();
  const [json, setJson] = useState(null);
  const onErrorFn = useBuilderProp("onError", noop);

  useEffect(() => {
    if (provider) {
      const fn = provider.mockFn ? provider.mockFn : provider.dataFn;
      fn().then((data: any) => setJson(data));
    }
  }, [provider]);

  if (!provider) return null;

  return (
    <Dialog onOpenChange={(open) => (!open ? onClose() : "")} defaultOpen={true}>
      <DialogContent className={"border-border"}>
        <DialogHeader>
          <DialogTitle className={"text-foreground"}>
            {t("Data Provider")}: {provider.name}
          </DialogTitle>
          <DialogDescription>{provider.description}</DialogDescription>
        </DialogHeader>
        <ErrorBoundary fallback={<FallbackError />} onError={onErrorFn}>
          <JsonView
            data={json}
            shouldExpandNode={allExpanded}
            style={{
              ...defaultStyles,
              container: "max-h-[80vh] overflow-y-auto text-[12px] leading-[1.5] tracking-wide font-mono",
              stringValue: "text-orange-600",
              label: "text-green-900 font-semibold pr-1 tracking-wider",
            }}
          />
        </ErrorBoundary>
      </DialogContent>
    </Dialog>
  );
};

function RemoveProviderConfirmation({
  children,
  name,
  onRemove,
}: {
  children: any;
  name: string;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle
            dangerouslySetInnerHTML={{ __html: t("Remove Provider Confirmation").replace(`{name}`, name) }}
          />
          <AlertDialogDescription>
            {t(
              "Your data provider will be removed from this page and all added data binding will be not visible on blocks.",
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={onRemove} className="bg-red-600 hover:bg-red-700">
            {t("Remove")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const PageDataProviders = () => {
  const { t } = useTranslation();
  const providersList = useMemo(() => [], []);
  const [dataProviders, setChaiProviders] = usePageDataProviders();
  const [, setSaveState] = useAtom(builderSaveStateAtom);

  const [providers, setProviders] = useState(
    filter(providersList, (p) => map(dataProviders, "providerKey").includes(p.providerKey)),
  );

  const [provider, setProvider] = useState("");

  const [viewer, setViewer] = useState(null);
  const options = filter(
    providersList.map((p) => {
      if (map(providers, "providerKey").includes(p.providerKey)) return null;
      return { value: p.providerKey, label: p.name };
    }),
    (p) => !isNull(p),
  );

  const addProvider = (newProvider: string) => {
    const dataProvider = find(providersList, { providerKey: newProvider });
    // @ts-ignore
    setProviders((prev) => [...prev, dataProvider]);
    setChaiProviders((prev) => [...prev, { providerKey: dataProvider.providerKey, args: {} }]);
    setProvider("");
    setSaveState("UNSAVED");
  };

  const removeProvider = (provider) => {
    setProviders((prev) => filter(prev, (p) => p.providerKey !== provider.providerKey));
    setChaiProviders((prev) => filter(prev, (p) => p.providerKey !== provider.providerKey));
    setSaveState("UNSAVED");
  };

  const viewData = (p) => setViewer(p);

  if (isEmpty(providersList))
    return (
      <div>
        <p className="mb-1.5 p-4 text-xs text-gray-500">
          {t("You have no data providers registered. Please add a data provider to your project.")}
          <br />
          <a className="text-blue-500" href="https://chaibuilder.com/docs/registering-data-providers" target={"_blank"}>
            {t("Learn more")}
          </a>
        </p>
      </div>
    );

  return (
    <div className="px-1">
      <br />
      <label>
        <p className="mb-1.5 text-xs text-gray-500">{t("Add data providers:")}</p>
      </label>
      <div className="flex items-center space-x-1">
        <Select value={provider} onValueChange={(value) => addProvider(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("Select a provider")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t("Choose")}</SelectItem>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <br />

      <div className={`border-t border-border ${providers.length ? "block" : "hidden"}`}>
        <p className="flex-1 pb-1.5 pt-4 text-xs font-medium text-gray-500">{t("Page Data Providers")}:</p>
        <div className="space-y-2">
          {providers.map((dataProvider) => (
            <div
              key={dataProvider.providerKey}
              className="w-full rounded-lg border border-border bg-card text-card-foreground shadow-sm"
              data-v0-t="card">
              <div className="flex flex-col space-y-1.5 px-4 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium leading-4">{dataProvider.name}</h3>
                    <p className="pt-1 text-xs text-gray-400">{dataProvider.description}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 py-2">
                <button
                  onClick={() => viewData(dataProvider)}
                  className="inline-flex h-9 items-center justify-center rounded-md px-3 text-xs font-medium text-blue-500 underline-offset-4 ring-offset-background transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  {t("View Data")}
                </button>
                <RemoveProviderConfirmation onRemove={() => removeProvider(dataProvider)} name={dataProvider.name}>
                  <button className="inline-flex h-9 items-center justify-center rounded-md px-3 text-xs font-medium text-red-500 underline-offset-4 ring-offset-background transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                    {t("Remove")}
                  </button>
                </RemoveProviderConfirmation>
              </div>
            </div>
          ))}
        </div>
        <ViewProviderData onClose={() => setViewer(null)} provider={viewer} />
      </div>
    </div>
  );
};
