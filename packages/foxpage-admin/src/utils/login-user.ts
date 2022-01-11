import { LoginUser } from '@/types/index';

export const getLoginUser = () => {
  try {
    const userInfo = localStorage['foxpage_user'] ? JSON.parse(localStorage['foxpage_user']) : {};
    return userInfo as LoginUser;
  } catch (error) {
    console.error(error);
    return {} as LoginUser;
  }
};

export const setLoginUser = (userInfo?: LoginUser) => {
  try {
    localStorage['foxpage_user'] = JSON.stringify(userInfo || {});
  } catch (error) {
    console.error(error);
  }
};
