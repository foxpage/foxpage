import _ from 'lodash';

import { localeTimeZone as originData } from '@/constants/index';
import { LocaleTimeZoneItem } from '@/types/index';

const localeTimeZone = _.cloneDeep(originData);

export const getTimeZoneList = () => {
  const list: LocaleTimeZoneItem[] = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const locale in localeTimeZone) {
    if (localeTimeZone[locale]) {
      localeTimeZone[locale].forEach((element) => {
        const idx = list.findIndex((item) => item.key === element.key);
        if (idx === -1) {
          list.push(element);
        }
      });
    }
  }
  return list;
};

export const getLocaleTimeZone = () => {
  const list: LocaleTimeZoneItem[] = [];
  const cloned = _.cloneDeep(localeTimeZone);
  // eslint-disable-next-line no-restricted-syntax
  for (const curLocale in cloned) {
    if (cloned[curLocale]) {
      cloned[curLocale].forEach((element) => {
        const idx = list.findIndex((item) => item.key === element.key);
        if (idx === -1) {
          const idxByValue = list.findIndex((item) => item.value === element.value);
          if (idxByValue > -1) {
            Object.assign(list[idxByValue], { country: `${list[idxByValue].country}/${element.country}` });
          } else {
            list.push(element);
          }
        }
      });
    }
  }
  return list;
};

export const getAllTimeZone = (locale) => {
  if (locale) {
    const cloned = _.cloneDeep(localeTimeZone);
    const curLocaleTimeZones = cloned[locale] || [];
    const list = getLocaleTimeZone();
    curLocaleTimeZones.forEach((item) => {
      Object.assign(item, { isCurLocale: true });
    });
    list.forEach((item) => {
      const idx = curLocaleTimeZones.findIndex((it) => it.value === item.value);
      if (idx === -1) {
        curLocaleTimeZones.push(item);
      }
    });
    return curLocaleTimeZones;
  }
  return getLocaleTimeZone();
};
