export const FullPageLoading = () => {
  return (
    <div className="h-screen w-screen bg-gray-200">
      <div className="flex flex-col h-full w-full justify-center items-center">
        <div className="flex flex-row gap-2">
          <div className="w-4 h-4 rounded-full bg-orange-600 animate-bounce [animation-delay:.6s]"></div>
          <div className="w-4 h-4 rounded-full bg-blue-600 animate-bounce [animation-delay:.4s]"></div>
          <div className="w-4 h-4 rounded-full bg-green-600 animate-bounce [animation-delay:.2s]"></div>
          <div className="w-4 h-4 rounded-full bg-yellow-600 animate-bounce [animation-delay:.0s]"></div>
        </div>
        <div className="text-gray-700 font-thin">Loading Builder...</div>
      </div>
    </div>
  );
};
