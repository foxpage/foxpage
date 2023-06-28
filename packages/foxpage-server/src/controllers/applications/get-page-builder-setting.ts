import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { TAG, TYPE } from '../../../config/constant';
import { AppSettingInfo } from '../../types/app-types';
import { ResData } from '../../types/index-types';
import { AppSettingItemRes, AppSettingListReq } from '../../types/validates/app-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('applications')
export class GetPageBuilderSettingList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get paging app builder setting data, include store page, template and package
   * @param  {AppSettingListReq} params
   * @returns {AppInfo}
   */
  @Get('/builder-setting-searchs')
  @OpenAPI({
    summary: i18n.sw.getAppSettingItemList,
    description: 'app-builder-setting',
    tags: ['Application'],
    operationId: 'get-page-builder-setting-list',
  })
  @ResponseSchema(AppSettingItemRes)
  async index(@QueryParams() params: AppSettingListReq): Promise<ResData<AppSettingInfo>> {
    try {
      const pageSize = this.service.application.setPageSize(params);
      const appDetail = await this.service.application.getDetailById(params.applicationId);
      let pageTypeList: any[] = [];
      let counts = 0;
      if (appDetail && appDetail.setting && params.type) {
        let typeList = appDetail.setting[params.type] || [];

        // add block data to component list
        if (params.type === TYPE.COMPONENT) {
          typeList = _.orderBy(
            _.concat(typeList, appDetail.setting[TYPE.BLOCK] || []),
            ['idx', 'createTime'],
            ['desc', 'desc'],
          );
        }

        const search = params.search?.toLowerCase();
        const packageTyeList = _.filter(typeList, (item) => {
          // search by component id, name, nickname or category name
          if (search) {
            if (search === item.id?.toLowerCase() || item.name?.toLowerCase().indexOf(search) !== -1) {
              return true;
            } else if (
              params.type === TYPE.COMPONENT &&
              ((
                (item.category.groupName?.toLowerCase() || '') +
                '.' +
                (item.category.categoryName?.toLowerCase() || '')
              ).indexOf(search) !== -1 ||
                (item.category.name?.toLowerCase() || '').indexOf(search) !== -1)
            ) {
              return true;
            }
            return false;
          }
          return true;
        });
        pageTypeList = _.chunk(packageTyeList, pageSize.size)[pageSize.page - 1];
        counts = packageTyeList.length;
      }

      const fileIds = _.map(pageTypeList, 'id');
      const fileList = await this.service.file.list.getDetailByIds(fileIds);
      const userBaseObject = await this.service.user.getUserBaseObjectByIds(_.map(fileList, 'creator'));

      let buildPageList: AppSettingInfo[] = [];
      const fileObject = _.keyBy(fileList, 'id');

      (pageTypeList || []).forEach((item) => {
        const fileDelivery = this.service.content.tag.getTagsByKeys(fileObject[item.id]?.tags || [], [
          TAG.DELIVERY_CLONE,
          TAG.DELIVERY_REFERENCE,
        ]);

        buildPageList.push(
          Object.assign(
            {},
            _.pick(item, ['idx', 'id', 'name', 'status', 'category', 'defaultValue']),
            _.pick(fileObject[item.id], ['type', 'createTime', 'updateTime']),
            {
              delivery: fileDelivery[TAG.DELIVERY_CLONE]
                ? TAG.DELIVERY_CLONE
                : fileDelivery[TAG.DELIVERY_REFERENCE]
                ? TAG.DELIVERY_REFERENCE
                : '',
              creator: userBaseObject[fileObject[item.id]?.creator] || {},
              deprecated:
                _.find(fileObject[item.id]?.tags || [], (tag) => tag.type === TAG.DEPRECATED)?.status ||
                false,
            },
          ) as AppSettingInfo,
        );
      });

      return Response.success(
        {
          pageInfo: {
            total: counts,
            page: params.page,
            size: params.size,
          },
          data: buildPageList,
        },
        1031101,
      );
    } catch (err) {
      return Response.error(err, i18n.app.listError, 3031101);
    }
  }
}
