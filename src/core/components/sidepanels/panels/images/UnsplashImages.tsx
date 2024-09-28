import React, { useEffect, useState } from "react";
import { isEmpty } from "lodash-es";
import { createApi } from "unsplash-js";
import { Button, Input, ScrollArea } from "../../../../../ui";
import { useBuilderProp } from "../../../../hooks";
import { useDebouncedState } from "@react-hookz/web";
import { Loader } from "lucide-react";
import ChaiSelect from "../../../ChaiSelect.tsx";
import { useTranslation } from "react-i18next";

// eslint-disable-next-line react-refresh/only-export-components
export const fetchImage = async (payload: any, accessKey: string) =>
  new Promise((resolve, reject) => {
    const unsplash = createApi({ accessKey });
    unsplash.search
      .getPhotos(payload)
      .then((result) => {
        resolve(result);
      })
      .catch((error) => reject(error));
  });

const UnsplashImages = ({ isModalView, onSelect }: { isModalView: boolean; onSelect: (_url: string) => void }) => {
  const unsplashAccessKey = useBuilderProp("unsplashAccessKey", "");
  const [images, setImages] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [orientation, setOrientation] = useState<undefined | "landscape" | "portrait" | "squarish">();
  const [color, setColor] = useState<string>();
  const [totalPages, setTotalPages] = useState(0);
  const [debouncedQuery, setDebouncedQuery] = useDebouncedState("", 1000);
  const [isFetching, setIsFetching] = useState(false);
  const { t } = useTranslation();
  const searchPhotos = async (event?: React.FormEvent) => {
    if (isEmpty(debouncedQuery)) return;

    let currentPage = page + 1;
    if (event) {
      event.preventDefault();
      currentPage = 1;
    }
    setIsFetching(true);
    setPage(currentPage);
    const payload: any = { query: debouncedQuery as string, page: currentPage };
    if (orientation) payload.orientation = orientation;
    if (color) payload.color = color;

    fetchImage(payload, unsplashAccessKey)
      .then((result: any) => {
        if (currentPage === 1) setImages(result?.response?.results || []);
        else setImages([...images, ...(result?.response?.results || [])]);
        setTotalPages(result?.response?.total_pages);
        setIsFetching(false);
      })
      .catch(() => {
        setIsFetching(false);
      });
  };

  useEffect(() => {
    if (!isEmpty(debouncedQuery) && unsplashAccessKey) {
      setIsFetching(true);
      const payload: any = { query: debouncedQuery as string, page: 1 };
      if (orientation) payload.orientation = orientation;
      if (color) payload.color = color;
      setPage(1);

      fetchImage(payload, unsplashAccessKey)
        .then((result: any) => {
          setImages(result?.response?.results || []);
          setTotalPages(result?.response?.total_pages);
          setIsFetching(false);
        })
        .catch(() => {
          setIsFetching(false);
        });
    }
  }, [orientation, color, debouncedQuery, unsplashAccessKey]);

  if (isEmpty(unsplashAccessKey)) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p className="max-w-3xl text-center text-gray-500">
          To enable Unsplash, kindly provide your
          <a
            href="https://unsplash.com/documentation#public-authentication"
            className="px-1 underline hover:text-blue-400"
            target="_blank"
            rel="noopener noreferrer">
            Unsplash Access Key
          </a>
        </p>
      </div>
    );
  }

  return (
    <>
      <form className="flex items-center gap-x-2 rounded-md border border-border bg-background p-px">
        <Input
          type="text"
          name="query"
          className="text-foreground"
          placeholder={`Try "dog" or "apple"`}
          onChange={(e) => setDebouncedQuery(e.target.value)}
        />
        <div>
          <ChaiSelect
            className="w-40"
            placeholder={t("Orientation")}
            options={[
              {
                value: "",
                label: "All",
              },
              {
                value: "landscape",
                label: "Landscape",
              },
              {
                value: "portrait",
                label: "Portrait",
              },
              {
                value: "squarish",
                label: "Square",
              },
            ]}
            defaultValue={orientation}
            onValueChange={(_v) => setOrientation(_v as any)}
          />
        </div>
        <div>
          <ChaiSelect
            placeholder={t("Color")}
            options={[
              {
                value: "",
                label: "All",
              },
              {
                value: "black_and_white",
                label: "Black and White",
              },
              {
                value: "black",
                label: "Black",
              },
              {
                value: "white",
                label: "White",
              },
              {
                value: "night",
                label: "Night",
              },
              {
                value: "warm",
                label: "Warm",
              },
              {
                value: "cool",
                label: "Cool",
              },
              {
                value: "sepia",
                label: "Sepia",
              },
            ]}
            defaultValue={color}
            onValueChange={(_v) => setColor(_v as any)}
          />
        </div>
      </form>
      <ScrollArea
        className={`h-full ${
          isModalView && !isEmpty(images) ? "-mx-2 flex flex-wrap px-2" : "-mx-2 flex flex-col pb-8 pt-2"
        }`}>
        {isEmpty(images) && !isFetching && (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="font-medium">No Data</div>
            <div className="text-sm text-gray-500">Enter query and press enter</div>
          </div>
        )}
        {isModalView ? (
          <div className="h-full columns-5 py-2">
            {images.map((pic) => (
              <div
                role="button"
                tabIndex={0}
                className="my-1 flex"
                key={pic.id}
                onClick={() => onSelect(pic.urls.regular)}>
                <div className="relative overflow-hidden rounded-md bg-cover bg-no-repeat">
                  <img
                    className="h-auto flex-1 cursor-pointer rounded-md transition duration-300 ease-in-out hover:scale-105"
                    alt={pic.alt_description}
                    src={pic.urls.small}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          images.map((pic) => (
            // TODO: Drag and Drop Image to Canvas from Here use `pic.urls.[small, regular, full]` for image quality
            <div className="w-full px-2 py-1" key={pic.id}>
              <div className="relative overflow-hidden rounded-md bg-cover bg-no-repeat">
                <img
                  className="h-auto cursor-pointer transition duration-300 ease-in-out hover:scale-105"
                  alt={pic.alt_description}
                  src={pic.urls.small}
                />
              </div>
            </div>
          ))
        )}
        {isFetching && (
          <div className="flex items-center justify-center py-8">
            <Loader className="h-6 w-6 animate-spin" /> &nbsp;Loading...
          </div>
        )}
        {!isEmpty(images) && page < totalPages && !isFetching && (
          <Button
            size="sm"
            variant="link"
            className="w-full"
            onClick={() => searchPhotos(undefined)}
            disabled={isFetching}>
            {isFetching ? "" : "Load More"}
          </Button>
        )}
      </ScrollArea>
    </>
  );
};

export default UnsplashImages;
