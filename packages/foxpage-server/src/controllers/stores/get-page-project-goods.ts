import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Folder, StoreGoods } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { METHOD, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { GetPageTemplateListReq, GetPageTemplateListRes } from '../../types/validates/store-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

interface ProjectGoodsInfo extends Folder {
  files: StoreGoods[];
  applicationName: string;
}

@JsonController('stores')
export class GetStoreProjectList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the pagination data of store pages and templates, and display it according to the project
   * @param  {GetPageTemplateListReq} params
   * @returns {GetPageTemplateListRes}
   */
  @Post('/project-searchs')
  @OpenAPI({
    summary: i18n.sw.getStorePageTemplateList,
    description: '',
    tags: ['Store'],
    operationId: 'get-store-page-template-page-list',
  })
  @ResponseSchema(GetPageTemplateListRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @Body() params: GetPageTemplateListReq,
  ): Promise<ResData<ProjectGoodsInfo>> {
    try {
      this.service.store.goods.setPageSize(params);
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.GET });
      const goodsType = params.type || TYPE.PAGE;

      // Get store paging data
      const pageData = await this.service.store.goods.getPageList(Object.assign(params, { type: goodsType }));

      const projectList = _.cloneDeep(pageData.list) as Folder[];
      const projectIds = _.map(projectList, 'id');
      const projectUserIds = _.map(projectList, 'creator');

      // Get the files that are listed in the store under the project
      const [projectGoods, appList, projectUserObject] = await Promise.all([
        this.service.store.goods.find({ 'details.projectId': { $in: projectIds }, type: goodsType }),
        this.service.application.getDetailByIds(_.map(projectList, 'applicationId')),
        this.service.user.getUserBaseObjectByIds(projectUserIds),
      ]);

      const fileIds = _.map(projectGoods, (goods) => goods.details.id);
      const contentList = await this.service.content.file.getContentByFileIds(fileIds);
      const versionList = await this.service.version.list.getDetailByIds(
        _.map(contentList, 'liveVersionId') as string[],
      );
      const contentPictures: Record<string, any> = {};
      versionList.map((version) => {
        if (version.pictures && version.pictures.length > 0) {
          contentPictures[version.contentId] = version.pictures;
        }
      });

      const appObject = _.keyBy(appList, 'id');
      const projectGoodsObject = _.keyBy(projectGoods, 'id');
      const projectGoodsList = projectList.map((project) => {
        const goodsList: StoreGoods[] = [];
        let goodsFileIds: string[] = [];
        let pictures: any[] = [];
        for (const goodsId in projectGoodsObject) {
          if (projectGoodsObject[goodsId].details?.projectId === project.id) {
            goodsList.push(projectGoodsObject[goodsId]);
            goodsFileIds.push(projectGoodsObject[goodsId].details.id);
            delete projectGoodsObject[goodsId];
          }
        }

        if (goodsFileIds.length > 0) {
          for (const content of contentList) {
            if (goodsFileIds.indexOf(content.fileId) !== -1 && contentPictures[content.id]) {
              pictures.push(contentPictures[content.id][0]);
              break;
            }
          }
        }

        return Object.assign(
          {
            files: goodsList,
            pictures,
            type: goodsType,
          },
          {
            application: { id: project.applicationId, name: appObject[project.applicationId]?.name || '' },
            creator: projectUserObject[project.creator],
          },
          _.omit(project, ['creator']),
        );
      });

      return Response.success(
        {
          pageInfo: {
            total: pageData.count,
            page: params.page,
            size: params.size,
          },
          data: projectGoodsList,
        },
        1130601,
      );
    } catch (err) {
      return Response.error(err, i18n.store.getStorePageListFailed, 3130601);
    }
  }
}
