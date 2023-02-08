import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content, ContentVersion, DSL, File } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { DSL_VERSION, METHOD } from '../../../config/constant';
import metric from '../../third-parties/metric';
import {
  RelationAssocContent,
  RelationContentInfo,
  TagContentData,
  TagVersionRelation,
} from '../../types/content-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { TagContentVersionReq, TagVersionRelationRes } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('content')
export class GetTagContentInfo extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the content and version information of the specified tag
   * Response：
   * {
   * content: {content info}
   * contentInfo: {
   *  pages: [{content version info}]，
   *  templates: [{template version info}]
   *  variables: [{variable version info}]
   *  conditions: [{condition version info}]
   *  functions: [{function version info}]
   * ....
   * }}
   * @param  {TagContentVersionReq} params
   * @returns {ContentInfo}
   */
  @Post('/tag-versions')
  @OpenAPI({
    summary: i18n.sw.getContentTagsVersions,
    description: '',
    tags: ['Content'],
    operationId: 'get-tag-content-version',
  })
  @ResponseSchema(TagVersionRelationRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @Body() params: TagContentVersionReq,
  ): Promise<ResData<TagVersionRelation[]>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.GET });

      !params.tags && (params.tags = []);

      // Get qualified content details
      metric.time('app-content-tags');
      const contentVersionList = await this.service.content.tag.getAppContentByTags(params);
      metric.block('getAppContentByTags', 'app-content-tags');

      // Return empty results
      if (contentVersionList.length === 0) {
        return Response.success([], 1160501);
      }

      // Get content details, relation version details
      let contentVersionObject: Record<string, TagContentData> = {};
      let relationObject: Record<string, object> = {};
      const contentIds = _.map(contentVersionList, (version) => {
        contentVersionObject[version.id] = version;
        relationObject[version.id] = version.content?.relation || {};
        return version.id;
      });

      let contentList: Content[] = [];
      let relationDetails: Record<string, RelationAssocContent> = {};
      metric.time('relation-detail');
      [contentList, relationDetails] = await Promise.all([
        this.service.content.info.getDetailByIds(contentIds),
        this.service.version.relation.getRelationDetail(relationObject),
      ]);
      metric.block('getRelationDetail', 'relation-detail');

      const contentFileIds = _.map(contentList, 'fileId');
      let contentFileObject: Record<string, File>;
      if (contentFileIds.length > 0) {
        const fileList = await this.service.file.list.getDetailByIds(contentFileIds);
        contentFileObject = _.keyBy(fileList, 'id');
      }

      // Combine the returned data
      let tagContentList: TagVersionRelation[] = [];
      let contentInfo: Record<string, RelationContentInfo> = {};
      contentList.forEach((content) => {
        const contentRelation: RelationAssocContent = relationDetails[content.id] || {};

        // Combine the classified content of content info
        const fileObject: Record<string, File> = _.keyBy(contentRelation.files, 'id');
        const contentObject: Record<string, Content> = _.keyBy(contentRelation.contents, 'id');
        const versionObject: Record<string, ContentVersion> = _.keyBy(contentRelation.versions, 'contentId');

        contentInfo[content.id] = { pages: [] };
        contentRelation.contents?.forEach((relation) => {
          const fileType = <any>(
            (contentObject[relation.id] && fileObject[contentObject[relation.id].fileId]
              ? fileObject[contentObject[relation.id].fileId].type + 's'
              : '')
          );

          contentInfo[content.id] = {
            pages: [
              Object.assign({}, contentVersionObject[content.id]?.content, {
                dslVersion: contentVersionObject[content.id]?.dslVersion || DSL_VERSION,
                name: content.title,
                version: contentVersionObject[content.id]?.version,
                versionNumber: this.service.version.number.createNumberFromVersion(
                  contentVersionObject[content.id]?.version || '0.0.1',
                ),
                fileId: content.fileId,
                extension: this.service.content.tag.getTagsByKeys(content.tags, ['extendId', 'mockId']),
              }),
            ] as DSL[],
          };

          if (fileType) {
            !contentInfo[content.id][fileType] && (contentInfo[content.id][fileType] = []);
            contentInfo[content.id][fileType]?.push(
              Object.assign({}, versionObject[relation.id]?.content || undefined, {
                name: contentObject[relation.id]?.title,
                version: versionObject[relation.id]?.version,
                versionNumber: this.service.version.number.createNumberFromVersion(
                  versionObject[relation.id]?.version || '0.0.1',
                ),
                fileId: contentObject[relation.id]?.fileId,
              }),
            );
          }
        });

        contentInfo[content.id].files = (
          contentFileObject[content.fileId] ? [contentFileObject[content.fileId]] : []
        ) as File[];

        tagContentList.push({ content: content, contentInfo: contentInfo[content.id] || {} });
      });

      // send metric
      tagContentList.length === 0 && metric.empty(ctx.request.url, params.applicationId);

      return Response.success(tagContentList, 1160502);
    } catch (err) {
      return Response.error(err, i18n.content.getContentListFailed, 3160501);
    }
  }
}
