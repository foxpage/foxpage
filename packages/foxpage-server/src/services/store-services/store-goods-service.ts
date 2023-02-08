import _ from 'lodash';

import { Folder, StoreGoods } from '@foxpage/foxpage-server-types';

import { TYPE } from '../../../config/constant';
import * as Model from '../../models';
import { PageData } from '../../types/index-types';
import { StoreFileStatus, StorePageParams } from '../../types/store-types';
import { BaseService } from '../base-service';
import * as Service from '../index';

export class StoreGoodsService extends BaseService<StoreGoods> {
  private static _instance: StoreGoodsService;

  constructor() {
    super(Model.storeGoods);
  }

  /**
   * Single instance
   * @returns StoreGoodsService
   */
  public static getInstance(): StoreGoodsService {
    this._instance || (this._instance = new StoreGoodsService());
    return this._instance;
  }

  /**
   * Get goods details by store target id
   * @param  {string} typeId
   * @returns Promise
   */
  async getDetailByTypeId(typeId: string): Promise<StoreGoods> {
    const goodsList = await this.find({ 'details.id': typeId });
    return goodsList?.[0] || undefined;
  }

  /**
   * Get store goods paging data
   * @param  {StorePageParams} params
   * @returns Promise
   */
  async getPageList(params: StorePageParams): Promise<PageData<StoreGoods | Folder>> {
    let pageData = [];
    let count = 0;

    // Get page and template goods by project
    if (params.type && [TYPE.PAGE, TYPE.TEMPLATE].indexOf(params.type) !== -1) {
      const match: any = { 'details.projectId': { $exists: true }, type: params.type, status: 1 };
      if (params.appIds && params.appIds.length > 0) {
        match['details.applicationId'] = { $in: params.appIds };
      }

      const [projectGoods, projectCount] = await Promise.all([
        this.model.aggregate([
          { $match: match },
          { $group: { _id: '$details.projectId', createTime: { $max: '$createTime' } } },
          { $sort: { createTime: -1 } },
          { $skip: ((params.page || 1) - 1) * (params.size || 10) },
          { $limit: params.size || 10 },
        ]),
        this.model.aggregate([{ $match: match }, { $group: { _id: '$details.projectId' } }]),
      ]);
      const projectIds = _.map(projectGoods, '_id');
      pageData = await Service.folder.list.getDetailByIds(projectIds);
      count = projectCount.length || 0;
    } else {
      [pageData, count] = await Promise.all([
        Model.storeGoods.getGoodsPageList(params),
        Model.storeGoods.getGoodsCount(params),
      ]);
    }

    return { count: count, list: pageData };
  }

  /**
   * Query product details through the file and application ID of the product
   * @param  {string} applicationId
   * @param  {string} fileId
   * @returns Promise
   */
  async getDetailByAppFileId(applicationId: string, fileId: string): Promise<StoreGoods> {
    return this.getDetail({ 'details.id': fileId, 'details.applicationId': applicationId, deleted: false });
  }

  /**
   * Get the status of the product on the shelf through the application ID and file IDs
   * Return the file ID and file status
   * @param  {string} applicationId
   * @param  {string[]} fileIds
   * @returns Promise
   */
  async getAppFileStatus(applicationId: string, fileIds: string[]): Promise<StoreFileStatus[]> {
    const goodsList = await this.find({
      'details.applicationId': applicationId,
      'details.id': { $in: fileIds },
      deleted: false,
    });

    return _.map(goodsList, (goods) => {
      return { id: goods.details.id, status: goods.status };
    });
  }
}
