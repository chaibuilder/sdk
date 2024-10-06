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
      return <GlobeIcon className="h-4 w-4" />;
    case "Image":
      return <ImageIcon />;
    case "Heading":
      return <HeadingIcon />;
    case "Text":
      return <TextIcon />;
    case "Link":
      return <Link1Icon />;
    case "Video":
      return <VideoIcon />;
    case "RichText":
      return <CursorTextIcon />;
    case "Button":
      return <ButtonIcon />;
    case "CustomHTML":
      return <CodeIcon />;
    case "Divider":
      return <DividerHorizontalIcon />;
    case "Icon":
      return <SketchLogoIcon />;
    case "List":
      return <RowsIcon />;
    case "Paragraph":
      return <TextIcon />;
    case "Row":
      return <RowsIcon />;
    case "ListItem":
      return <ColumnsIcon />;
    case "LineBreak":
      return <SpaceBetweenVerticallyIcon />;
    case "Form":
      return <GroupIcon />;
    case "Checkbox":
      return <CheckboxIcon />;
    case "FormButton":
      return <ButtonIcon />;
    case "Input":
    case "TextArea":
      return <InputIcon />;
    case "Radio":
      return <RadiobuttonIcon />;
    case "Select":
      return <DropdownMenuIcon />;
    case "Table":
      return <TableIcon />;
    case "TableHead":
      return <BorderTopIcon />;
    case "TableBody":
      return <BorderAllIcon />;
    case "TableRow":
      return <ViewHorizontalIcon />;
    case "TableCell":
      return <DragHandleHorizontalIcon />;
    case "DataProvider":
      return <DatabaseIcon size={16} />;
    case "Box":
      return <BoxIcon />;
    default:
      return <BoxModelIcon />;
  }
};
