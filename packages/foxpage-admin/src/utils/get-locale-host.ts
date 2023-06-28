import { ApplicationHost } from '@/types/index';

export const getLocaleHost = (host: ApplicationHost[] = [], locale: string) => {
  let localeHost = host && locale ? host.filter((item) => item.locales?.indexOf(locale) > -1) : [];
  if (!localeHost || localeHost.length === 0) localeHost = [host[0]];
  return localeHost;
};
