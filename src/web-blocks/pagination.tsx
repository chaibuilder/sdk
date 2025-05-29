import { cn } from "@/core/functions/common-functions";
import {
  ChaiBlockComponentProps,
  ChaiStyles,
  closestBlockProp,
  registerChaiBlockSchema,
  StylesProp,
} from "@chaibuilder/runtime";
import { ButtonIcon, ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { get } from "lodash-es";

export type PaginationBlockProps = {
  styles: ChaiStyles;
  activeItemStyle: ChaiStyles;
  inactiveItemStyle: ChaiStyles;
  arrowButtonStyles: ChaiStyles;
  strategy: "query" | "segment";
  visibleButtonCounts: number;
  totalItems: number;
  limit: number;
  currentPage: number;
};

// Get current page from URL if not in builder
const getCurrentPage = (inBuilder: boolean, strategy: "query" | "segment", propCurrentPage: number) => {
  if (inBuilder) return propCurrentPage;

  if (strategy === "query") {
    const params = new URLSearchParams(window.location.search);
    return Number(params.get("page")) || 1;
  }
  const path = window.location.pathname.split("/").pop();
  return Number(path) || 1;
};

// Get page URL based on strategy
const getPageUrl = (strategy: "query" | "segment", page: number) => {
  const { pathname, origin } = window.location;
  const baseUrl = `${origin}${pathname}`;

  if (strategy === "query") {
    return `${baseUrl}?page=${page}`;
  } else {
    return `${baseUrl.replace(/\/\d+$/, "")}/${page}`;
  }
};

export const PaginationBlock = (props: ChaiBlockComponentProps<PaginationBlockProps>) => {
  const {
    blockProps,
    styles,
    activeItemStyle,
    inactiveItemStyle,
    arrowButtonStyles,
    strategy,
    inBuilder,
    visibleButtonCounts = 3,
    currentPage: propCurrentPage = 1,
  } = props;

  const totalItems = 100;
  const limit = 10;

  const totalPages = Math.ceil(totalItems / limit);

  const currentPageNum = getCurrentPage(inBuilder, strategy, propCurrentPage);

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = visibleButtonCounts;

    let startPage = Math.max(1, currentPageNum - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    endPage = Math.max(startPage, endPage);

    // Previous button
    buttons.push(
      <a
        key="prev"
        href={currentPageNum > 1 ? getPageUrl(strategy, currentPageNum - 1) : "#"}
        {...arrowButtonStyles}
        className={cn(
          get(arrowButtonStyles, "className", ""),
          currentPageNum <= 1 && !inBuilder && "pointer-events-none cursor-not-allowed opacity-70",
        )}>
        <ChevronLeftIcon />
      </a>,
    );

    // Page buttons
    for (let i = startPage; i <= endPage; i++) {
      const isActive = i === currentPageNum || (inBuilder && i === 1);
      buttons.push(
        <a
          key={i}
          href={getPageUrl(strategy, i)}
          {...(isActive ? activeItemStyle : inactiveItemStyle)}
          className={cn(
            get(isActive ? activeItemStyle : inactiveItemStyle, "className", ""),
            isActive && "pointer-events-none",
          )}>
          {i}
        </a>,
      );
    }

    // Next button
    buttons.push(
      <a
        key="next"
        href={currentPageNum < totalPages ? getPageUrl(strategy, currentPageNum + 1) : "#"}
        {...arrowButtonStyles}
        className={cn(
          get(arrowButtonStyles, "className", ""),
          currentPageNum >= totalPages && !inBuilder && "pointer-events-none cursor-not-allowed opacity-70",
        )}>
        <ChevronRightIcon />
      </a>,
    );

    return buttons;
  };

  return (
    <div {...blockProps} {...styles}>
      {renderPaginationButtons()}
    </div>
  );
};

export const PaginationBlockConfig = {
  type: "Pagination",
  icon: ButtonIcon,
  label: "Pagination",
  category: "core",
  group: "basic",
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp("flex items-center justify-center gap-2"),
      activeItemStyle: StylesProp(
        "flex h-8 w-8 font-medium items-center justify-center select-none bg-blue-500 text-white rounded-full text-xs",
      ),
      inactiveItemStyle: StylesProp(
        "flex h-8 w-8 font-medium items-center justify-center select-none bg-gray-200 text-gray-700 rounded-full text-xs hover:bg-gray-300",
      ),
      arrowButtonStyles: StylesProp(
        "flex h-8 w-8 font-medium items-center justify-center select-none bg-gray-200 text-gray-700 rounded-full text-xs hover:bg-gray-300",
      ),
      strategy: {
        type: "string",
        title: "Pagination Strategy",
        default: "query",
        oneOf: [
          { enum: ["query"], title: "Query Parameters" },
          { enum: ["segment"], title: "URL Segment" },
        ],
      },
      visibleButtonCounts: {
        type: "number",
        title: "Visible Button Count",
        default: 3,
        minimum: 1,
        maximum: 7,
      },
      totalItems: closestBlockProp("Repeater", "totalItems"),
      limit: closestBlockProp("Repeater", "limit"),
      currentPage: closestBlockProp("Repeater", "currentPage"),
    },
  }),
  canAcceptBlock: () => false,
  canBeNested: (type: string) => type === "Repeater",
};
