import fs from 'fs';

import { LangEnums } from '@foxpage/foxpage-server-types';

const enJson = fs.readFileSync('./en.json');
const cnJson = fs.readFileSync('./cn.json');

const lang: Record<LangEnums, any> = {
  en: JSON.parse(enJson.toString()),
  cn: JSON.parse(cnJson.toString()),
};

export default lang;
