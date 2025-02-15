export const FallbackError = () => {
  return (
    <div className="h-full w-full rounded-md bg-red-200 p-4 text-red-500">
      <div className="flex h-full w-full flex-col items-center justify-center">
        <p className="font-semibold">Oops! Something went wrong.</p>
        <p>Please try again.</p>
      </div>
    </div>
  );
};
