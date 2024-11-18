import { registerChaiBlock } from "@chaibuilder/runtime";

import { Component as Box, Config as BoxConfig, BoxProps } from "./box";
import { Component as Button, Config as ButtonConfig, ButtonProps } from "./button";
import { Component as CustomHTML, Config as CustomHTMLConfig, CustomHTMLBlockProps } from "./custom-html";
import { Component as EmptyBox, Config as EmptyBoxConfig, EmptyBoxProps } from "./empty-box";
import { Component as HeadingBlock, Config as HeadingBlockConfig, HeadingProps } from "./heading";
import { Component as ParagraphBlock, Config as ParagraphBlockConfig, ParagraphProps } from "./paragraph";
import { Component as SpanBlock, Config as SpanBlockConfig, SpanProps } from "./span";
import { Component as RichTextBlock, Config as RichTextConfig, RichTextProps } from "./rte";
// //
// import { Component as LinkBlock, Config as LinkBlockConfig } from "./link";
// import { Component as LightBoxLinkBlock, Config as LightBoxLinkBlockConfig } from "./lightbox-link";
// import { Component as ListBlock, Config as ListBlockConfig } from "./list";
// import { Component as ListItemBlock, Config as ListItemBlockConfig } from "./listitem";
// import { Component as IconBlock, Config as IconBlockConfig } from "./icon";
// import { Component as ImageBlock, Config as ImageBlockConfig } from "./image";
// import { Component as VideoBlock, Config as VideoBlockConfig } from "./video";
// import { Component as CustomScript, Config as CustomScriptConfig } from "./custom-script";
// import { Component as DividerBlock, Config as DividerBlockConfig } from "./divider";
// import { Component as DarkMode, Config as DarkModeConfig } from "./dark-mode";
// import { Component as GlobalBlock, Config as GlobalBlockConfig } from "./global-block";
// import { Component as TextBlock, Config as LayersConfig } from "./text";
// // import "./slot";
// //
// // // hidden
import { Component as BodyBlock, Config as BodyBlockConfig, BodyProps } from "./hidden/body";
import { Component as LineBreakBlock, Config as LineBreakBlockConfig, LineBreakProps } from "./hidden/line-break";
import "./hidden/table";
import { Component as FormBlock, Config as FormBlockConfig, FormProps } from "./form/form";
import { Component as FormButtonBlock, Config as FormButtonBlockConfig, FormButtonProps } from "./form/form-button";
import { Component as InputBlock, Config as InputBlockConfig, InputProps } from "./form/input";
import { Component as RadioBlock, Config as RadioBlockConfig, RadioProps } from "./form/radio";
import { Component as SelectBlock, Config as SelectBlockConfig, SelectProps } from "./form/select";
import { Component as TextAreaBlock, Config as TextAreaBlockConfig, TextAreaProps } from "./form/textarea";
import { Component as CheckboxBlock, Config as CheckboxBlockConfig, CheckboxProps } from "./form/checkbox";

/*
 * Register all web blocks.
 * This function should be called  in places where Builder is rendered or pages are rendered.
 * @returns void
 */
const loadWebBlocks = () => {
  registerChaiBlock<BoxProps>(Box, BoxConfig);
  registerChaiBlock<EmptyBoxProps>(EmptyBox, EmptyBoxConfig);
  registerChaiBlock<ButtonProps>(Button, ButtonConfig);
  registerChaiBlock<HeadingProps>(HeadingBlock, HeadingBlockConfig);
  registerChaiBlock<ParagraphProps>(ParagraphBlock, ParagraphBlockConfig);
  registerChaiBlock<SpanProps>(SpanBlock, SpanBlockConfig);
  registerChaiBlock<RichTextProps>(RichTextBlock, RichTextConfig);
  // registerChaiBlock(LinkBlock, LinkBlockConfig);
  // registerChaiBlock(LightBoxLinkBlock, LightBoxLinkBlockConfig);
  // registerChaiBlock(ListBlock, ListBlockConfig);
  // registerChaiBlock(ListItemBlock, ListItemBlockConfig);
  // registerChaiBlock(IconBlock, IconBlockConfig);
  // registerChaiBlock(ImageBlock, ImageBlockConfig);
  // registerChaiBlock(VideoBlock, VideoBlockConfig);
  registerChaiBlock<CustomHTMLBlockProps>(CustomHTML, CustomHTMLConfig);
  // registerChaiBlock(TextBlock, LayersConfig);

  // //forms
  registerChaiBlock<FormProps>(FormBlock, FormBlockConfig);
  registerChaiBlock<FormButtonProps>(FormButtonBlock, FormButtonBlockConfig);
  registerChaiBlock<InputProps>(InputBlock, InputBlockConfig);
  registerChaiBlock<CheckboxProps>(CheckboxBlock, CheckboxBlockConfig);
  registerChaiBlock<RadioProps>(RadioBlock, RadioBlockConfig);
  registerChaiBlock<SelectProps>(SelectBlock, SelectBlockConfig);
  registerChaiBlock<TextAreaProps>(TextAreaBlock, TextAreaBlockConfig);

  // // hidden
  registerChaiBlock<LineBreakProps>(LineBreakBlock, LineBreakBlockConfig);
  registerChaiBlock<BodyProps>(BodyBlock, BodyBlockConfig);

  // registerChaiBlock(CustomScript, CustomScriptConfig);
  // registerChaiBlock(DividerBlock, DividerBlockConfig);
  // // @ts-ignore
  // registerChaiBlock(DarkMode, DarkModeConfig);
  // registerChaiBlock(GlobalBlock, GlobalBlockConfig);
};

export { loadWebBlocks };
