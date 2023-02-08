import { message } from 'antd';

import { keywordReg, nameRuleReg } from '@/constants/build';
import { getBusinessI18n } from '@/foxI18n/index';

export const nameErrorCheck = (name?: string) => {
  const {
    application: { nameInvalid },
    global: { nameFormatInvalid },
  } = getBusinessI18n();

  if (!name) {
    message.warning(nameInvalid);
    return true;
  }

  if (keywordReg.test(name)) {
    message.warning(nameFormatInvalid);
    return true;
  }

  if (nameRuleReg.test(name)) {
    message.warning(nameFormatInvalid);
    return true;
  }

  return false;
};

export default { nameErrorCheck };
