import {
  ChaiBlock,
  ChaiBlockComponentProps,
  ChaiStyles,
  closestBlockProp,
  registerChaiBlock,
  registerChaiBlockSchema,
  stylesProp,
} from "@chaibuilder/runtime";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";

export type DarkModeBlockProps = {
  mode: "dark" | "light";
  styles: ChaiStyles;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DarkMode = (_props: ChaiBlockComponentProps<DarkModeBlockProps>) => {
  return (
    <div {..._props.blockProps} {..._props.styles}>
      {_props.mode}
      {_props.children}
    </div>
  );
};

const DarkModeButton = (_props: ChaiBlockComponentProps<DarkModeBlockProps>) => {
  if (_props.mode === "dark") return null;
  return (
    <button aria-label="dark mode button" {..._props.blockProps} {..._props.styles}>
      {_props.children}
    </button>
  );
};

registerChaiBlock(DarkModeButton, {
  type: "DarkModeButton",
  label: "Dark Mode Button",
  category: "core",
  icon: MoonIcon,
  group: "advanced",
  hidden: true,
  ...registerChaiBlockSchema({
    properties: {
      mode: closestBlockProp("DarkModeSwitcher", "mode"),
      styles: stylesProp(""),
    },
  }),
});

const LightModeButton = (_props: ChaiBlockComponentProps<DarkModeBlockProps>) => {
  if (_props.mode === "light") return null;
  return (
    <button aria-label="light mode button" {..._props.blockProps} {..._props.styles}>
      {_props.children}
    </button>
  );
};

registerChaiBlock(LightModeButton, {
  type: "LightModeButton",
  label: "Light Mode Button",
  category: "core",
  icon: SunIcon,
  group: "advanced",
  hidden: true,
  ...registerChaiBlockSchema({
    properties: {
      mode: closestBlockProp("DarkModeSwitcher", "mode"),
      styles: stylesProp(""),
      fake: {
        type: "string",
        default: "",
      },
    },
  }),
});

const Config = {
  type: "DarkModeSwitcher",
  label: "web_blocks.dark_mode",
  category: "core",
  icon: MoonIcon,
  group: "advanced",
  wrapper: true,
  ...registerChaiBlockSchema({
    properties: {
      mode: {
        title: "Mode",
        type: "string",
        enum: ["dark", "light"],
        default: "light",
      },
      styles: stylesProp(""),
    },
  }),
  blocks: () =>
    [
      { _id: "ultqCh", _type: "DarkModeSwitcher", mode: "light", styles: "#styles:,", _name: "Dark Mode Theme" },
      {
        _id: "vroabi",
        _parent: "ultqCh",
        _type: "LightModeButton",
        // @ts-ignore
        styles_attrs: { type: "button", "x-on:click": "darkMode = 'dark'", "x-show": "darkMode === 'light'" },
        styles:
          "#styles:,bg-white dark:bg-black font-medium text-gray-800 rounded-full hover:bg-gray-200 focus:outline-none focus:bg-gray-200 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800",
        _name: "Dark Mode Btn",
      },
      {
        _id: "nltBrv",
        _parent: "vroabi",
        _type: "Icon",
        styles: "#styles:, shrink-0 size-4",
        icon: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z'></path></svg>",
      },
      {
        _id: "gesydi",
        _parent: "ultqCh",
        _type: "DarkModeButton",
        // @ts-ignore
        styles_attrs: { type: "button", "x-on:click": "darkMode = 'light'", "x-show": "darkMode === 'dark'" },
        styles:
          "#styles:,bg-white hidden dark:bg-black font-medium text-gray-800 rounded-full hover:bg-gray-200 focus:outline-none focus:bg-gray-200 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800",
        _name: "Light Mode Btn",
      },
      {
        _id: "AdDwBC",
        _parent: "gesydi",
        _type: "Icon",
        styles: "#styles:, shrink-0 size-4",
        icon: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='4'></circle><path d='M12 2v2'></path><path d='M12 20v2'></path><path d='m4.93 4.93 1.41 1.41'></path><path d='m17.66 17.66 1.41 1.41'></path><path d='M2 12h2'></path><path d='M20 12h2'></path><path d='m6.34 17.66-1.41 1.41'></path><path d='m19.07 4.93-1.41 1.41'></path></svg>",
      },
    ] as ChaiBlock[],
};

export { DarkMode as Component, Config };
