import { ChaiBlockComponentProps, ChaiStyles, registerChaiBlockSchema, StylesProp } from "@chaibuilder/runtime";
import { InputIcon } from "@radix-ui/react-icons";

export type InputProps = {
  fieldName: string;
  showLabel: boolean;
  styles: ChaiStyles;
  inputStyles: ChaiStyles;
  required: boolean;
  inputType: string;
  label: string;
  placeholder: string;
  defaultValue: string;
};

// Extract autocomplete value and determine input type from combined inputType value
export const getInputTypeAndAutocomplete = (inputTypeValue: string): { type: string; autocomplete: string } => {
  // Default values
  const defaults = { type: "text", autocomplete: "on" };

  // If no input type, return defaults
  if (!inputTypeValue) return defaults;

  // Handle basic HTML input types with their corresponding autocomplete values
  const basicTypes = ["text", "password", "number", "hidden", "range", "color", "date", "time"];
  if (basicTypes.includes(inputTypeValue)) {
    return { type: inputTypeValue, autocomplete: "on" };
  }

  // Special cases for email, tel, and url which should have matching autocomplete values
  if (inputTypeValue === "email") {
    return { type: "email", autocomplete: "email" };
  }
  if (inputTypeValue === "tel") {
    return { type: "tel", autocomplete: "tel" };
  }
  if (inputTypeValue === "url") {
    return { type: "url", autocomplete: "url" };
  }

  // Map combined values to input type and autocomplete
  const typeMap: Record<string, { type: string; autocomplete: string }> = {
    // Special cases
    off: { type: "text", autocomplete: "off" },
    on: { type: "text", autocomplete: "on" },

    // Name related
    name: { type: "text", autocomplete: "name" },
    "honorific-prefix": { type: "text", autocomplete: "honorific-prefix" },
    "given-name": { type: "text", autocomplete: "given-name" },
    "additional-name": { type: "text", autocomplete: "additional-name" },
    "family-name": { type: "text", autocomplete: "family-name" },
    "honorific-suffix": { type: "text", autocomplete: "honorific-suffix" },
    nickname: { type: "text", autocomplete: "nickname" },
    firstName: { type: "text", autocomplete: "given-name" },
    lastName: { type: "text", autocomplete: "family-name" },

    // Contact related
    email: { type: "email", autocomplete: "email" },
    tel: { type: "tel", autocomplete: "tel" },
    "tel-country-code": { type: "tel", autocomplete: "tel-country-code" },
    "tel-national": { type: "tel", autocomplete: "tel-national" },
    "tel-area-code": { type: "tel", autocomplete: "tel-area-code" },
    "tel-local": { type: "tel", autocomplete: "tel-local" },
    "tel-extension": { type: "tel", autocomplete: "tel-extension" },

    // Address related
    "street-address": { type: "text", autocomplete: "street-address" },
    "address-line1": { type: "text", autocomplete: "address-line1" },
    "address-line2": { type: "text", autocomplete: "address-line2" },
    "address-line3": { type: "text", autocomplete: "address-line3" },
    "address-level1": { type: "text", autocomplete: "address-level1" },
    "address-level2": { type: "text", autocomplete: "address-level2" },
    "address-level3": { type: "text", autocomplete: "address-level3" },
    "address-level4": { type: "text", autocomplete: "address-level4" },
    country: { type: "text", autocomplete: "country" },
    "country-name": { type: "text", autocomplete: "country-name" },
    "postal-code": { type: "text", autocomplete: "postal-code" },

    // Credit card related
    "cc-name": { type: "text", autocomplete: "cc-name" },
    "cc-given-name": { type: "text", autocomplete: "cc-given-name" },
    "cc-additional-name": { type: "text", autocomplete: "cc-additional-name" },
    "cc-family-name": { type: "text", autocomplete: "cc-family-name" },
    "cc-number": { type: "text", autocomplete: "cc-number" },
    "cc-exp": { type: "text", autocomplete: "cc-exp" },
    "cc-exp-month": { type: "number", autocomplete: "cc-exp-month" },
    "cc-exp-year": { type: "number", autocomplete: "cc-exp-year" },
    "cc-csc": { type: "text", autocomplete: "cc-csc" },
    "cc-type": { type: "text", autocomplete: "cc-type" },

    // Date related
    bday: { type: "date", autocomplete: "bday" },
    "bday-day": { type: "number", autocomplete: "bday-day" },
    "bday-month": { type: "number", autocomplete: "bday-month" },
    "bday-year": { type: "number", autocomplete: "bday-year" },

    // Login related
    username: { type: "text", autocomplete: "username" },
    "new-password": { type: "password", autocomplete: "new-password" },
    "current-password": { type: "password", autocomplete: "current-password" },
    "one-time-code": { type: "text", autocomplete: "one-time-code" },

    // Transaction related
    "transaction-currency": { type: "text", autocomplete: "transaction-currency" },
    "transaction-amount": { type: "number", autocomplete: "transaction-amount" },

    // Other
    url: { type: "url", autocomplete: "url" },
    photo: { type: "url", autocomplete: "photo" },
    sex: { type: "text", autocomplete: "sex" },
    "organization-title": { type: "text", autocomplete: "organization-title" },
    organization: { type: "text", autocomplete: "organization" },
    language: { type: "text", autocomplete: "language" },
  };

  return typeMap[inputTypeValue] || defaults;
};

const InputBlock = (props: ChaiBlockComponentProps<InputProps>) => {
  const {
    blockProps,
    fieldName,
    label,
    placeholder,
    styles,
    inputStyles,
    showLabel,
    required,
    inputType,
    defaultValue,
  } = props;

  // Determine the actual input type and autocomplete value
  const { type: smartInputType, autocomplete } = getInputTypeAndAutocomplete(inputType);

  if (!showLabel) {
    return (
      <input
        name={fieldName}
        {...blockProps}
        {...inputStyles}
        {...styles}
        type={smartInputType}
        placeholder={placeholder}
        required={required}
        autoComplete={autocomplete}
        defaultValue={defaultValue}
      />
    );
  }

  return (
    <div {...styles} {...blockProps}>
      {showLabel && <label htmlFor={fieldName}>{label}</label>}
      <input
        name={fieldName}
        defaultValue={defaultValue}
        {...inputStyles}
        type={smartInputType}
        placeholder={placeholder}
        required={required}
        autoComplete={autocomplete}
      />
    </div>
  );
};

const Config = {
  type: "Input",
  label: "web_blocks.input",
  category: "core",
  icon: InputIcon,
  group: "form",
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp(""),
      inputStyles: StylesProp("w-full p-1"),
      fieldName: {
        type: "string",
        title: "Field Name",
        default: "fieldName",
      },
      inputType: {
        type: "string",
        title: "Type",
        default: "email",
        oneOf: [
          // Basic HTML input types
          { const: "text", title: "Text" },
          { const: "email", title: "Email" },
          { const: "password", title: "Password" },
          { const: "number", title: "Number" },
          { const: "tel", title: "Telephone" },
          { const: "hidden", title: "Hidden" },
          { const: "range", title: "Range" },
          { const: "color", title: "Color" },
          { const: "date", title: "Date" },
          { const: "time", title: "Time" },
          { const: "url", title: "URL" },

          // Name related
          { const: "name", title: "Name" },
          { const: "firstName", title: "First Name" },
          { const: "lastName", title: "Last Name" },

          // Contact related
          { const: "tel-country-code", title: "Telephone Country Code" },
          { const: "tel-national", title: "Telephone National" },
          { const: "tel-area-code", title: "Telephone Area Code" },
          { const: "tel-local", title: "Telephone Local" },
          { const: "tel-extension", title: "Telephone Extension" },

          // Address related
          { const: "street-address", title: "Street Address" },
          { const: "address-line1", title: "Address Line 1" },
          { const: "address-line2", title: "Address Line 2" },
          { const: "address-line3", title: "Address Line 3" },
          { const: "address-level1", title: "Address Level 1" },
          { const: "address-level2", title: "Address Level 2" },
          { const: "address-level3", title: "Address Level 3" },
          { const: "address-level4", title: "Address Level 4" },
          { const: "country", title: "Country" },
          { const: "country-name", title: "Country Name" },
          { const: "postal-code", title: "Postal Code" },

          // Credit card related
          { const: "cc-name", title: "Credit Card Name" },
          { const: "cc-number", title: "Credit Card Number" },
          { const: "cc-exp", title: "Credit Card Expiry" },
          { const: "cc-exp-month", title: "Credit Card Expiry Month" },
          { const: "cc-exp-year", title: "Credit Card Expiry Year" },
          { const: "cc-csc", title: "Credit Card CSC" },
          { const: "cc-type", title: "Credit Card Type" },

          // Date related
          { const: "bday", title: "Birthday" },
          { const: "bday-day", title: "Birthday Day" },
          { const: "bday-month", title: "Birthday Month" },
          { const: "bday-year", title: "Birthday Year" },

          // Login related
          { const: "username", title: "Username" },
          { const: "new-password", title: "New Password" },
          { const: "current-password", title: "Current Password" },
          { const: "one-time-code", title: "One Time Code" },

          // Transaction related
          { const: "transaction-currency", title: "Transaction Currency" },
          { const: "transaction-amount", title: "Transaction Amount" },

          // Other
          { const: "url", title: "URL" },
          { const: "photo", title: "Photo" },
          { const: "sex", title: "Sex" },
          { const: "organization-title", title: "Organization Title" },
          { const: "organization", title: "Organization" },
          { const: "language", title: "Language" },
        ],
      },
      showLabel: {
        type: "boolean",
        title: "Show Label",
        default: true,
      },
      label: {
        type: "string",
        title: "Label",
        default: "Label",
        ai: true,
        i18n: true,
      },
      placeholder: {
        type: "string",
        title: "Placeholder",
        default: "Placeholder",
      },

      required: {
        type: "boolean",
        title: "Required",
        default: false,
      },
      defaultValue: {
        type: "string",
        title: "Default Value",
        default: "",
      },
    },
  }),
  aiProps: ["label", "placeholder"],
  i18nProps: ["label", "placeholder"],
};

export { InputBlock as Component, Config };
