import { Popover, PopoverContent, PopoverTrigger, Switch } from "@/ui";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { Settings } from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";
import { useChaiFeatureFlag, useChaiFeatureFlags, useToggleChaiFeatureFlag } from "./register-chai-flag";

const FeatureToggle = ({
  featureKey,
  options,
}: {
  featureKey: string;
  options: { key: string; title?: string; description?: string };
}) => {
  const toggleFlag = useToggleChaiFeatureFlag(featureKey);
  const flag = useChaiFeatureFlag(featureKey);
  return (
    <div className="flex items-center space-x-2">
      <Switch checked={flag} onCheckedChange={toggleFlag} />
      <div className="flex flex-col">
        <p className="text-sm font-medium">{options.key}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{options.description}</p>
      </div>
    </div>
  );
};

const showFeatureFlagAtom = atomWithStorage<boolean>("show-feature-flag", false);

export const ChaiFeatureFlagsWidget = () => {
  const features = useChaiFeatureFlags();
  const [show, setShow] = useAtom(showFeatureFlagAtom);

  useHotkeys("ctrl+shift+1,command+shift+1", () => setShow(!show));

  if (!show) {
    return null;
  }

  return (
    <Popover open={true}>
      <PopoverTrigger>
        <Settings />
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col space-y-1">
          <div className="mb-2 px-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Feature Flags</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Enable or disable experimental features</p>
          </div>
          <div className="flex flex-col space-y-3 pt-2">
            {Object.entries(features).map(([key, options]) => (
              <FeatureToggle key={key} featureKey={key} options={options} />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
