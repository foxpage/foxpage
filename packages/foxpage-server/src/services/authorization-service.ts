import { FoxCtx } from 'src/types/index-types';

import { Authorize } from '@foxpage/foxpage-server-types';

import { TYPE } from '../../config/constant';
import * as Model from '../models';
import * as Service from '../services';

import { BaseService } from './base-service';

export class AuthService extends BaseService<Authorize> {
  private static _instance: AuthService;

  constructor() {
    super(Model.auth);
  }

  /**
   * Single instance
   * @returns AuthService
   */
  public static getInstance(): AuthService {
    this._instance || (this._instance = new AuthService());
    return this._instance;
  }

  /**
   * Check whether the specified user is the owner of the app
   * @param  {string} applicationId
   * @param  {string} user
   * @returns Promise
   */
  async application(applicationId: string, options: { ctx: FoxCtx; mask?: number }): Promise<boolean> {
    const [appDetail, hasAuth] = await Promise.all([
      Service.application.getDetailById(applicationId),
      this.getTargetTypeAuth(
        { type: TYPE.APPLICATION, typeId: applicationId, targetId: options.ctx.userInfo.id },
        options.mask,
      ),
    ]);

    if (appDetail?.creator === options.ctx.userInfo?.id || hasAuth) {
      return true;
    }

    return false;
  }

  /**
   * Check whether the specified user is the owner of the organization
   * @param  {string} applicationId
   * @param  {string} user
   * @returns Promise
   */
  async organization(organizationId: string, options: { ctx: FoxCtx; mask?: number }): Promise<boolean> {
    const [orgDetail, hasAuth] = await Promise.all([
      Service.org.getDetailById(organizationId),
      this.getTargetTypeAuth(
        { type: TYPE.ORGANIZATION, typeId: organizationId, targetId: options.ctx.userInfo.id },
        options.mask,
      ),
    ]);

    return orgDetail?.creator === options.ctx.userInfo?.id || hasAuth;
  }

  /**
   * Check if the specified user is the owner of the team
   * @param  {string} applicationId
   * @param  {string} user
   * @returns Promise
   */
  async team(teamId: string, options: { ctx: FoxCtx; mask?: number }): Promise<boolean> {
    const [teamDetail, hasAuth] = await Promise.all([
      Service.team.getDetailById(teamId),
      this.getTargetTypeAuth(
        { type: TYPE.TEAM, typeId: teamId, targetId: options.ctx.userInfo.id },
        options.mask,
      ),
    ]);

    return teamDetail?.creator === options.ctx.userInfo?.id || hasAuth;
  }

  /**
   * Check whether the specified user has permission to operate the specified folder.
   *
   * current only consider the folder is a project
   * @param  {string} applicationId
   * @param  {string} user
   * @returns Promise
   */
  async folder(folderId: string, options: { ctx: FoxCtx; mask?: number }): Promise<boolean> {
    const user = options.ctx.userInfo.id;

    const [folderDetail, hasAppAuth, hasAuth] = await Promise.all([
      Service.folder.info.getDetailById(folderId),
      this.application(options.ctx.logAttr.applicationId || '', options),
      this.getTargetTypeAuth(
        { type: TYPE.FOLDER, typeId: folderId, targetId: options.ctx.userInfo.id },
        options.mask,
      ),
    ]);

    return folderDetail?.creator === user || hasAppAuth || hasAuth;
  }

  /**
   * Check whether the specified user has permission to operate the specified file.
   * Get the owner of the folder (project or system folder) where the file is located,
   * and compare it with the current user
   * @param  {string} applicationId
   * @param  {string} user
   * @returns Promise
   */
  async file(fileId: string, options: { ctx: FoxCtx; mask?: number }): Promise<boolean> {
    const user = options.ctx.userInfo.id;
    !options?.mask && options.mask === 2;

    const [fileDetail, hasAppAuth, hasAuth] = await Promise.all([
      Service.file.info.getDetailById(fileId),
      this.application(options.ctx.logAttr.applicationId || '', options),
      this.getTargetTypeAuth(
        { type: TYPE.FILE, typeId: fileId, targetId: options.ctx.userInfo.id },
        options.mask,
      ),
    ]);

    if (fileDetail?.creator === user || hasAppAuth || hasAuth) {
      return true;
    }

    return fileDetail?.folderId ? this.folder(fileDetail.folderId, options) : false;
  }

  /**
   * Check whether the specified user has permission to operate the specified content.
   * Get the owner of the folder (project or system folder) where the content is located,
   * and compare it with the current user
   * @param  {string} applicationId
   * @param  {string} user
   * @returns Promise
   */
  async content(contentId: string, options: { ctx: FoxCtx; mask?: number }): Promise<boolean> {
    const user = options.ctx.userInfo.id;

    const [contentDetail, hasAppAuth, hasAuth] = await Promise.all([
      Service.content.info.getDetailById(contentId),
      this.application(options.ctx.logAttr.applicationId || '', options),
      this.getTargetTypeAuth(
        { type: TYPE.CONTENT, typeId: contentId, targetId: options.ctx.userInfo.id },
        options.mask,
      ),
    ]);

    if (contentDetail?.creator === user || hasAppAuth || hasAuth) {
      return true;
    }

    return contentDetail?.fileId ? this.file(contentDetail.fileId, options) : false;
  }

  /**
   * Check whether the specified user has permission to operate the specified content version.
   * Get the owner of the folder (project or system folder) where the version content is located,
   * and compare it with the current user
   * @param  {string} applicationId
   * @param  {string} user
   * @returns Promise
   */
  async version(versionId: string, options: { ctx: FoxCtx; mask?: number }): Promise<boolean> {
    const user = options.ctx.userInfo.id;

    const [versionDetail, hasAppAuth, hasAuth] = await Promise.all([
      Service.version.info.getDetailById(versionId),
      this.application(options.ctx.logAttr.applicationId || '', options),
      this.getTargetTypeAuth(
        { type: TYPE.VERSION, typeId: versionId, targetId: options.ctx.userInfo.id },
        options.mask,
      ),
    ]);

    if (versionDetail?.creator === user || hasAppAuth || hasAuth) {
      return true;
    }

    return versionDetail?.contentId ? this.content(versionDetail.contentId, options) : false;
  }

  /**
   * check the target type id's auth,
   * current only check the allow auth setting
   * @param params
   * @param mask
   * @returns
   */
  async getTargetTypeAuth(
    params: { type: string; typeId: string; targetId: string },
    mask: number = 2,
  ): Promise<boolean> {
    const authDetail = await this.getDetail(params);
    return (
      authDetail?.deleted === false && ((authDetail?.mask & 1) === 1 || (authDetail?.mask & mask) === mask)
    );
  }

  /**
   * Check whether the specified user has authorization rights to the specified data
   *
   * @param {{ type: string; typeId: string }} params
   * @param {{ ctx: FoxCtx; mask?: number }} options
   * @returns {Promise<boolean>}
   * @memberof AuthService
   */
  async checkTypeIdAuthorize(
    params: { type: string; typeId: string },
    options: { ctx: FoxCtx; mask?: number },
  ): Promise<boolean> {
    if (params.type === TYPE.APPLICATION) {
      return this.application(params.typeId, options);
    }
    return false;
  }
}
