export const getGlobalLocale = () => {
  return localStorage['foxpage_locale'];
};

export const setGlobalLocale = (locale: string) => {
  localStorage['foxpage_locale'] = locale;
};
