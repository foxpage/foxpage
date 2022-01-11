export interface TimeZoneType {
  key: string;
  value: string;
  desc: string;
  country: string;
}

export interface LocaleTimeZoneConfigType {
  [locale: string]: TimeZoneType[];
}
