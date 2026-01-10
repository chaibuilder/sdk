import ChaiBuilderPages from "@/pages";
import { LoggedInUser } from "@/pages/types/loggedin-user";
import { LoginScreen } from "@/routes/login";
import { useCallback, useEffect, useState } from "react";
import { supabaseClient } from "./supabase";

const WebsiteBuilder = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<null | boolean>(null);
  const [user, setUser] = useState<LoggedInUser | null>(null);

  useEffect(() => {
    // Check initial session
    const checkInitialSession = async () => {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata.name,
          role: session.user.user_metadata.role,
        } as LoggedInUser);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };

    checkInitialSession();

    // Listen to auth state changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (user?.id && session?.user) {
        //already logged in
        return;
      }
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata.name,
          role: session.user.user_metadata.role,
        } as LoggedInUser);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  const handleLogout = useCallback(async () => {
    await supabaseClient.auth.signOut();
  }, []);

  const getAccessToken = useCallback(async () => {
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();
    return session?.access_token as string;
  }, []);

  // Memoize props to prevent unnecessary re-renders when tab visibility changes
  // ChaiBuilderPages has a useEffect that depends on props, so stable references are critical
  const getPreviewUrl = useCallback((slug: string) => `/pages${slug}`, []);
  const getLiveUrl = useCallback((slug: string) => `/pages${slug}`, []);

  if (isLoggedIn === null) {
    return null;
  }

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  return (
    <ChaiBuilderPages
      locale="fr-CA"
      flags={{ exportCode: false, dragAndDrop: true, designTokens: true }}
      translations={{ "fr-CA": { Outline: "Contour" } }}
      getPreviewUrl={getPreviewUrl}
      getLiveUrl={getLiveUrl}
      onLogout={handleLogout}
      getAccessToken={getAccessToken}
      currentUser={user}
      websocket={supabaseClient}
      autoSaveActionsCount={10}
      autoSave={true}
    />
  );
};

export default WebsiteBuilder;
