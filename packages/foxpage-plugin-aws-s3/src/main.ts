import * as fs from 'fs';
import * as path from 'path';

import {
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  ListObjectsV2Command,
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import * as compressing from 'compressing';
import * as _ from 'lodash';

import { FoxpagePlugin } from '@foxpage/foxpage-plugin';
import {
  DownloadObjectRes,
  StorageAbstract,
  StorageListOptions,
  StorageListRes,
} from '@foxpage/foxpage-server-types';

import {
  bulkDownloadFiles,
  downloadObjectContent,
  filterAndCreateFolders,
  getObjectContent,
  listFolderObjects,
} from './functions';

const DOWNLOAD_FOLDER = 'downloads';
const ZIP_FOLDER = 'zips';

interface S3ConfigType {
  bucket: string;
  config: {
    region: string;
    credentials: {
      accessKeyId: string;
      secretAccessKey: string;
    };
  };
}

const S3 = (): FoxpagePlugin<StorageAbstract> => {
  let s3Client: S3Client = null;
  let bucketName: string = '';

  return {
    name: 'foxpage-s3',
    visitor: {
      /**
       * init aws s3 credentials config
       * @param  {S3ConfigType} config
       * @returns void
       */
      storageInit: (config: S3ConfigType): void => {
        if (!s3Client) {
          s3Client = new S3Client(config.config);
          bucketName = config.bucket || '';
        }
      },

      /**
       * upload content to aws s3 bucket object
       * @param  {string} objectName
       * @param  {string|Uint8Array|Buffer} content
       * @returns Promise
       */
      storageObjectUpload: async (
        objectName: string,
        content: string | Uint8Array | Buffer,
      ): Promise<PutObjectCommandOutput> => {
        const uploadParams = { Bucket: bucketName, Key: objectName, Body: content };
        return s3Client.send(new PutObjectCommand(uploadParams));
      },

      /**
       * upload content to aws s3 bucket object by path
       * only zip file can be upload
       * @param objectName
       * @param pathName
       * @param options
       * @returns
       */
      storageObjectUploadByPath: async (
        objectName: string,
        pathName: string,
        options?: { bucket?: string; prefix?: string },
      ): Promise<{ code: number; data: string }> => {
        const contentPath = path.resolve(__dirname, ZIP_FOLDER, pathName);
        if (!fs.existsSync(contentPath)) {
          return { code: 1, data: 'File not exist' };
        }

        try {
          const content = fs.readFileSync(contentPath);
          const uploadParams = { Bucket: options.bucket || bucketName, Key: objectName, Body: content };
          await s3Client.send(new PutObjectCommand(uploadParams));

          return { code: 0, data: 'success' };
        } catch (err) {
          return { code: 1, data: err.message };
        }
      },

      /**
       * download bucket object content to locale
       * @param  {string} objectName
       * @param  {string} targetName?
       * @returns Promise
       */
      storageObjectDownload: async (objectName: string, targetName?: string): Promise<DownloadObjectRes> => {
        return downloadObjectContent(
          s3Client,
          bucketName,
          objectName,
          targetName || new Date().getTime() + '',
        );
      },

      /**
       * delete aws s3 bucket object content
       * @param  {string} objectName object name
       * @returns Promise
       */
      storageObjectDelete: async (objectName: string): Promise<DeleteObjectCommandOutput> => {
        return s3Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: objectName }));
      },

      /**
       * get aws s3 bucket object content
       * @param  {string} objectName object name
       * @returns Promise
       */
      storageObjectContent: async (objectName: string): Promise<string> => {
        return getObjectContent(s3Client, bucketName, objectName);
      },

      /**
       * get aws s3 bucket object list
       * @param  {string} prefix object prefix
       * @param  {StorageListOptions} options?
       * @returns Promise
       */
      storageObjectList: async (prefix: string, options?: StorageListOptions): Promise<StorageListRes[]> => {
        const listParams = {
          Bucket: options?.bucketName || bucketName,
          Delimiter: '/',
          Prefix: prefix,
          MaxKeys: options?.maxKeys || 2000,
        };

        let objectList = [];
        const objects = await s3Client.send(new ListObjectsV2Command(listParams));

        if (objects.CommonPrefixes && objects.CommonPrefixes.length > 0) {
          _.reverse(objects.CommonPrefixes).forEach((folder) => {
            objectList.push({
              type: 'prefix',
              value: _.replace(folder.Prefix, prefix, ''),
              prefix: folder.Prefix,
            });
          });
        }

        if (objects.Contents && objects.Contents.length > 0) {
          _.orderBy(objects.Contents, ['LastModified'], ['desc']).forEach((file) => {
            objectList.push({ type: 'content', value: _.last(file.Key.split('/')), prefix: file.Key });
          });
        }

        return objectList;
      },

      /**
       * bulk download aws s3 bucket folder object files,
       * if some file download failed, then try again,
       * if still has failed files, then return failed file list,
       * if all success, return download folder path
       * @param  {string} prefix
       * @param  {string} target
       */
      storageDownloadFolders: async (
        prefix: string,
        target: string = '',
        options?: { bucketName?: string },
      ): Promise<Record<string, number | string | string[]>> => {
        const basePath: string = path.resolve(__dirname, DOWNLOAD_FOLDER);
        try {
          fs.accessSync(basePath);
        } catch (err) {
          fs.mkdirSync(basePath);
        }

        const files: string[] = await listFolderObjects(s3Client, options?.bucketName || bucketName, prefix);
        const tmpTarget = [path.resolve(basePath, target), new Date().getTime()].join('_');

        filterAndCreateFolders(files, tmpTarget, prefix);

        let fileList = await bulkDownloadFiles(
          s3Client,
          files,
          options?.bucketName || bucketName,
          prefix,
          tmpTarget,
        );
        let failedList = _.filter(fileList, (file) => file.code === 1);

        if (failedList.length > 0) {
          // retry again
          const failedFileList = _.map(failedList, 'objectName');
          fileList = await bulkDownloadFiles(
            s3Client,
            failedFileList,
            options?.bucketName || bucketName,
            prefix,
            tmpTarget,
          );
        }

        failedList = _.filter(fileList, (file) => file.code === 1);

        if (failedList.length > 0) {
          return { code: 1, data: _.map(failedList, 'objectName') };
        } else {
          return { code: 0, data: _.last(tmpTarget.split('/')) as string };
        }
      },

      /**
       * zip folder
       * @param  {string} source source folder path
       * @param  {string} target target zip file name
       * @returns Promise
       */
      storageZipFolders: (source: string, target: string): Promise<Record<string, any>> => {
        const basePath: string = path.resolve(__dirname, ZIP_FOLDER);
        try {
          fs.accessSync(basePath);
        } catch (err) {
          fs.mkdirSync(basePath);
        }

        return new Promise(async (resolve, reject) => {
          setTimeout(() => {
            compressing.zip
              .compressDir(path.resolve(__dirname, DOWNLOAD_FOLDER, source), path.resolve(basePath, target))
              .then((data) => {
                resolve({ code: 0, data: target });
              })
              .catch((err) => {
                reject({ code: 1, data: err });
              });
          }, 1000);
        });
      },

      /**
       * get locale zip file buffer content
       * @param  {string} target
       * @returns Buffer
       */
      storageZipFileContent(target: string): Buffer {
        return fs.readFileSync(path.resolve(__dirname, ZIP_FOLDER, target));
      },
    },
    options: {},
  };
};

export default S3;
