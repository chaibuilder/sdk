// Default language codes with only English as base
const BASE_LANGUAGE_CODES = {
  en: "English",
  fr: "French",
  sl: "Slovenian",
};
const envLanguages = process.env.NEXT_PUBLIC_SUPPORTED_LANGUAGES;

function getAdditionalLanguageCodes(): Record<string, string> {
  try {
    if (!envLanguages) {
      return {};
    }
    const parsed = JSON.parse(envLanguages);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed;
    }
    console.warn("SUPPORTED_LANGUAGES env variable is not a valid object");
    return {};
  } catch (error) {
    console.warn("Failed to parse SUPPORTED_LANGUAGES env variable:", error);
    return {};
  }
}

// Combine base language with additional languages from environment
export const LANGUAGE_CODES: Record<string, string> = {
  ...BASE_LANGUAGE_CODES,
  ...getAdditionalLanguageCodes(),
};

// Convert to array format for components that need it
export const getLanguagesArray = () =>
  Object.entries(LANGUAGE_CODES).map(([code, name]) => ({
    code,
    name,
  }));
