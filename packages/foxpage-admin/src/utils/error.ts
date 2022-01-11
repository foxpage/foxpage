import { message } from 'antd';

import { nameErrorMessage, nameRuleReg } from '@/constants/build';

export const isNameError = (name?: string) => {
  if (!name) {
    message.warning('Please input name');
    return true;
  }
  if (nameRuleReg.test(name)) {
    message.warning(nameErrorMessage);
    return true;
  }
  return false;
};
