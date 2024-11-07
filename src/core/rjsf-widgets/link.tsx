import { FieldProps } from "@rjsf/utils";
import { map, split, get, isEmpty, debounce } from "lodash-es";
import { useEffect, useState, useCallback } from "react";
import { useBuilderProp, useTranslation } from "../hooks";
import { SearchIcon } from "lucide-react";
import { CollectionItem } from "../types/chaiBuilderEditorProps";

const CollectionField = ({
  formData,
  collections,
  onChange,
}: {
  formData: { href: string };
  collections: any[];
  onChange: FieldProps["onChange"];
}) => {
  const { t } = useTranslation();
  const searchCollectionItems = useBuilderProp("searchCollectionItems", (_: string, __: any) => []);

  const [loading, setLoading] = useState("");
  const [collection, setCollection] = useState("pages");
  const [searchQuery, setSearchQuery] = useState("");
  const [collectionItems, setCollectionsItems] = useState<CollectionItem[]>([]);

  const currentCollectionName = collections?.find((_collection) => _collection.key === collection)?.name;

  useEffect(() => {
    const initHref = split(formData?.href || "", ":");
    const _collection = get(initHref, 1, "pages") || "pages";
    setCollection(_collection);
    setSearchQuery("");
    setCollectionsItems([]);

    (async () => {
      setLoading("FETCHING_INIT_VALUE");
      const initalValue = await searchCollectionItems(_collection, [get(initHref, 2, "pages")]);
      if (initalValue && Array.isArray(initalValue)) {
        setSearchQuery(get(initalValue, [0, "name"], ""));
      }
      setLoading("");
    })();
  }, [formData.href]);

  const getCollectionItems = useCallback(
    debounce(async (query: string) => {
      if (isEmpty(query)) {
        setCollectionsItems([]);
      } else {
        const collectionItemResponse = await searchCollectionItems(collection, query);
        setCollectionsItems(collectionItemResponse);
      }
      setLoading("");
    }, 300),
    [collection],
  );

  const handleSelect = (collectionItem: CollectionItem) => {
    const href = ["collection", collection, collectionItem.id];
    if (!href[1]) return;
    onChange({ ...formData, href: href.join(":") });
  };

  return (
    <div>
      <select name="collection" value={collection} onChange={(e) => setCollection(e.target.value)}>
        {map(collections, (col) => (
          <option key={col.key} value={col.key}>
            {col.name}
          </option>
        ))}
      </select>
      {collection && (
        <div className="group relative mt-2 flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setLoading("FETCHING_COLLECTION_ITEMS");
              getCollectionItems(e.target.value);
            }}
            placeholder={t(`Search ${currentCollectionName}`)}
            disabled={loading === "FETCHING_INIT_VALUE"}
            className="w-full rounded-md border border-gray-300 p-2"
          />
          <SearchIcon className="absolute right-2 top-2 hidden h-5 w-5 pt-0.5 text-gray-400 group-hover:block" />
        </div>
      )}
      {loading === "FETCHING_COLLECTION_ITEMS" ? (
        <div className="space-y-1 pt-2">
          <div className="h-6 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-6 w-full animate-pulse rounded bg-gray-200" />
        </div>
      ) : (
        !isEmpty(collectionItems) && (
          <ul className="mt-2 max-h-40 overflow-y-auto rounded-md border border-gray-300">
            {map(collectionItems?.slice(0, 20), (item) => (
              <li
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`cursor-pointer p-2 text-xs ${formData?.href?.includes(item.id) ? "bg-blue-200" : "hover:bg-gray-100"}`}>
                {item.name} {item.slug && <small className="font-light text-gray-500">( {item.slug} )</small>}
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
};

const LinkField = ({ schema, formData, onChange }: FieldProps) => {
  const { t } = useTranslation();
  const { type = "page", href = "#", target = "self" } = formData;
  const collections = useBuilderProp("collections", []);

  return (
    <div>
      <span className="text-xs font-medium">{schema?.title ?? "Link"}</span>
      <div className="flex flex-col gap-y-1.5">
        <select name="type" value={type} onChange={(e) => onChange({ ...formData, type: e.target.value })}>
          {map(
            [
              ...(!isEmpty(collections) ? [{ const: "collection", title: t("Goto Page") }] : []),
              { const: "url", title: t("Open URL") },
              { const: "email", title: t("Compose Email") },
              { const: "telephone", title: t("Call Phone") },
              { const: "scroll", title: t("Scroll to element") },
            ],
            (opt) => (
              <option key={opt.const} value={opt.const}>
                {opt.title}
              </option>
            ),
          )}
        </select>
        {type === "collection" && !isEmpty(collections) ? (
          <CollectionField formData={formData} collections={collections} onChange={onChange} />
        ) : (
          <input
            autoCapitalize={"off"}
            autoCorrect={"off"}
            spellCheck={"false"}
            name="href"
            type="text"
            value={href}
            onChange={(e) => onChange({ ...formData, href: e.target.value })}
            placeholder={t(
              type === "page" || type === "url" ? "Enter URL" : type === "scroll" ? "#ElementID" : "Enter detail",
            )}
          />
        )}
        {type === "url" && (
          <div className="flex items-center gap-x-2 text-muted-foreground">
            <input
              autoCapitalize={"off"}
              autoCorrect={"off"}
              spellCheck={"false"}
              type="checkbox"
              defaultChecked={target === "_blank"}
              className="!w-fit cursor-pointer rounded-md border border-border"
              onChange={() => onChange({ ...formData, target: target === "_blank" ? "_self" : "_blank" })}
            />
            <span className="pt-1 text-xs">{t("Open in new tab")}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export { LinkField };
