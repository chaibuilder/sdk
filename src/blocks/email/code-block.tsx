import { CodeBlock } from "@react-email/components";
import { registerChaiBlock } from "@chaibuilder/runtime";
import { Checkbox, MultilineText, SelectOption, SingleLineText, Styles } from "@chaibuilder/runtime/controls";
import { CodeSandboxLogoIcon } from "@radix-ui/react-icons";

const CustomCodeBlock = ({ blockProps, styles, code, linenumbers, theme, language }: any) => {
  return (
    <CodeBlock {...blockProps} {...styles} code={code} linenumbers={linenumbers} theme={theme} language={language} />
  );
};

const CodeBlockBuilder = ({ blockProps, styles, code, linenumbers, theme, language }: any) => {
  return (
    <code {...blockProps} {...styles} linenumbers={linenumbers} theme={theme} language={language}>
      {code}
    </code>
  );
};

registerChaiBlock(CustomCodeBlock, {
  type: "CodeBlock",
  label: "CodeBlock",
  group: "basic",
  category: "core",
  icon: CodeSandboxLogoIcon,
  builderComponent: CodeBlockBuilder,
  props: {
    styles: Styles({ default: "" }),
    code: MultilineText({ title: "Code", default: "console.log('Hello, world!');" }),
    theme: SingleLineText({ title: "Theme", default: "dracula" }),
    linenumbers: Checkbox({
      title: "Line number",
      default: false,
    }),
    language: SelectOption({
      title: "Language",
      default: "javascript",
      binding: false,
      options: [
        { value: "javascript", title: "JavaScript" },
        { value: "html", title: "HTML" },
        { value: "css", title: "CSS" },
        //add more options
      ],
    }),
  },
});

export default CustomCodeBlock;
