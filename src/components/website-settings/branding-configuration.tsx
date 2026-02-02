"use client";

import { Label } from "@/components/ui/label";
import type { WebsiteSettings } from "@/types/types";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { ImagePicker } from "@/pages/digital-asset-manager/image-picker";

interface BrandingProps {
  data: WebsiteSettings;
  onChange: (updates: any) => void;
}

export default function BrandingConfiguration({ data, onChange }: BrandingProps) {
  const { t } = useTranslation();

  const [baseline, setBaseline] = useState(data);

  const handleLogoChange = (asset: { url: string; id: string }) => {
    const updates = {
      ...(baseline || {}),
      settings: {
        ...(baseline?.settings || {}),
        logo: { url: asset.url, id: asset.id },
      },
    };

    setBaseline(updates);
    onChange(updates);
  };

  const handleFaviconChange = (asset: { url: string; id: string }) => {
    const updates = {
      ...(baseline || {}),
      settings: {
        ...(baseline?.settings || {}),
        favicon: { url: asset.url, id: asset.id },
      },
    };

    setBaseline(updates);
    onChange(updates);
  };

  return (
    <section id="branding">
      <div className="space-y-4">
        <div className="space-y-1">
          <Label className="text-xs">{t("Logo")}</Label>
          <ImagePicker
            assetId={baseline?.settings?.logo?.id}
            assetUrl={baseline?.settings?.logo?.url}
            onChange={handleLogoChange}
            placeholder={t("Select a logo")}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">{t("Favicon")}</Label>
          <ImagePicker
            assetId={baseline?.settings?.favicon?.id}
            assetUrl={baseline?.settings?.favicon?.url}
            onChange={handleFaviconChange}
            placeholder={t("Select a favicon")}
          />
        </div>
      </div>
    </section>
  );
}
