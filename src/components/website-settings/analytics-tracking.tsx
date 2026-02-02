"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WebsiteSettings } from "@/types/types";
import { useTranslation } from "react-i18next";
import { useState } from "react";

interface AnalyticsTrackingProps {
  data: WebsiteSettings;
  onChange: (updates: any) => void;
}

export default function AnalyticsTracking({ data, onChange }: AnalyticsTrackingProps) {
  const { t } = useTranslation();
  const [baseline, setBaseline] = useState(data);

  const handleChange = (updates: any) => {
    setBaseline(updates);
    onChange(updates);
  };

  return (
    <section id="analytics-tracking" className="space-y-4 pb-4">
      <div className="space-y-1">
        <Label htmlFor="googleAnalyticsId" className="text-xs">
          {t("Google Analytics ID")}
        </Label>
        <Input
          id="googleAnalyticsId"
          value={baseline?.settings?.googleAnalyticsId || ""}
          placeholder="eg: UA-XXXXXX"
          onChange={(e) =>
            handleChange?.({
              ...(data || {}),
              settings: { ...(data?.settings || {}), googleAnalyticsId: e.target.value },
            })
          }
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="googleTagManagerId" className="text-xs">
          {t("Google Tag Manager ID")}
        </Label>
        <Input
          id="googleTagManagerId"
          value={baseline?.settings?.googleTagManagerId || ""}
          placeholder="eg: GTM-XXXXXX"
          onChange={(e) =>
            handleChange?.({
              ...(data || {}),
              settings: { ...(data?.settings || {}), googleTagManagerId: e.target.value },
            })
          }
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="metaPixelId" className="text-xs">
          {t("Meta Pixel ID")}
        </Label>
        <Input
          id="metaPixelId"
          value={baseline?.settings?.metaPixelId || ""}
          placeholder="eg: XXXXXX"
          onChange={(e) =>
            handleChange?.({
              ...(data || {}),
              settings: { ...(data?.settings || {}), metaPixelId: e.target.value },
            })
          }
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="tiktokPixelId" className="text-xs">
          {t("TikTok Pixel ID")}
        </Label>
        <Input
          id="tiktokPixelId"
          value={baseline?.settings?.tiktokPixelId || ""}
          placeholder="eg: XXXXXX"
          onChange={(e) =>
            handleChange?.({
              ...(data || {}),
              settings: { ...(data?.settings || {}), tiktokPixelId: e.target.value },
            })
          }
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="linkedinInsightId" className="text-xs">
          {t("LinkedIn Insight Tag ID")}
        </Label>
        <Input
          id="linkedinInsightId"
          value={baseline?.settings?.linkedinInsightId || ""}
          placeholder="eg: XXXXXX"
          onChange={(e) =>
            handleChange?.({
              ...(data || {}),
              settings: { ...(data?.settings || {}), linkedinInsightId: e.target.value },
            })
          }
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="microsoftUetId" className="text-xs">
          {t("Microsoft UET Tag ID")}
        </Label>
        <Input
          id="microsoftUetId"
          value={baseline?.settings?.microsoftUetId || ""}
          placeholder="eg: XXXXXX"
          onChange={(e) =>
            handleChange?.({
              ...(data || {}),
              settings: { ...(data?.settings || {}), microsoftUetId: e.target.value },
            })
          }
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="xPixelId" className="text-xs">
          {t("X Pixel ID (Twitter)")}
        </Label>
        <Input
          id="xPixelId"
          value={baseline?.settings?.xPixelId || ""}
          placeholder="eg: XXXXXX"
          onChange={(e) =>
            handleChange?.({
              ...(data || {}),
              settings: { ...(data?.settings || {}), xPixelId: e.target.value },
            })
          }
        />
      </div>
    </section>
  );
}
