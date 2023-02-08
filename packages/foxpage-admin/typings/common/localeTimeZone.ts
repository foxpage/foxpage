export type LocaleTimeZone = Record<string, LocaleTimeZoneItem[]>;

export interface LocaleTimeZoneItem {
  key: number;
  value: string;
  desc: string;
  country: string;
}
