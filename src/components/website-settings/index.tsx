"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SiteData } from "@/types/types";
import { useQueryClient } from "@tanstack/react-query";
import { omit } from "lodash";
import { Activity, Code, ImageIcon, Loader, Settings, Settings2, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import AnalyticsTracking from "./analytics-tracking";
import BrandingConfiguration from "./branding-configuration";
import ContactSocial from "./contact-social";
import CustomHtml from "./custom-html-code";
import General from "./general";
import SaveButton from "./save-button";
import { UnsavedChangesDialog } from "./unsaved-changes-dialog";
import { useTranslation } from "react-i18next";
import { useSavePage } from "@/hooks/use-save-page";
import { useWebsiteSetting } from "@/pages/hooks/project/use-website-settings";

const getSidebarItems = (t: any) => [
  { id: "general", label: t("General"), icon: Settings, component: General },
  { id: "branding", label: t("Branding"), icon: ImageIcon, component: BrandingConfiguration },
  { id: "contact-social", label: t("Contact & Social"), icon: Share2, component: ContactSocial },
  { id: "analytics-tracking", label: t("Analytics Tracking"), icon: Activity, component: AnalyticsTracking },
  { id: "custom-html", label: t("Custom HTML"), icon: Code, component: CustomHtml },
];

/**
 * Website settings content component
 * @param params websiteId
 */
function WebsiteSettingsContent({
  initialData,
  setinitialData,
  isDataChange,
  setIsDataChange,
}: {
  initialData: any;
  setinitialData: (value: any) => void;
  isDataChange: boolean;
  setIsDataChange: (value: boolean) => void;
}) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("general");
  const [showTabChangeDialog, setShowTabChangeDialog] = useState(false);
  const [pendingTabChange, setPendingTabChange] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const SIDEBAR_ITEMS = getSidebarItems(t);
  const { data, isLoading } = useWebsiteSetting();

  useEffect(() => {
    if (data) {
      setinitialData(data);
    }
  }, []);

  const updateSiteDataLocally = (updates: Partial<SiteData>) => {
    queryClient.setQueryData(["GET_WEBSITE_DRAFT_SETTINGS"], (prevData: SiteData) => {
      return prevData
        ? {
            ...prevData,
            ...omit(updates, "settings"),
            ...{ settings: { ...(prevData.settings || {}), ...(updates?.settings || {}) } },
          }
        : prevData;
    });
  };

  useEffect(() => {
    if (!data?.settings || !initialData) return;
    const isDataChanged = JSON.stringify(data) !== JSON.stringify(initialData);
    setIsDataChange(isDataChanged);
  }, [data, initialData, setIsDataChange]);

  const handleTabChange = (newTab: string) => {
    if (isDataChange && newTab !== activeTab) {
      // If there are unsaved changes, show confirmation dialog
      setPendingTabChange(newTab);
      setShowTabChangeDialog(true);
    } else {
      // No unsaved changes, switch immediately
      setActiveTab(newTab);
    }
  };

  const handleConfirmTabChange = () => {
    if (pendingTabChange) {
      setActiveTab(pendingTabChange);
    }
    updateSiteDataLocally(initialData);
    setShowTabChangeDialog(false);
    setPendingTabChange(null);
    setIsDataChange(false);
  };

  const handleCancelTabChange = () => {
    setShowTabChangeDialog(false);
    setPendingTabChange(null);
  };

  const activeItem = SIDEBAR_ITEMS.find((item) => item.id === activeTab);
  const Icon = activeItem?.icon;
  const Component = activeItem?.component;

  if (isLoading || !data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <Loader className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="flex overflow-hidden">
        <div className="bg-sidebar border-sidebar-border h-full w-52 border-r pr-2">
          <h2 className="text-sidebar-foreground px-2 pt-1 font-semibold">{t("Website Settings")}</h2>
          <div className="px-2 text-xs text-primary">{data?.name}</div>

          <nav className="pt-6">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;

              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => handleTabChange(item.id)}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>
        {isLoading ? (
          <div className="flex flex-1 flex-col items-center justify-center">
            <Loader className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex flex-1 flex-col">
            <div className="flex items-center justify-between gap-x-2 px-6 pb-4">
              <div className="flex items-center gap-x-2">
                {Icon && <Icon className="h-5 w-5" />}
                <h2 className="font-semibold">{activeItem?.label}</h2>
              </div>
            </div>
            <div
              className="no-scrollbar h-full overflow-y-auto scroll-smooth px-6"
              style={{ scrollBehavior: "smooth" }}>
              <ErrorBoundary
                fallback={
                  <div className="p-10 text-center text-red-500">{t("Something went wrong, Please try again")}</div>
                }>
                {Component && <Component data={data as unknown as SiteData} onChange={updateSiteDataLocally} />}
              </ErrorBoundary>
              <div className="h-16" />
            </div>

            {Component && (
              <div className="flex items-center gap-x-4 border-t px-6 pt-4">
                <SaveButton
                  data={data as unknown as SiteData}
                  hasChanges={isDataChange}
                  showSave={true}
                  onSaveSuccess={(newData) => setinitialData(newData)}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tab Change Confirmation Dialog */}
      <UnsavedChangesDialog
        open={showTabChangeDialog}
        onOpenChange={setShowTabChangeDialog}
        onCancel={handleCancelTabChange}
        onConfirm={handleConfirmTabChange}
        description={t("You have unsaved changes. Are you sure you want to switch tabs without saving?")}
        confirmText={t("Switch without saving")}
      />
    </>
  );
}

/**
 * Website settings modal component
 * @param params websiteId
 */
const WebsiteSettingsModal = ({ initialData }: { initialData: any }) => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { savePageAsync } = useSavePage();
  const [isDataChange, setIsDataChange] = useState(false);
  const [initialDataModal, setinitialDataModal] = useState<any>(initialData);
  const handleOpenChange = async (newOpen: boolean) => {
    if (newOpen) savePageAsync();
    if (!newOpen && isDataChange) setShowConfirmDialog(true);
    else setShowModal(newOpen);
  };

  const handleConfirmClose = () => {
    setShowConfirmDialog(false);
    setShowModal(false);
    setIsDataChange(false);
    if (!initialDataModal) return;
  };

  const handleCancelClose = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
      <Dialog open={showModal} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
            <Settings2 />
            <span className="sr-only">{t("Settings")}</span>
          </Button>
        </DialogTrigger>
        <DialogContent
          className="max-w-5xl overflow-y-auto"
          style={{ height: "60vh", maxHeight: "860px" }}
          onInteractOutside={(e) => e.preventDefault()}
          aria-describedby="website-settings-description">
          <DialogTitle className="sr-only">{t("Website Settings")}</DialogTitle>
          {showModal && (
            <WebsiteSettingsContent
              initialData={initialDataModal}
              setinitialData={setinitialDataModal}
              isDataChange={isDataChange}
              setIsDataChange={setIsDataChange}
            />
          )}
        </DialogContent>
      </Dialog>

      <UnsavedChangesDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onCancel={handleCancelClose}
        onConfirm={handleConfirmClose}
        description={t("You have unsaved changes. Are you sure you want to close without saving?")}
        confirmText={t("Close without saving")}
      />
    </>
  );
};

/**
 *
 * Website settings component
 * @param params websiteId, websites, isLoading
 */
function WebsiteSettings() {
  const { data, isLoading } = useWebsiteSetting();
  if (isLoading || !data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <Loader className="animate-spin text-primary" />
      </div>
    );
  }
  const websiteName = data?.name;
  return (
    <div className="flex items-center gap-x-2">
      <div className="flex h-9 items-center rounded-md border p-0 px-px">
        <p className="px-2 font-mono text-xs font-bold">{websiteName}</p>
        <WebsiteSettingsModal initialData={data} />
      </div>
    </div>
  );
}
export default WebsiteSettings;
