import * as React from "react";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import Form, { IChangeEvent } from "@rjsf/core";
import { useBrandingOptions, useBuilderProp } from "../../../../hooks";
import { Color, Numeric, SelectOption } from "@chaibuilder/runtime/controls";
import { ColorField } from "../../../../rjsf-widgets/color.tsx";
import { useBlocksContainer } from "../../../../hooks/useBrandingOptions.ts";
import { useTranslation } from "react-i18next";
import { cn } from "../../../../functions/Functions.ts";
import { ChaiBuilderThemeOptions } from "../../../../types/chaiBuilderEditorProps.ts";

const FONTS = [
  { title: "Roboto", value: "Roboto" },
  { title: "Open Sans", value: "Open Sans" },
  { title: "Montserrat", value: "Montserrat" },
  { title: "Lato", value: "Lato" },
  { title: "Poppins", value: "Poppins" },
  { title: "Oswald", value: "Oswald" },
  { title: "Raleway", value: "Raleway" },
  { title: "Ubuntu", value: "Ubuntu" },
  { title: "Nunito", value: "Nunito" },
  { title: "Merriweather", value: "Merriweather" },
  { title: "Nunito Sans", value: "Nunito Sans" },
  { title: "Playfair Display", value: "Playfair Display" },
  { title: "Rubik", value: "Rubik" },
  { title: "Inter", value: "Inter" },
  { title: "Lora", value: "Lora" },
  { title: "Kanit", value: "Kanit" },
  { title: "Fira Sans", value: "Fira Sans" },
  { title: "Hind", value: "Hind" },
  { title: "Quicksand", value: "Quicksand" },
  { title: "Mulish", value: "Mulish" },
  { title: "Barlow", value: "Barlow" },
  { title: "Inconsolata", value: "Inconsolata" },
  { title: "Titillium Web", value: "Titillium Web" },
  { title: "Heebo", value: "Heebo" },
  { title: "IBM Plex Sans", value: "IBM Plex Sans" },
  { title: "DM Sans", value: "DM Sans" },
  { title: "Nanum Gothic", value: "Nanum Gothic" },
  { title: "Karla", value: "Karla" },
  { title: "Arimo", value: "Arimo" },
  { title: "Cabin", value: "Cabin" },
  { title: "Oxygen", value: "Oxygen" },
  { title: "Overpass", value: "Overpass" },
  { title: "Assistant", value: "Assistant" },
  { title: "Tajawal", value: "Tajawal" },
  { title: "Play", value: "Play" },
  { title: "Exo", value: "Exo" },
  { title: "Cinzel", value: "Cinzel" },
  { title: "Faustina", value: "Faustina" },
  { title: "Philosopher", value: "Philosopher" },
  { title: "Gelasio", value: "Gelasio" },
  { title: "Sofia Sans Condensed", value: "Sofia Sans Condensed" },
  { title: "Noto Sans Devanagari", value: "Noto Sans Devanagari" },
  { title: "Actor", value: "Actor" },
  { title: "Epilogue", value: "Epilogue" },
  { title: "Glegoo", value: "Glegoo" },
  { title: "Overlock", value: "Overlock" },
  { title: "Lustria", value: "Lustria" },
  { title: "Ovo", value: "Ovo" },
  { title: "Suranna", value: "Suranna" },
  { title: "Bebas Neue", value: "Bebas Neue" },
  { title: "Manrope", value: "Manrope" },
];

const defaultThemeOptions: ChaiBuilderThemeOptions = {
  fontFamily: {
    heading: { "--font-heading": "Inter" },
    body: { "--font-body": "Inter" },
  },
  borderRadius: { "--radius": "0.375rem" },
  colors: [
    {
      group: "Body bg and fg",
      items: {
        background: { "--color-background": "#fff" },
        foreground: { "--color-foreground": "#171717" },
      },
    },
  ],
};

const ThemeConfigPanel = ({
  showHeading = true,
  className = "",
}: {
  className?: string;
  showHeading?: boolean;
}): React.JSX.Element => {
  const themeOptionsFn = useBuilderProp(
    "themeOptions",
    (_defaultTheme: ChaiBuilderThemeOptions) => defaultThemeOptions,
  );
  const themeOptions = themeOptionsFn(defaultThemeOptions);
  console.log(themeOptions);
  const [brandingOptions, setBrandingOptions] = useBrandingOptions();
  const [container] = useBlocksContainer();
  const brandingRef = React.useRef(brandingOptions);
  const { t } = useTranslation();

  const updateRealtime = ({ formData }: IChangeEvent, id?: string) => {
    if (id) {
      setBrandingOptions(formData);
      brandingRef.current = formData;
    }
  };

  const {
    bodyFont,
    headingFont,
    primaryColor,
    bodyTextDarkColor,
    bodyTextLightColor,
    bodyBgDarkColor,
    secondaryColor,
    bodyBgLightColor,
    roundedCorners,
  }: any = brandingOptions;

  let brandingProperties: Record<string, any> = {
    headingFont: SelectOption({
      title: t("Theme Config.Heading Font"),
      default: headingFont,
      options: FONTS,
    }),
    bodyFont: SelectOption({
      title: t("Theme Config.Body Font"),
      default: bodyFont,
      options: FONTS,
    }),
    roundedCorners: Numeric({
      title: t("Theme Config.Rounded Corner"),
      default: parseInt(roundedCorners || 5, 10),
    }),
    primaryColor: Color({ title: t("Theme Config.Primary"), default: primaryColor }),
    secondaryColor: Color({ title: t("Theme Config.Secondary"), default: secondaryColor }),
  };

  if (!container) {
    brandingProperties = {
      ...brandingProperties,
      bodyBgLightColor: Color({
        title: t("Theme Config.Background"),
        default: bodyBgLightColor,
      }),
      bodyTextLightColor: Color({
        title: t("Theme Config.Text Color"),
        default: bodyTextDarkColor,
      }),
      bodyBgDarkColor: Color({
        title: t("Theme Config.Background Dark Mode"),
        default: bodyBgDarkColor,
      }),
      bodyTextDarkColor: Color({
        title: t("Theme Config.Text Color Dark Mode"),
        default: bodyTextLightColor,
      }),
    };
  }

  const propsSchema: RJSFSchema = {
    type: "object",
    properties: {},
  };
  const uiSchema: UiSchema = {};

  Object.keys(brandingProperties).forEach((key) => {
    const property = brandingProperties[key];
    if (!propsSchema.properties) propsSchema.properties = {};
    propsSchema.properties[key] = property.schema;
    uiSchema[key] = property.uiSchema;
    return true;
  });

  return (
    <div className={cn("flex h-full w-full select-none flex-col", className)}>
      {showHeading ? (
        <div className="rounded-md bg-background/30 p-1">
          <h1 className="px-1 font-semibold">{t("Theme Configuration")}</h1>
        </div>
      ) : null}
      <Form
        widgets={{ color: ColorField }}
        idSeparator="."
        autoComplete="off"
        omitExtraData
        liveOmit
        liveValidate
        uiSchema={uiSchema}
        schema={propsSchema}
        formData={brandingOptions}
        validator={validator}
        onChange={updateRealtime}
      />
    </div>
  );
};

export default ThemeConfigPanel;
