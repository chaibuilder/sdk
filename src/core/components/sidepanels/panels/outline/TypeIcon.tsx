import React from "react";
import {
  BorderAllIcon,
  BorderTopIcon,
  BoxIcon,
  BoxModelIcon,
  ButtonIcon,
  CheckboxIcon,
  CodeIcon,
  ColumnsIcon,
  CursorTextIcon,
  DividerHorizontalIcon,
  DragHandleHorizontalIcon,
  DropdownMenuIcon,
  GroupIcon,
  HeadingIcon,
  ImageIcon,
  InputIcon,
  Link1Icon,
  RadiobuttonIcon,
  RowsIcon,
  SketchLogoIcon,
  SpaceBetweenVerticallyIcon,
  TableIcon,
  TextIcon,
  VideoIcon,
  ViewHorizontalIcon,
} from "@radix-ui/react-icons";
import { DatabaseIcon, GlobeIcon } from "lucide-react";

type Props = {
  type?: string;
};

export const TypeIcon: React.FC<Props> = (props) => {
  switch (props.type) {
    case "GlobalBlock":
      return <GlobeIcon className="h-3 w-3 stroke-[2]" />;
    case "Image":
      return <ImageIcon className="h-3 w-3 stroke-[2]" />;
    case "Heading":
      return <HeadingIcon className="h-3 w-3 stroke-[2]" />;
    case "Text":
      return <TextIcon className="h-3 w-3 stroke-[2]" />;
    case "Link":
      return <Link1Icon className="h-3 w-3 stroke-[2]" />;
    case "Video":
      return <VideoIcon className="h-3 w-3 stroke-[2]" />;
    case "RichText":
      return <CursorTextIcon className="h-3 w-3 stroke-[2]" />;
    case "Button":
      return <ButtonIcon className="h-3 w-3 stroke-[2]" />;
    case "CustomHTML":
      return <CodeIcon className="h-3 w-3 stroke-[2]" />;
    case "Divider":
      return <DividerHorizontalIcon className="h-3 w-3 stroke-[2]" />;
    case "Icon":
      return <SketchLogoIcon className="h-3 w-3 stroke-[2]" />;
    case "List":
      return <RowsIcon className="h-3 w-3 stroke-[2]" />;
    case "Paragraph":
      return <TextIcon className="h-3 w-3 stroke-[2]" />;
    case "Row":
      return <RowsIcon className="h-3 w-3 stroke-[2]" />;
    case "ListItem":
      return <ColumnsIcon className="h-3 w-3 stroke-[2]" />;
    case "LineBreak":
      return <SpaceBetweenVerticallyIcon className="h-3 w-3 stroke-[2]" />;
    case "Form":
      return <GroupIcon className="h-3 w-3 stroke-[2]" />;
    case "Checkbox":
      return <CheckboxIcon className="h-3 w-3 stroke-[2]" />;
    case "FormButton":
      return <ButtonIcon className="h-3 w-3 stroke-[2]" />;
    case "Input":
    case "TextArea":
      return <InputIcon className="h-3 w-3 stroke-[2]" />;
    case "Radio":
      return <RadiobuttonIcon className="h-3 w-3 stroke-[2]" />;
    case "Select":
      return <DropdownMenuIcon className="h-3 w-3 stroke-[2]" />;
    case "Table":
      return <TableIcon className="h-3 w-3 stroke-[2]" />;
    case "TableHead":
      return <BorderTopIcon className="h-3 w-3 stroke-[2]" />;
    case "TableBody":
      return <BorderAllIcon className="h-3 w-3 stroke-[2]" />;
    case "TableRow":
      return <ViewHorizontalIcon className="h-3 w-3 stroke-[2]" />;
    case "TableCell":
      return <DragHandleHorizontalIcon className="h-3 w-3 stroke-[2]" />;
    case "DataProvider":
      return <DatabaseIcon className="h-3 w-3 stroke-[2]" />;
    case "Box":
      return <BoxIcon className="h-3 w-3 stroke-[2]" />;
    default:
      return <BoxModelIcon className="h-3 w-3 stroke-[2]" />;
  }
};
