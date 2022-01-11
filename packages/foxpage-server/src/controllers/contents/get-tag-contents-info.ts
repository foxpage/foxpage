import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content, ContentVersion, DSL, File, Tag } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { METHOD } from '../../../config/constant';
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
export class GetContentTagVersions extends BaseController {
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

      const tags = (params.tags || []) as Tag[];
      if (tags.length === 0) {
        return Response.warning(i18n.content.tagsCannotBeEmpty);
      }

      // Get qualified content details
      const contentVersionList = await this.service.content.tag.getAppContentByTags(params);

      // Return empty results
      if (contentVersionList.length === 0) {
        return Response.success([]);
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
      [contentList, relationDetails] = await Promise.all([
        this.service.content.info.getDetailByIds(contentIds),
        this.service.version.relation.getRelationDetail(relationObject),
      ]);

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
        contentRelation.contents.forEach((relation) => {
          const fileType = <any>(
            (contentObject[relation.id] && fileObject[contentObject[relation.id].fileId]
              ? fileObject[contentObject[relation.id].fileId].type + 's'
              : '')
          );

          contentInfo[content.id] = { pages: [contentVersionObject[content.id]?.content] as DSL[] };

          if (fileType) {
            !contentInfo[content.id][fileType] && (contentInfo[content.id][fileType] = []);
            contentInfo[content.id][fileType]?.push(versionObject[relation.id]?.content || undefined);
          }
        });

        contentInfo[content.id].files = (contentFileObject[content.fileId]
          ? [contentFileObject[content.fileId]]
          : []) as File[];

        tagContentList.push({ content: content, contentInfo: contentInfo[content.id] || {} });
      });
      return Response.success(tagContentList);
    } catch (err) {
      return Response.error(err, i18n.content.getContentListFailed);
    }
  }
}
