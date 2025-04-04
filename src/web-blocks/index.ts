import { registerChaiBlock } from "@chaibuilder/runtime";

import { Component as Box, Config as BoxConfig, BoxProps } from "./box";
import { Component as Button, Config as ButtonConfig, ButtonProps } from "./button";
import { Component as CustomHTML, CustomHTMLBlockProps, Config as CustomHTMLConfig } from "./custom-html";
import { Component as EmptyBox, Config as EmptyBoxConfig, EmptyBoxProps } from "./empty-box";
import { Component as HeadingBlock, Config as HeadingBlockConfig, HeadingProps } from "./heading";
import { Component as ParagraphBlock, Config as ParagraphBlockConfig, ParagraphProps } from "./paragraph";
import { Component as RichTextBlock, Config as RichTextConfig, RichTextProps } from "./rte";
import { Component as SpanBlock, Config as SpanBlockConfig, SpanProps } from "./span";

import { Component as CustomScript, CustomScriptBlockProps, Config as CustomScriptConfig } from "./custom-script";
import { Component as DividerBlock, Config as DividerBlockConfig, DividerBlockProps } from "./divider";
import { Component as GlobalBlock, Config as GlobalBlockConfig, GlobalBlockProps } from "./global-block";
import { Component as IconBlock, Config as IconBlockConfig, IconBlockProps } from "./icon";
import { Component as ImageBlock, Config as ImageBlockConfig, ImageBlockProps } from "./image";
import { Component as LightBoxLinkBlock, Config as LightBoxLinkBlockConfig, LightBoxLinkProps } from "./lightbox-link";
import { Component as LinkBlock, Config as LinkBlockConfig, LinkBlockProps } from "./link";
import { Component as ListBlock, Config as ListBlockConfig, ListBlockProps } from "./list";
import { Component as ListItemBlock, Config as ListItemBlockConfig, ListItemBlockProps } from "./listitem";
import { Config as LayersConfig, Component as TextBlock, TextBlockProps } from "./text";
import { Component as VideoBlock, Config as VideoBlockConfig, VideoBlockProps } from "./video";

import { Component as CheckboxBlock, Config as CheckboxBlockConfig, CheckboxProps } from "./form/checkbox";
import { Component as FormBlock, Config as FormBlockConfig, FormProps } from "./form/form";
import { Component as FormButtonBlock, Config as FormButtonBlockConfig, FormButtonProps } from "./form/form-button";
import { Component as InputBlock, Config as InputBlockConfig, InputProps } from "./form/input";
import { Component as LabelBlock, Config as LabelBlockConfig, LabelProps } from "./form/label";
import { Component as RadioBlock, Config as RadioBlockConfig, RadioProps } from "./form/radio";
import { Component as SelectBlock, Config as SelectBlockConfig, SelectProps } from "./form/select";
import { Component as TextAreaBlock, Config as TextAreaBlockConfig, TextAreaProps } from "./form/textarea";
import { Component as LineBreakBlock, Config as LineBreakBlockConfig, LineBreakProps } from "./hidden/line-break";
import "./hidden/table";
import { PartialBlock, PartialBlockConfig, PartialBlockProps } from "./partial-block";
import { Column, ColumnConfig, ColumnProps, Component as Row, Config as RowConfig, RowProps } from "./row-col";
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
  registerChaiBlock<LinkBlockProps>(LinkBlock, LinkBlockConfig);
  registerChaiBlock<LightBoxLinkProps>(LightBoxLinkBlock, LightBoxLinkBlockConfig);
  registerChaiBlock<ListBlockProps>(ListBlock, ListBlockConfig);
  registerChaiBlock<ListItemBlockProps>(ListItemBlock, ListItemBlockConfig);
  registerChaiBlock<IconBlockProps>(IconBlock, IconBlockConfig);
  registerChaiBlock<ImageBlockProps>(ImageBlock, ImageBlockConfig);
  registerChaiBlock<VideoBlockProps>(VideoBlock, VideoBlockConfig);
  registerChaiBlock<CustomHTMLBlockProps>(CustomHTML, CustomHTMLConfig);
  registerChaiBlock<CustomScriptBlockProps>(CustomScript, CustomScriptConfig);
  registerChaiBlock<TextBlockProps>(TextBlock, LayersConfig);

  // //forms
  registerChaiBlock<FormProps>(FormBlock, FormBlockConfig);
  registerChaiBlock<FormButtonProps>(FormButtonBlock, FormButtonBlockConfig);
  registerChaiBlock<InputProps>(InputBlock, InputBlockConfig);
  registerChaiBlock<CheckboxProps>(CheckboxBlock, CheckboxBlockConfig);
  registerChaiBlock<RadioProps>(RadioBlock, RadioBlockConfig);
  registerChaiBlock<SelectProps>(SelectBlock, SelectBlockConfig);
  registerChaiBlock<TextAreaProps>(TextAreaBlock, TextAreaBlockConfig);
  registerChaiBlock<LabelProps>(LabelBlock, LabelBlockConfig);

  // // hidden
  registerChaiBlock<LineBreakProps>(LineBreakBlock, LineBreakBlockConfig);

  registerChaiBlock<DividerBlockProps>(DividerBlock, DividerBlockConfig);
  // // @ts-ignore
  registerChaiBlock<GlobalBlockProps>(GlobalBlock, GlobalBlockConfig);
  registerChaiBlock<PartialBlockProps>(PartialBlock, PartialBlockConfig);
  registerChaiBlock<RowProps>(Row, RowConfig);
  registerChaiBlock<ColumnProps>(Column, ColumnConfig);
};

export { loadWebBlocks };
