import _ from 'lodash';

import { StorageAbstract, StorageListRes } from '@foxpage/foxpage-server-types';

import { config } from '../../app.config';

import { PluginService } from './plugin-services';

export class StorageService {
  private static _instance: StorageService;
  private plugins: StorageAbstract;

  constructor() {
    const pluginInstance = PluginService.getInstance();
    this.plugins = pluginInstance.plugins;
    if (this.plugins.storageInit) {
      this.plugins.storageInit(config.storageConfig);
    }
  }

  /**
   * Single instance
   * @returns StorageService
   */
  public static getInstance(): StorageService {
    this._instance || (this._instance = new StorageService());
    return this._instance;
  }

  /**
   * Get object list of the special prefix
   * @param  {string} prefix
   * @param  {{maxKeys:number}} options?
   * @returns Promise
   */
  async getList(prefix: string, options?: { bucket?: string; maxKeys: number }): Promise<StorageListRes[]> {
    return this.plugins.storageObjectList(prefix, {
      bucketName: options?.bucket || '',
      maxKeys: options?.maxKeys || 0,
    });
  }

  /**
   * Download object
   * @param  {string} prefix
   * @returns Promise
   */
  async downloads(prefix: string): Promise<any> {
    const downloadPath = await this.plugins.storageDownloadFolders(prefix);
    if (downloadPath.code === 0) {
      const prefixPath = prefix.replace(/\/|\\/g, '_') + '.zip';
      const zipResult = await this.plugins.storageZipFolders(<string>downloadPath.data, prefixPath);
      if (zipResult.code === 0) {
        const contentBuffer = this.plugins.storageZipFileContent(prefixPath);
        downloadPath.content = contentBuffer;
        downloadPath.fileName = prefixPath;
      } else {
        downloadPath.code = 2;
        downloadPath.data = 'zip folder failed:' + zipResult?.data?.message || '';
      }
    }
    return downloadPath;
  }

  /**
   * Upload object to another bucket after organize
   * 1, download objects
   * 2, zip objects
   * 3, upload to another bucket
   * @param  {any} params
   * {
   *    bucket: origin object bucket, default is same as origin object bucket
   *    targetBucket: target upload bucket, default is same as origin object bucket
   * }
   * @returns string
   */
  async organizeUpload(params: {
    prefix: string;
    bucket?: string;
    targetBucket?: string;
    targetPrefix?: string;
  }): Promise<{ code: number; data: string | string[] }> {
    const { prefix = '' } = params;

    // Get origin object
    const objectList = await this.plugins.storageObjectList(prefix, { bucketName: params.bucket || '' });
    if (objectList.length === 0) {
      // Object not exist or is empty
      return { code: 1, data: '' };
    }

    // TODO Check whether the resource object already exists in the target bucket
    // Download objects to locale
    let folderPrefix: string = '';
    if (prefix.indexOf('.') !== -1) {
      folderPrefix = _.last(prefix.split('.')[0].split('/')) || '';
    } else {
      folderPrefix = _.last(_.pull(prefix.split('/'), '')) || '';
    }
    const downloadResult = await this.plugins.storageDownloadFolders(prefix, folderPrefix, {
      bucketName: params?.bucket || '',
    });
    if (!downloadResult || downloadResult.code !== 0) {
      // Object download fail
      return { code: 2, data: <string[]>downloadResult.data };
    }

    // Zip locale objects
    const zipResult = await this.plugins.storageZipFolders(
      <string>downloadResult.data,
      downloadResult.data + '.zip',
    );

    if (!zipResult || zipResult.code !== 0) {
      // Zip download objects fail
      return { code: 3, data: '' };
    }

    // Upload to target bucket
    const targetPrefix = _.pull((params?.targetPrefix || '').split('/'), '');
    const uploadResult = await this.plugins.storageObjectUploadByPath(
      (targetPrefix.length > 0 ? targetPrefix.join('/') + '/' : '') + zipResult.data,
      zipResult.data,
      { bucket: params.targetBucket || '' },
    );

    if (!uploadResult || uploadResult.code !== 0) {
      // Upload object fail
      return { code: 4, data: uploadResult.data };
    }

    return { code: 0, data: 'success' };
  }
}
