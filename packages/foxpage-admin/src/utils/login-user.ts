import { LoginReturn } from '@/types/user';

import { decrypt, encrypt } from './crypt';

const KEY = 'FOXPAGE.USER';

export const getLoginUser = () => {
  try {
    const cachedStr = localStorage.getItem(KEY);
    const userInfo = cachedStr ? JSON.parse(decrypt(cachedStr)) : {};
    return userInfo as LoginReturn;
  } catch (error) {
    console.error(error);
    return {} as LoginReturn;
  }
};

export const setLoginUser = (userInfo?: LoginReturn) => {
  try {
    localStorage.setItem(KEY, encrypt(JSON.stringify(userInfo || {})));
  } catch (error) {
    console.error(error);
  }
};
