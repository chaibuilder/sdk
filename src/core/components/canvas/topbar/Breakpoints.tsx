import { DesktopIcon, DotsVerticalIcon, LaptopIcon, MobileIcon } from "@radix-ui/react-icons";
import { includes, map, toUpper } from "lodash-es";
import { useTranslation } from "react-i18next";
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../../../../ui";
import { getBreakpointValue } from "../../../functions/Functions";
import { useBuilderProp, useCanvasWidth, useSelectedBreakpoints } from "../../../hooks";

export interface BreakpointItemType {
  breakpoint: string;
  content: string;
  icon: any;
  title: string;
  width: number;
}

export interface BreakpointCardProps extends BreakpointItemType {
  canvas?: boolean;
  currentBreakpoint: string;
  onClick: Function;
  openDelay?: number;
}

const TabletIcon = ({ landscape = false }) => (
  <svg
    className={landscape ? "rotate-90" : ""}
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 448 512"
    height="14px"
    width="14px"
    xmlns="http://www.w3.org/2000/svg">
    <path d="M400 0H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V48c0-26.5-21.5-48-48-48zM224 480c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm176-108c0 6.6-5.4 12-12 12H60c-6.6 0-12-5.4-12-12V60c0-6.6 5.4-12 12-12h328c6.6 0 12 5.4 12 12v312z"></path>
  </svg>
);

export const WEB_BREAKPOINTS: BreakpointItemType[] = [
  {
    title: "Mobile (Base)",
    content: "Styles set here are applied to all screen unless edited at higher breakpoint",
    breakpoint: "xs",
    icon: <MobileIcon />,
    width: 400,
  },
  {
    title: "Mobile landscape (SM)",
    content: "Styles set here are applied at 640px and up unless edited at higher breakpoint",
    breakpoint: "sm",
    icon: <MobileIcon className="rotate-90" />,
    width: 640,
  },
  {
    title: "Tablet (MD)",
    content: "Styles set here are applied at 768px and up",
    breakpoint: "md",
    icon: <TabletIcon />,
    width: 800,
  },
  {
    title: "Tablet Landscape (LG)",
    content: "Styles set here are applied at 1024px and up unless edited at higher breakpoint",
    breakpoint: "lg",
    icon: <TabletIcon landscape />,
    width: 1024,
  },
  {
    title: "Desktop (XL)",
    content: "Styles set here are applied at 1280px and up unless edited at higher breakpoint",
    breakpoint: "xl",
    icon: <LaptopIcon />,
    width: 1420,
  },
  {
    title: "Large Desktop (2XL)",
    content: "Styles set here are applied at 1536px and up",
    breakpoint: "2xl",
    icon: <DesktopIcon />,
    width: 1920,
  },
];

const BreakpointCard = ({
  canvas = false,
  openDelay = 400,
  title,
  content,
  currentBreakpoint,
  breakpoint,
  width,
  icon,
  onClick,
}: BreakpointCardProps) => {
  const { t } = useTranslation();

  return (
    <HoverCard openDelay={openDelay}>
      <HoverCardTrigger asChild>
        <Button
          onClick={() => onClick(width)}
          size="sm"
          className="h-7 w-7 rounded-md p-1"
          variant={breakpoint === currentBreakpoint ? "outline" : "ghost"}>
          {icon}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-fit max-w-52 border-border">
        <div className="flex justify-between space-x-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">{t(title)}</h4>
            {canvas && <p className="text-xs">{t(content)}</p>}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export const Breakpoints = ({ openDelay = 400, canvas = false }: { openDelay?: number; canvas?: boolean }) => {
  const [currentWidth, , setNewWidth, canvasDisplayWidth, setCanvasDisplayWidth] = useCanvasWidth();
  const [styleBreakpoints, setStyleBreakpoints] = useSelectedBreakpoints();

  const selectedBreakpoints = canvas ? styleBreakpoints : styleBreakpoints;
  const setSelectedBreakpoints = canvas ? setStyleBreakpoints : setStyleBreakpoints;
  const { t } = useTranslation();
  const breakpoints = useBuilderProp("breakpoints", WEB_BREAKPOINTS);

  const toggleBreakpoint = (newBreakPoint: string) => {
    if (selectedBreakpoints.includes(newBreakPoint)) {
      if (selectedBreakpoints.length > 2) {
        setSelectedBreakpoints(selectedBreakpoints.filter((bp) => bp !== newBreakPoint));
      }
    } else {
      setSelectedBreakpoints((prevSelected: string[]) => [...prevSelected, newBreakPoint]);
    }
  };

  const handleCanvasWidthChange = (width: number) => {
    if (canvas) {
      setCanvasDisplayWidth(width);
    } else {
      setNewWidth(width);
      setCanvasDisplayWidth(width);
    }
  };

  const breakpoint = getBreakpointValue(canvas ? canvasDisplayWidth : currentWidth).toLowerCase();

  if (breakpoints.length < 4) {
    return (
      <div className="flex items-center rounded-md">
        {map(breakpoints, (bp) => (
          <BreakpointCard
            canvas={canvas}
            {...bp}
            onClick={handleCanvasWidthChange}
            key={bp.breakpoint}
            currentBreakpoint={breakpoint}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-between rounded-md">
      <div className="flex items-center">
        {map(
          breakpoints.filter((bp: BreakpointItemType) => includes(selectedBreakpoints, toUpper(bp.breakpoint))),
          (bp: BreakpointItemType) => (
            <BreakpointCard
              canvas={canvas}
              openDelay={openDelay}
              {...bp}
              onClick={handleCanvasWidthChange}
              key={bp.breakpoint}
              currentBreakpoint={breakpoint}
            />
          ),
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <span className="cursor-pointer px-2.5 hover:opacity-80">
            <DotsVerticalIcon className="scale-90 transform" />
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 border-border text-xs">
          <DropdownMenuLabel>{t("Screen sizes")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {map(breakpoints, (bp: BreakpointItemType) => (
            <DropdownMenuCheckboxItem
              key={bp.breakpoint}
              disabled={bp.breakpoint === "xs"}
              onCheckedChange={() => toggleBreakpoint(toUpper(bp.breakpoint))}
              checked={includes(selectedBreakpoints, toUpper(bp.breakpoint))}>
              {t(bp.title)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
