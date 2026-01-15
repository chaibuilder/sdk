import { useTranslation } from "@/core/main";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/ui/shadcn/components/ui/alert-dialog";
import { Button } from "@/ui/shadcn/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/ui/shadcn/components/ui/hover-card";
import { isFunction, noop } from "lodash-es";
import { User } from "lucide-react";
import { usePagesProp } from "../hooks/project/use-builder-prop";
import { useChaiAuth } from "../hooks/use-chai-auth";
export const userInfoPanelId = "user-info";

export const UserInfoButton = () => {
  const { t } = useTranslation();
  const { user, logout } = useChaiAuth();
  const onLogout = usePagesProp<() => void | undefined>("onLogout", noop);

  if (!user) return null;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="ghost" className="text-sm font-medium">
          <User className="h-4 w-4" />
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-auto space-y-2 p-4">
        <div className="text-sm font-medium">{user.name ?? user.email}</div>
        <div className="text-xs text-muted-foreground">{user.email}</div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              {t("Logout")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("Are you sure you want to logout?")}</AlertDialogTitle>
              <AlertDialogDescription>{t("You will be redirected to the login page.")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  logout();
                  if (isFunction(onLogout)) {
                    onLogout();
                  }
                }}>
                {t("Logout")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </HoverCardContent>
    </HoverCard>
  );
};

export const userInfoPanel = {
  id: userInfoPanelId,
  label: "User Info",
  button: UserInfoButton,
  position: "bottom" as const,
};
