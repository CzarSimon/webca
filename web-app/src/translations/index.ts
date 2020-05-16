import { TypedMap, TextMap } from "../types";
import { enUS } from './en';

export const messages: TypedMap<TextMap> = {
  "en-US": enUS,
};

export function getLocale(): string {
  return "en-US";
}
