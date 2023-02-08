import 'reflect-metadata';

import _ from 'lodash';
import { Body, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { DSL, DslRelation } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { ResData } from '../../types/index-types';
import {
  BlockLocaleLiveVersionReq,
  BlockLocaleLiveVersionRes,
} from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('blocks')
export class GetBlockLocaleLiveVersions extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the locale live versions of block data
   * @param  {BlockLocaleLiveVersionReq} params
   * @returns {BlockLocaleLiveVersionRes}
   */
  @Post('/locale-live-version')
  @OpenAPI({
    summary: i18n.sw.getPageLiveVersion,
    description: '',
    tags: ['Page'],
    operationId: 'get-page-live-version',
  })
  @ResponseSchema(BlockLocaleLiveVersionRes)
  async index(@Body() params: BlockLocaleLiveVersionReq): Promise<ResData<Record<string, DSL>>> {
    try {
      let fileContentObject = await this.service.content.file.getFileLocaleContent(params.ids, {
        locale: params.locale,
        isLive: true,
      });

      const existFileIds = _.keys(fileContentObject);
      const missingFileIds = _.difference(params.ids, existFileIds);

      if (missingFileIds.length > 0) {
        const baseContentObject = await this.service.content.file.getFileLocaleContent(params.ids, {
          isLive: true,
        });
        fileContentObject = _.merge(fileContentObject, baseContentObject);
      }

      // get content live version data
      const liveVersionIds = _.map(
        _.filter(_.toArray(fileContentObject), (content) => content.liveVersionId),
        'liveVersionId',
      );
      const contentVersionList = await this.service.version.list.getDetailByIds(liveVersionIds);
      const versionObject = _.keyBy(contentVersionList, 'contentId');

      // get version relations
      let relationObject: Record<string, DslRelation> = {};
      _.map(contentVersionList, (version) => {
        relationObject = _.merge(relationObject, version.content?.relation || {});
      });

      const relationData = await this.service.content.relation.getRelationDetailRecursive(relationObject);
      const relationContentObject = _.keyBy(relationData.relationList, 'contentId');

      let fileContentLiveVersion: Record<string, DSL> = {};
      params.ids.forEach((fileId) => {
        const content = fileContentObject[fileId] ? versionObject[fileContentObject[fileId].id]?.content : {};
        if (!_.isEmpty(content)) {
          const contentRelation = content.relation || {};
          let relations: Record<string, DSL[]> = {};

          for (const item in contentRelation) {
            if (!relations[contentRelation[item].type + 's']) {
              relations[contentRelation[item].type + 's'] = [];
            }
            if (relationContentObject[contentRelation[item].id]) {
              relations[contentRelation[item].type + 's'].push(
                relationContentObject[contentRelation[item].id].content || {},
              );
            }
          }

          fileContentLiveVersion[fileId] = Object.assign({}, content, { relations });
        } else {
          fileContentLiveVersion[fileId] = {} as any;
        }
      });

      return Response.success(fileContentLiveVersion, 1052102);
    } catch (err) {
      return Response.error(err, i18n.page.getBlockContentLiveVersionFailed, 3052101);
    }
  }
}
