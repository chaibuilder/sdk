"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SiteData } from "@/types/types";
import { useTranslation } from "react-i18next";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

// List of social networking sites
const SOCIAL_PLATFORMS = [
  { value: "facebook", label: "Facebook", placeholder: "https://facebook.com/yourpage" },
  { value: "twitter", label: "Twitter/X", placeholder: "https://twitter.com/yourusername" },
  { value: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourusername" },
  { value: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/yourprofile" },
  { value: "youtube", label: "YouTube", placeholder: "https://youtube.com/@yourchannel" },
  { value: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@yourusername" },
  { value: "github", label: "GitHub", placeholder: "https://github.com/yourusername" },
];

interface SocialLinksProps {
  data: SiteData;
  onChange: (links: any) => void;
}

function SocialLinks({ data, onChange }: SocialLinksProps) {
  const { t } = useTranslation();
  const [selectedPlatform] = useState("");
  const [newValue, setNewValue] = useState("");
  const [socialLinks, setSocialLinks] = useState(data?.settings?.socialLinks ?? {});
  const [canAddNew, setCanAddNew] = useState(false);

  const getPlatformInfo = (key: string) => {
    return SOCIAL_PLATFORMS.find((platform) => platform.value === key);
  };

  const removeSocialLink = (key: string) => {
    let updatedSocialLinks = { ...socialLinks };
    delete updatedSocialLinks[key];
    setSocialLinks(updatedSocialLinks);
    onChange(updatedSocialLinks as any);
  };

  const availablePlatforms = SOCIAL_PLATFORMS.filter((platform) => !socialLinks[platform.value]);

  const isAddEnabled = Object.values(data?.settings?.socialLinks ?? {}).filter((value) => !value).length === 0;

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">{t("Social Links")}</Label>
      <div className="space-y-2">
        {Object.keys(socialLinks || {}).map((key, index) => {
          const platformInfo = getPlatformInfo(key);
          const availableForEdit = SOCIAL_PLATFORMS.filter(({ value }) => value === key || !socialLinks[value]);
          const item = { key, value: socialLinks[key] };

          return (
            <div key={index} className="flex items-center gap-2">
              <Select
                value={item.key}
                onValueChange={(newKey) => {
                  const updatedSocialLinks = { ...socialLinks };
                  delete updatedSocialLinks[item.key];
                  updatedSocialLinks[newKey] = item.value;
                  setSocialLinks(updatedSocialLinks);
                  onChange(updatedSocialLinks);
                }}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t("Select platform")} />
                </SelectTrigger>
                <SelectContent>
                  {availableForEdit.map((platform) => (
                    <SelectItem key={platform.value} value={platform.value}>
                      {platform.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={item.value}
                onChange={(e) => {
                  const val = e?.target?.value?.trim();
                  setSocialLinks({
                    ...socialLinks,
                    [item.key]: val,
                  });
                  onChange({ ...data.settings.socialLinks, [item.key]: val });
                }}
                placeholder={platformInfo?.placeholder || t("Enter URL")}
                className="flex-1"
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeSocialLink(key)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}

        {availablePlatforms.length > 0 && canAddNew && isAddEnabled && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Select
                value={selectedPlatform}
                onValueChange={(value) => {
                  setSocialLinks({
                    ...socialLinks,
                    [value]: "",
                  });
                  onChange({ ...data.settings.socialLinks, [value]: "" });
                  setCanAddNew(false);
                }}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t("Add platform")} />
                </SelectTrigger>
                <SelectContent>
                  {availablePlatforms.map((platform) => (
                    <SelectItem key={platform.value} value={platform.value}>
                      {platform.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder={t("Enter URL")}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                disabled={true}
                className="flex-1"
              />
            </div>
          </div>
        )}
        {Object.keys(socialLinks || {}).length < SOCIAL_PLATFORMS.length && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCanAddNew(true)}
            disabled={!isAddEnabled || canAddNew}
            className="mt-1">
            <Plus /> {t("Add Link")}
          </Button>
        )}
      </div>
    </div>
  );
}

interface ContactSocialProps {
  data: SiteData;
  onChange?: (updates: any) => void;
}

export default function ContactSocial({ data, onChange }: ContactSocialProps) {
  const { t } = useTranslation();
  const [baseline, setBaseline] = useState<SiteData>(data);

  const handleInputChange = (field: "email" | "phone" | "address", value: string) => {
    if (!onChange) return;

    const updates = {
      ...(data || {}),
      settings: {
        ...(data?.settings || {}),
        [field]: value,
      },
    };
    setBaseline(updates);
    onChange(updates);
  };

  const handleSocialLinksChange = (socialLinks: any) => {
    if (!onChange) return;

    onChange({
      settings: {
        ...data.settings,
        socialLinks: socialLinks,
      },
    });
  };

  return (
    <div className="space-y-6 pb-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            {t("Email")}
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="contact@example.com"
            value={baseline?.settings?.email || ""}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            {t("Phone")}
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={baseline?.settings?.phone || ""}
            onChange={(e) => handleInputChange("phone", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium">
            {t("Address")}
          </Label>
          <Input
            id="address"
            placeholder="123 Main St, City, Country"
            value={baseline?.settings?.address || ""}
            onChange={(e) => handleInputChange("address", e.target.value)}
          />
        </div>

        <SocialLinks data={data} onChange={handleSocialLinksChange} />
      </div>
    </div>
  );
}
