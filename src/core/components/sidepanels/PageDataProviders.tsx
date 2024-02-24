import { getChaiDataProviders } from "@chaibuilder/runtime";
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
import React, { useEffect, useMemo, useState } from "react";
import { filter, find, isEmpty, isNull, map } from "lodash";
import { usePageDataProviders } from "../../hooks/usePageDataProviders.ts";
import { useAtom } from "jotai";
import { pageSyncStateAtom } from "../../hooks/useSavePage.ts";
import { ErrorBoundary } from "../ErrorBoundary.tsx";

const LazyViewer = React.lazy(() => import("react-json-view"));

const ViewProviderData = ({ provider, onClose }) => {
  const [json, setJson] = useState(null);

  useEffect(() => {
    if (provider) {
      const fn = provider.mockFn ? provider.mockFn : provider.dataFn;
      fn().then((data) => setJson(data));
    }
  }, [provider]);

  if (!provider) return null;

  return (
    <Dialog onOpenChange={(open) => (!open ? onClose() : "")} defaultOpen={true}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Data Provider: {provider.name}</DialogTitle>
          <DialogDescription>{provider.description}</DialogDescription>
        </DialogHeader>
        <ErrorBoundary>
          <LazyViewer
            style={{ maxHeight: "80vh", overflowY: "auto" }}
            name={provider.providerKey}
            enableClipboard={false}
            displayObjectSize={false}
            displayDataTypes={false}
            src={json}
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
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure, you want to remove <span className="text-blue-500">{name}</span> provider?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Your data provider will be removed from this page and all added data binding will be not visible on blocks.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onRemove} className="bg-red-600 hover:bg-red-700">
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const PageDataProviders = () => {
  const providersList = useMemo(() => getChaiDataProviders(), []);
  const [dataProviders, setChaiProviders] = usePageDataProviders();
  const [, setSyncState] = useAtom(pageSyncStateAtom);

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
    setSyncState("UNSAVED");
  };

  const removeProvider = (provider) => {
    setProviders((prev) => filter(prev, (p) => p.providerKey !== provider.providerKey));
    setChaiProviders((prev) => filter(prev, (p) => p.providerKey !== provider.providerKey));
    setSyncState("UNSAVED");
  };

  const viewData = (p) => setViewer(p);

  if (isEmpty(providersList))
    return (
      <div>
        <p className="text-gray-500 mb-1.5 text-xs p-4">
          You have no data providers registered. Please add a data provider to your project. <br />
          <a className="text-blue-500" href="https://chaibuilder.com/docs/registering-data-providers" target={"_blank"}>
            Learn more
          </a>
        </p>
      </div>
    );

  return (
    <div className="px-1">
      <br />
      <label>
        <p className="text-gray-500 mb-1.5 text-xs">Add data providers:</p>
      </label>
      <div className="flex items-center space-x-1">
        <Select value={provider} onValueChange={(value) => addProvider(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Choose</SelectItem>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <br />

      <div className={`border-t ${providers.length ? "block" : "hidden"}`}>
        <p className="text-gray-500 pt-4 pb-1.5 text-xs flex-1 font-medium">Page data providers:</p>
        <div className="space-y-2">
          {providers.map((dataProvider) => (
            <div
              key={dataProvider.providerKey}
              className="rounded-lg border bg-card text-card-foreground shadow-sm w-full"
              data-v0-t="card">
              <div className="flex flex-col space-y-1.5 px-4 pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium leading-4">{dataProvider.name}</h3>
                    <p className="text-xs text-gray-400 pt-1">{dataProvider.description}</p>
                  </div>
                </div>
              </div>
              <div className="items-center p-2 py-2 flex justify-between">
                <button
                  onClick={() => viewData(dataProvider)}
                  className="inline-flex items-center justify-center text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 underline-offset-4 hover:underline h-9 rounded-md px-3 text-blue-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="w-4 h-4 mr-2">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  View Data
                </button>
                <RemoveProviderConfirmation onRemove={() => removeProvider(dataProvider)} name={dataProvider.name}>
                  <button className="inline-flex items-center justify-center text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 underline-offset-4 hover:underline h-9 rounded-md px-3 text-red-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="w-4 h-4 mr-2">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                    Remove
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
