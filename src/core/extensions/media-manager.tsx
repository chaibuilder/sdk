import { ChaiAsset } from "@/types";
import { Alert, AlertDescription } from "@/ui/shadcn/components/ui/alert";
import { Button } from "@/ui/shadcn/components/ui/button";
import { Input } from "@/ui/shadcn/components/ui/input";
import { AlertCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export type MediaManagerProps = {
  close: () => void;
  onSelect: (assets: ChaiAsset | ChaiAsset[]) => void;
  mode?: "image" | "video" | "audio";
};

const DefaultMediaManager = ({ close, onSelect, mode = "image" }: MediaManagerProps) => {
  const [url, setUrl] = useState<string>("");
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const validateAsset = async (assetUrl: string) => {
    if (!assetUrl.trim()) {
      setIsValid(false);
      setError("Please enter a URL");
      return;
    }

    try {
      setIsValidating(true);
      setError(null);
      setIsValid(true);
      setError(null);
    } catch (err) {
      setIsValid(false);
      setError("Error validating URL");
    } finally {
      setIsValidating(false);
    }
  };

  const { t } = useTranslation();

  return (
    <div className="flex w-96 flex-col gap-4 p-4">
      <h2 className="text-xl font-semibold">{t(`${mode.charAt(0).toUpperCase() + mode.slice(1)} Manager`)}</h2>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-4">
        <Input
          placeholder={t(`Enter ${mode} URL`)}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={() => validateAsset(url)}
        />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={close}>
            {t("Cancel")}
          </Button>
          <Button
            onClick={() => onSelect({ url, width: 600, height: 400, description: "This is image description" })}
            disabled={!isValid || isValidating}>
            {t("Insert")}
          </Button>
        </div>
      </div>
    </div>
  );
};

const MEDIA_MANAGER: { component: React.ComponentType<MediaManagerProps> } = {
  component: DefaultMediaManager,
};

export const registerChaiMediaManager = (component: React.ComponentType<MediaManagerProps>) => {
  MEDIA_MANAGER.component = component;
};

export const useMediaManagerComponent = () => {
  return useMemo(() => {
    return MEDIA_MANAGER.component;
  }, []);
};
