import { ChaiBuilderEditor, ChaiBuilderEditorProps } from "../core/main";
import { MobileIcon } from "@radix-ui/react-icons";

const BREAKPOINTS = [
  {
    title: "Mobile",
    content: "Mobile email client",
    breakpoint: "xs",
    icon: <MobileIcon />,
    width: 400,
  },
  {
    title: "Email Client",
    content: "Content as seen  inside an email client",
    breakpoint: "sm",
    icon: <MobileIcon className={"rotate-90"} />,
    width: 700,
  },
];

const ChaiBuilderEmail = (props: ChaiBuilderEditorProps) => {
  const emailProps: ChaiBuilderEditorProps = {
    ...props,
    importHTMLSupport: false,
    dataBindingSupport: false,
    breakpoints: BREAKPOINTS,
  };

  return <ChaiBuilderEditor {...emailProps} />;
};

export { ChaiBuilderEmail };
