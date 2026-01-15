import { Button } from "@/ui/shadcn/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/shadcn/components/ui/card";
import { Loader } from "lucide-react";
import { useState } from "react";
import { supabaseClient } from "./supabase";

export const LoginScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [responseError, setResponseError] = useState("");

  const handleGoogleLogin = async () => {
    setResponseError("");
    setIsLoading(true);

    try {
      const { error } = await supabaseClient?.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/website`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      setResponseError(error instanceof Error && error.message ? error.message : "Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>Sign in to visual builder with your Google account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {responseError && (
            <div>
              <p className="text-sm text-destructive">{responseError}</p>
            </div>
          )}
          <Button onClick={handleGoogleLogin} className="w-full" disabled={isLoading} variant="outline">
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Connecting to Google...
              </>
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EABC05"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col justify-center"></CardFooter>
      </Card>
    </div>
  );
};
