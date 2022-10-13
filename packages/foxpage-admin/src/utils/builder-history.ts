import { decrypt, encrypt } from './crypt';

const KEY = 'FOXPAGE.BUILDER_HISTORY';

export const getBuilderHistory = () => {
  try {
    const cachedStr = sessionStorage.getItem(KEY);
    const history = cachedStr ? JSON.parse(decrypt(cachedStr)) : {};
    return history;
  } catch (error) {
    console.error(error);
    return {};
  }
};

export const setBuilderHistory = (history?: any) => {
  try {
    sessionStorage.setItem(KEY, encrypt(JSON.stringify(history || {})));
  } catch (error) {
    console.error(error);
  }
};
