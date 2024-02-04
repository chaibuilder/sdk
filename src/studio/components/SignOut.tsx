import { Loader2, LogOutIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../ui";
import { useSignOut } from "../mutations/useAuth";

const SignOutConfirmation = ({ children }: { children: any }) => {
  const signOutMutation = useSignOut();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure, you want to <span className="text-red-500">Sign Out</span>?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Kindly ensure that all your data is saved before proceeding with the sign-out process to prevent any
            potential loss of unsaved information
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={signOutMutation.isPending}>Cancel</AlertDialogCancel>
          <button
            disabled={signOutMutation.isPending}
            onClick={() => signOutMutation.mutate()}
            className="rounded-md text-white w-28 text-center justify-center bg-red-600 hover:bg-red-700 flex items-center gap-x-2">
            {signOutMutation.isPending && <Loader2 className="animate-spin w-5 h-5" />}
            Sign Out
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const SignOut = () => {
  return (
    <SignOutConfirmation>
      <button className="border-gray-200 rounded-md p-2 mb-2 border">
        <LogOutIcon className={"w-4 h-4 text-red-500 cursor-pointer hover:text-red-300 duration-300"} />
      </button>
    </SignOutConfirmation>
  );
};

export default SignOut;
