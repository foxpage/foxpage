/**
 *用户登录服务层抽象
 */
export interface LoginServiceAbstract {
  signIn(userInfo: any): Promise<{}>;
  signOut(userInfo: any): Promise<{}>;
}
