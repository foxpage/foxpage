import _ from 'lodash';

import { PicCategory, Picture } from '@foxpage/foxpage-server-types';

import { PRE } from '../../config/constant';
import * as Model from '../models';
// import * as Service from '../services';
import { FoxCtx } from '../types/index-types';
import { generationId } from '../utils/tools';

import { BaseService } from './base-service';

export class PictureService extends BaseService<Picture> {
  private static _instance: PictureService;

  constructor() {
    super(Model.picture);
  }

  /**
   * Single instance
   * @returns PictureService
   */
  public static getInstance(): PictureService {
    this._instance || (this._instance = new PictureService());
    return this._instance;
  }

  /**
   * Create new picture infos
   * @param  {Partial<Content>} params
   * @returns Content
   */
  create(params: Partial<Picture>, options: { ctx: FoxCtx }): Picture {
    const picDetail: Picture = {
      id: params.id || generationId(PRE.PICTURE),
      name: params.name || '',
      category: params.category as PicCategory,
      tags: params.tags || [],
      url: params.url || '',
      creator: params.creator || options.ctx.userInfo.id,
      deleted: false,
    };

    options.ctx.transactions.push(Model.picture.addDetailQuery(picDetail));

    return picDetail;
  }
}
