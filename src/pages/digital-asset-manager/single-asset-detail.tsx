"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "@chaibuilder/sdk";
import { Button, Label, Textarea } from "@chaibuilder/sdk/ui";
import {
  ChevronLeft,
  Loader,
  Pencil,
  AlertCircle,
  Copy,
  Link,
} from "lucide-react";
import { toast } from "sonner";
import type { Asset } from "./use-assets";
import { useAsset } from "./use-assets";


// Helper functions
function formatFileSize(_bytes: number): string {
  const bytes = isNaN(_bytes)
    ? 0
    : typeof _bytes === "number"
      ? _bytes
      : parseInt(_bytes);
  if (!bytes) return "0 B";
  if (bytes < 1024) {
    return `${bytes.toFixed(2)} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}

function formatDate(dateString: string): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// * Check if the description is not the same as the previous description
function isNotSameDescription(description: string, asset: Asset) {
  let currentDescription = description;
  let previousDescription = asset?.description;
  if (!previousDescription || typeof previousDescription !== "string")
    previousDescription = "";
  if (!currentDescription || typeof currentDescription !== "string")
    currentDescription = "";

  return currentDescription !== previousDescription;
}

export type SingleAssetDetailProps = {
  assetId?: string;
  onBack: () => void;
  onEdit: (asset: Asset) => void;
  onSave: (description: string) => Promise<void>;
  isSaving: boolean;
};

export const SingleAssetDetail = ({
  assetId,
  onBack,
  onEdit,
  onSave,
  isSaving,
}: SingleAssetDetailProps) => {
  const { t } = useTranslation();
  const { data: asset, isLoading, isError } = useAsset(assetId || "");
  const [description, setDescription] = useState("");
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = asset?.url || "";
    img.onload = () => setIsImageLoaded(true);
    return () => {
      img.onload = null;
    };
  }, [asset]);

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("{{type}} copied to clipboard", { type }));
    } catch (error: any) {
      toast.error(t("Failed to copy {{type}}", { type }), {
        description: error?.message,
      });
    }
  };

  // Update description when asset changes
  React.useEffect(() => {
    if (asset?.description) {
      setDescription(asset.description);
    }
  }, [asset]);

  if (isLoading || !isImageLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError || !asset?.id) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t("No Asset Found")}
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {isError
              ? t("There was an error loading the asset. Please try again later.")
              : t("The asset you're looking for doesn't exist or has been removed.")}
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={onBack}>
              {t("Back to Assets")}
            </Button>
            {isError && (
              <Button
                variant="default"
                onClick={() => window.location.reload()}
              >
                {t("Try Again")}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-y-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          disabled={isSaving}
        >
          <ChevronLeft className="h-4 w-4" />
          {t("Back to Assets")}
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} disabled={isSaving}>
            {t("Cancel")}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleCopy(asset.url, t("Asset URL"))}
            disabled={isSaving}
          >
            <Copy className="h-4 w-4 mr-2" />
            {t("Copy URL")}
          </Button>
          <Button
            variant="default"
            onClick={() => onEdit(asset)}
            disabled={isSaving}
          >
            <Pencil className="h-4 w-4" />
            {t("Edit Image")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 items-start gap-6 flex-1 overflow-hidden">
        <div className="relative h-[calc(80vh-200px)] w-full flex items-start justify-center">
          <img
            src={asset.url}
            alt={asset.name}
            className="w-full h-full object-contain rounded-lg max-h-max max-w-max"
          />
        </div>

        <div className="space-y-6">
          <div className="grid gap-3 border rounded-md pt-2 bg-gray-100">
            <Label className="w-full text-center">{t("Details")}</Label>
            <div className="grid grid-cols-1 gap-2 text-sm border rounded-md p-2 bg-white">
              {[
                { label: t("File Name"), value: asset.name },
                { label: t("Type"), value: asset.type, capitalize: true },
                {
                  label: t("Format"),
                  value: asset.metadata?.format || asset.type,
                  capitalize: true,
                },
                {
                  label: t("Size"),
                  value: formatFileSize(asset.size),
                },
                {
                  label: t("Dimensions"),
                  value: `${asset.width || 0} × ${asset.height || 0}`,
                },
                {
                  label: t("Created"),
                  value: formatDate(asset.createdAt),
                },
                {
                  label: t("Updated"),
                  value: formatDate(
                    asset.metadata?.updatedAt || asset?.updatedAt || asset.createdAt
                  ),
                },
                {
                  label: t("URL"),
                  value: asset.url,
                  copyable: true,
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <Label className="w-max text-left px-2 w-1/4 font-normal text-gray-700">
                    {item.label}
                  </Label>
                  :
                  <div className="flex items-center gap-2">
                    <div
                      className={
                        "w-max text-left font-medium text-gray-900" +
                        (item.capitalize ? " capitalize" : "")
                      }
                    >
                      {item.value}
                    </div>
                    {item.copyable && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopy(item.value, item.label)}>
                        <Link className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {asset.usedOn && asset.usedOn.length > 0 && (
            <div className="grid gap-3">
              <Label>{t("Used On")}</Label>
              <div className="grid grid-cols-1 gap-2 text-sm border rounded-md p-2">
                {asset.usedOn.map((page, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-max text-left font-medium text-gray-900">
                      {page.name}
                    </div>
                    <div className="text-gray-500">({page.slug})</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-3 border rounded-md pt-2 bg-gray-100 relative">
            <Label className="w-full text-center">{t("Description")}</Label>
            <Textarea
              id="description"
              value={description}
              placeholder={t("Enter a description for the asset")}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={isSaving}
              className="hover:border-black/40 bg-white"
            />
            <div className="flex justify-end items-start absolute top-1.5 right-2">
              <button
                type="button"
                onClick={() => onSave(description)}
                disabled={isSaving || !isNotSameDescription(description, asset)}
                className={`py-0 bg-blue-500 text-white px-3 py-0.5 rounded-md text-sm ${
                  isSaving || !isNotSameDescription(description, asset)
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    {t("Saving...")}
                  </>
                ) : (
                  t("Save")
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
