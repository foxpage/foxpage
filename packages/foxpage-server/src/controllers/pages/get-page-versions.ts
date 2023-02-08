import 'reflect-metadata';

import _ from 'lodash';
import { Ctx, Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { VERSION } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { UserBase } from '../../types/user-types';
import { GetTypeItemVersionReq, TypeItemVersionsRes } from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

interface VersionItem {
  id: string;
  contentId: string;
  version: string;
  versionNumber: number;
  status: string;
  isLive: boolean;
  creator: UserBase;
  createTime: Date;
  updateTime: Date;
}

@JsonController()
export class GetPageTypeItemVersionList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the page type item version list
   * @param  {GetTypeItemVersionReq} params
   * @param  {Header} headers
   * @returns Content
   */
  @Get('pages/versions')
  @Get('templates/versions')
  @Get('blocks/versions')
  @OpenAPI({
    summary: i18n.sw.getPageTypeItemVersions,
    description: '',
    tags: ['Page'],
    operationId: 'get-page-type-item-versions',
  })
  @ResponseSchema(TypeItemVersionsRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @QueryParams() params: GetTypeItemVersionReq,
  ): Promise<ResData<VersionItem[]>> {
    const { applicationId = '', contentId = '' } = params;

    try {
      const pageSize = this.service.content.info.setPageSize(params);
      const apiType = this.getRoutePath(ctx.request.url);

      const contentDetail = await this.service.content.info.getDetailById(contentId);
      if (this.notValid(contentDetail)) {
        return Response.warning(i18n.page.invalidContentId, 2052401);
      } else if (contentDetail.type !== apiType || contentDetail.applicationId !== applicationId) {
        return Response.success(
          {
            pageInfo: this.paging(0, pageSize),
            data: [],
          },
          1052401,
        );
      }

      // get version count and list
      const versionFilter: Record<string, any> = {
        contentId,
        status: { $ne: VERSION.STATUS_BASE },
        deleted: false,
      };
      const [count, versionList] = await Promise.all([
        this.service.version.info.getCount(versionFilter),
        this.service.version.list.find(versionFilter, '', {
          skip: (pageSize.page - 1) * pageSize.size,
          limit: pageSize.size,
        }),
      ]);

      const userIds = _.uniq(_.map(versionList, 'creator'));
      const userObject = await this.service.user.getUserBaseObjectByIds(userIds);

      let versionItemList: VersionItem[] = [];
      versionList.forEach((version) => {
        versionItemList.push(
          Object.assign(
            {},
            _.pick(version, [
              'id',
              'contentId',
              'version',
              'versionNumber',
              'status',
              'createTime',
              'updateTime',
            ]),
            {
              isLive: contentDetail.liveVersionId === version.id,
              creator: userObject[version.creator] || {},
            },
          ) as VersionItem,
        );
      });

      return Response.success(
        {
          pageInfo: this.paging(count, pageSize),
          data: versionItemList,
        },
        1052402,
      );
    } catch (err) {
      return Response.error(err, i18n.page.getPageVersionsFailed, 3052401);
    }
  }
}
