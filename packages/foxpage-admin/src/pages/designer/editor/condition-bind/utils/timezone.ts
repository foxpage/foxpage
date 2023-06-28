import _ from 'lodash';

import { LocaleTimeZoneConfigType, TimeZoneType } from '@/types/index';

const localeTimeZone: LocaleTimeZoneConfigType = require('../config/locale-time-zone.json');

const TIME_ZONE_START_POS = 19;

export default function getTimeZoneList() {
  const list: TimeZoneType[] = [];
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
}

export function getLocaleTimeZone() {
  const list: TimeZoneType[] = [];
  const cloned = _.cloneDeep(localeTimeZone);
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
}

export function getAllTimeZone(locale: string) {
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
}

export function getTimeByZone(timezone, time) {
  if (!time) {
    return '';
  }
  let startTimeStr = time;
  startTimeStr =
    startTimeStr.substr(0, TIME_ZONE_START_POS) +
    timezone +
    startTimeStr.substr(TIME_ZONE_START_POS + 3, startTimeStr.length);
  return startTimeStr;
}
