import { message } from 'antd';

import { nameRuleReg } from '@/constants/build';
import { getBusinessI18n } from '@/pages/locale';

export const isNameError = (name?: string) => {
  const {
    application: { nameInvalid },
    global: { nameFormatInvalid },
  } = getBusinessI18n();
  if (!name) {
    message.warning(nameInvalid);
    return true;
  }
  if (nameRuleReg.test(name)) {
    message.warning(nameFormatInvalid);
    return true;
  }
  return false;
};
