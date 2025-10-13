import { ChaiStyles, getRegisteredChaiBlock } from "@chaibuilder/runtime";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import * as React from "react";

export const DummyPagination = ({ styles }: { styles?: ChaiStyles }) => {
  const pagination = getRegisteredChaiBlock("Pagination");
  return (
    <div {...styles}>
      {pagination ? (
        React.createElement(pagination.component)
      ) : (
        <>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled>
            <ChevronLeftIcon className="h-4 w-4" />
          </button>

          <button className="flex h-9 w-9 items-center justify-center rounded-md border border-blue-500 bg-blue-500 font-medium text-white">
            1
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white font-medium text-gray-700 hover:bg-gray-50">
            2
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white font-medium text-gray-700 hover:bg-gray-50">
            3
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white font-medium text-gray-700 hover:bg-gray-50">
            4
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white font-medium text-gray-700 hover:bg-gray-50">
            5
          </button>

          <button className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-50">
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
};
