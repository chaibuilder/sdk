"use client";

import { Label } from "@/components/ui/label";
import { SiteData } from "@/types/types";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { ImagePicker } from "@/pages/digital-asset-manager/image-picker";

interface BrandingProps {
  data: SiteData;
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
        logoURL: asset.url,
        logoId: asset.id,
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
        faviconURL: asset.url,
        faviconId: asset.id,
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
            assetId={(baseline?.settings as any)?.logoId}
            assetUrl={baseline?.settings?.logoURL}
            onChange={handleLogoChange}
            placeholder={t("Select a logo")}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">{t("Favicon")}</Label>
          <ImagePicker
            assetId={(baseline?.settings as any)?.faviconId}
            assetUrl={baseline?.settings?.faviconURL}
            onChange={handleFaviconChange}
            placeholder={t("Select a favicon")}
          />
        </div>
      </div>
    </section>
  );
}
