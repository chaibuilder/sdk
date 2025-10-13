import { cn } from "@/core/functions/common-functions";
import { ChaiStyles } from "@chaibuilder/runtime";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { get } from "lodash-es";

export type PaginationBlockProps = {
  styles?: ChaiStyles;
  activeItemStyle?: ChaiStyles;
  inactiveItemStyle?: ChaiStyles;
  arrowButtonStyles?: ChaiStyles;
  strategy?: "query" | "segment";
  visibleButtonCounts?: number;
  totalItems?: number;
  limit?: number;
};

// Get current page from URL
const getCurrentPage = (strategy: "query" | "segment") => {
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

export const PaginationBlock = (props: PaginationBlockProps) => {
  const {
    styles,
    activeItemStyle,
    inactiveItemStyle,
    arrowButtonStyles,
    strategy,
    visibleButtonCounts = 3,
    limit,
    totalItems,
  } = props;

  // * Display none on Invalid value or less than zero
  if (!totalItems || typeof totalItems !== "number" || totalItems < 1) return null;

  const totalPages = Math.ceil(totalItems / limit);

  const currentPageNum = getCurrentPage(strategy);

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
          currentPageNum <= 1 && "pointer-events-none cursor-not-allowed opacity-70",
        )}>
        <ChevronLeftIcon />
      </a>,
    );

    // Page buttons
    for (let i = startPage; i <= endPage; i++) {
      const isActive = i === currentPageNum;
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
          currentPageNum >= totalPages && "pointer-events-none cursor-not-allowed opacity-70",
        )}>
        <ChevronRightIcon />
      </a>,
    );

    return buttons;
  };

  return <div {...styles}>{renderPaginationButtons()}</div>;
};
