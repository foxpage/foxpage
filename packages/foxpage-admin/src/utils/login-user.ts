import { LoginReturn, UserPreference } from '@/types/index';

import { decrypt, encrypt } from './crypt';

const KEY = 'FOXPAGE.USER';
const KEY_PREFERENCE = 'FOXPAGE.PREFERENCE';

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

export const getUserPreference = () => {
  try {
    const cachedStr = localStorage.getItem(KEY_PREFERENCE);
    const userPreference = cachedStr ? JSON.parse(decrypt(cachedStr)) : {};
    return userPreference as UserPreference;
  } catch (error) {
    console.error(error);
    return {} as UserPreference;
  }
};

export const setUserPreference = (preference?: UserPreference) => {
  try {
    localStorage.setItem(KEY_PREFERENCE, encrypt(JSON.stringify(preference || {})));
  } catch (error) {
    console.error(error);
  }
};
