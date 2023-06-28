import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

// import { Content } from '@foxpage/foxpage-server-types';
import { i18n } from '../../../app.config';
import { TAG, TYPE } from '../../../config/constant';
import { ResData } from '../../types/index-types';
import { AppContentId, getContentSyncInfoRes } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('contents')
export class GetContentSyncInfo extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the content that sync details, default return the build version data
   * include dsl, relation details
   * @param params
   * @returns
   */
  @Get('/sync-info')
  @OpenAPI({
    summary: i18n.sw.getContentSyncInfo,
    description: '',
    tags: ['Content'],
    operationId: 'get-content-sync-info',
  })
  @ResponseSchema(getContentSyncInfoRes)
  async index(@QueryParams() params: AppContentId): Promise<ResData<any>> {
    const { applicationId = '', id = '' } = params;

    try {
      const contentDetail = await this.service.content.info.getDetailById(id);
      if (this.notValid(contentDetail) || contentDetail.applicationId !== applicationId) {
        return Response.warning(i18n.content.invalidAppOrContentId, 2162401);
      }

      const buildVersion = await this.service.version.info.getMaxBaseContentVersionDetail(id);
      const relationIds: string[] = [];
      // filter template and block type relation data
      _.toArray(buildVersion.content.relation).forEach((item) => {
        [TYPE.TEMPLATE, TYPE.BLOCK].indexOf(item.type) === -1 && relationIds.push(item.id);
      });

      // const relationList = await this.service.relation.getRelationsAndDeps(relationIds);
      const [relationContentList, relationVersionList, appDefaultFolderIds] = await Promise.all([
        this.service.content.list.getDetailByIds(relationIds),
        this.service.version.list.getContentMaxVersionDetail(relationIds),
        this.service.folder.info.getAppDefaultItemFolderIds(applicationId),
      ]);

      const relationFileIds = _.map(relationContentList, 'fileId');
      const relationFileList = await this.service.file.list.getDetailByIds(relationFileIds);
      const relationFileObject = _.keyBy(relationFileList, 'id');
      const relationVersionObject = _.keyBy(relationVersionList, 'contentId');

      let relations: Record<string, any[]> = {};
      relationContentList.forEach((content) => {
        if (content.type) {
          const relationType = content.type + 's';
          !relations[relationType] && (relations[relationType] = []);
          relations[relationType].push({
            isAppLevel: appDefaultFolderIds.indexOf(relationFileObject[content.fileId]?.folderId) !== -1,
            file: relationFileObject[content.fileId] || {},
            content,
            version: _.pick(relationVersionObject[content.id] || {}, ['id', 'content']),
          });
        }
      });

      return Response.success(
        {
          id,
          relations,
          content: buildVersion.content || {},
          tags: _.filter(contentDetail.tags || [], (tag) => {
            return [TAG.SYNC_FROM, TAG.SYNC_TO].indexOf(tag.type) !== -1;
          }),
        },
        1162401,
      );
    } catch (err) {
      return Response.error(err, '', 3162401);
    }
  }
}
