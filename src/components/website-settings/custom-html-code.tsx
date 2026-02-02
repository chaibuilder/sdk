"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WebsiteSettings } from "@/types/types";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface CustomHtmlProps {
  data: WebsiteSettings;
  onChange: (updates: any) => void;
}

export default function CustomHtmlCode({ data, onChange }: CustomHtmlProps) {
  const { t } = useTranslation();
  const [baseline, setBaseline] = useState(data);

  const handleChange = (updates: any) => {
    setBaseline(updates);
    onChange(updates);
  };

  return (
    <section id="custom-html" className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="headHTML" className="text-xs">
          {t("Head HTML")}
        </Label>
        <p className="mb-2 text-xs text-muted-foreground">
          {t("Add custom HTML that will be inserted into the <head> section of your website")}
        </p>
        <Textarea
          id="headHTML"
          className="resize-none"
          value={baseline?.settings?.headHTML || ""}
          placeholder="<script>...</script> or <meta>...</meta> or <link>...</link>"
          onChange={(e) =>
            handleChange?.({
              ...(data || {}),
              settings: { ...(data?.settings || {}), headHTML: e.target.value },
            })
          }
          rows={8}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="footerHTML" className="text-xs">
          {t("Footer HTML")}
        </Label>
        <p className="mb-2 text-xs text-muted-foreground">
          {t("Add custom HTML that will be inserted before the closing </body> tag")}
        </p>
        <Textarea
          id="footerHTML"
          className="resize-none"
          value={baseline?.settings?.footerHTML || ""}
          placeholder="<script>...</script> or other HTML elements"
          onChange={(e) =>
            handleChange?.({
              ...(data || {}),
              settings: { ...(data?.settings || {}), footerHTML: e.target.value },
            })
          }
          rows={8}
        />
      </div>
    </section>
  );
}
