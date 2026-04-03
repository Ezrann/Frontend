import en from "../messages/en";
import km from "../messages/km";

export const dictionaries = {
  en,
  km,
};

export type Language = keyof typeof dictionaries;
export type TranslationDictionary = (typeof dictionaries)[Language];

export const defaultLanguage: Language = "en";

export function getTranslation(
  language: Language,
  key: string,
  params?: Record<string, string | number>
) {
  const value = key
    .split(".")
    .reduce<unknown>((current, part) => {
      if (typeof current !== "object" || current === null) {
        return undefined;
      }
      return (current as Record<string, unknown>)[part];
    }, dictionaries[language]);

  if (typeof value !== "string") {
    return key;
  }

  if (!params) {
    return value;
  }

  return value.replace(/\{(\w+)\}/g, (_, token) => {
    const replacement = params[token];
    return replacement === undefined ? `{${token}}` : String(replacement);
  });
}
