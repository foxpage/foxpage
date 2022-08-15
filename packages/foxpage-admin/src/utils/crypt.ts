import CryptoJS from 'crypto-js';

const SECRET_KEY = 'FOXPAGE.SECRET_KEY';

export const encrypt = (str: string) => {
  const encData = CryptoJS.AES.encrypt(str, SECRET_KEY).toString();
  const result = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encData));
  return result;
};

export const decrypt = (str: string) => {
  const decData = CryptoJS.enc.Base64.parse(str).toString(CryptoJS.enc.Utf8);
  const result = CryptoJS.AES.decrypt(decData, SECRET_KEY).toString(CryptoJS.enc.Utf8);
  return result;
};
