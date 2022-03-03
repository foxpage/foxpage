import * as fs from 'fs';
import * as path from 'path';

import { GetObjectCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import * as _ from 'lodash';
import * as pLimit from 'p-limit';

import { DownloadObjectRes, StorageListRes } from '@foxpage/foxpage-server-types';

/**
 * get aws s3 bucket object content
 * @param  {string} objectName object name
 * @returns Promise
 */
export const getObjectContent = async (
  client: S3Client,
  bucket: string,
  objectName: string,
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const getParams = { Bucket: bucket, Key: objectName };
      const data: any = await client.send(new GetObjectCommand(getParams));

      let responseDataChunks: Buffer[] = [];
      data.Body.on('data', (chunk: Buffer) => responseDataChunks.push(chunk));
      data.Body.once('end', () => resolve(Buffer.concat(responseDataChunks).toString('utf8')));
    } catch (err) {
      return reject(err);
    }
  });
};

/**
 * download bucket object file to locale, response locale file name
 * @param  {S3Client} client
 * @param  {string} bucketName
 * @param  {string} objectName
 * @param  {string} targetName?
 * @returns Promise
 */
export const downloadObjectContent = async (
  client: S3Client,
  bucketName: string,
  objectName: string,
  targetName?: string,
): Promise<DownloadObjectRes> => {
  try {
    const getParams = { Bucket: bucketName, Key: objectName };
    const data: any = await client.send(new GetObjectCommand(getParams));
    await data.Body.pipe(fs.createWriteStream(targetName));

    return { code: 0, objectName, data: targetName, dataLength: data.ContentLength };
  } catch (err) {
    return { code: 1, objectName, data: err.message, dataLength: 0 };
  }
};

/**
 * get folder objects recursive
 * @param  {string} bucket
 * @param  {string} prefix
 * @returns Promise
 */
export const listFolderObjects = async (
  client: S3Client,
  bucket: string,
  prefix: string,
): Promise<string[]> => {
  let files: string[] = [];

  const data = await objectList(client, bucket, prefix);
  if (data && data.length > 0) {
    for (const item of data) {
      if (item.type === 'prefix') {
        const folderFiles = await listFolderObjects(client, bucket, item.prefix);
        files = files.concat(folderFiles);
      } else if (item.type === 'content') {
        files.push(item.prefix as string);
      }
    }
  }

  return files;
};

/**
 * get bucket object list
 * @param  {} client
 * @param  {string} bucketName
 * @param  {string} prefix
 * @param  {{maxKeys?:number;}} options?
 * @returns Promise
 */
export const objectList = async (
  client: S3Client,
  bucketName: string,
  prefix: string,
  options?: {
    maxKeys?: number;
  },
): Promise<StorageListRes[]> => {
  const listParams = {
    Bucket: bucketName,
    Delimiter: '/',
    Prefix: prefix,
    MaxKeys: options?.maxKeys || 2000,
  };

  let objectList: StorageListRes[] = [];
  const objects = await client.send(new ListObjectsV2Command(listParams));

  if (objects.CommonPrefixes && objects.CommonPrefixes.length > 0) {
    objects.CommonPrefixes.forEach((folder) => {
      objectList.push({
        type: 'prefix',
        value: _.replace(folder.Prefix, prefix, ''),
        prefix: folder.Prefix,
      });
    });
  }

  if (objects.Contents && objects.Contents.length > 0) {
    objects.Contents.forEach((file) => {
      objectList.push({ type: 'content', value: _.replace(file.Key, prefix, ''), prefix: file.Key });
    });
  }

  return objectList;
};

/**
 * bulk download files to target folder
 * @param  {S3Client} client
 * @param  {string[]} fileList
 * @param  {string} bucketName
 * @param  {string} prefix
 * @param  {string} tmpTarget
 * @returns Promise
 */
export const bulkDownloadFiles = async (
  client: S3Client,
  fileList: string[],
  bucketName: string,
  prefix: string,
  tmpTarget: string,
): Promise<DownloadObjectRes[]> => {
  let promises: any[] = [];

  // bulk download, 10 file at once
  const limit = pLimit(10);
  for (const file of fileList) {
    const targetFilePath = file !== prefix ? file.replace(prefix, '') : _.last(file.split('/'));
    promises.push(
      limit(() => downloadObjectContent(client, bucketName, file, path.resolve(tmpTarget, targetFilePath))),
    );
  }

  return Promise.all(promises);
};

/**
 * create folders from file path list
 * @param  {string[]} files file list
 * @param  {string} prefix default locale path
 * @param  {string} removePrefix remove s3 file path
 * @returns void
 */
export const filterAndCreateFolders = (files: string[], prefix: string, removePrefix: string): void => {
  let folders: string[] = [prefix];
  for (const file of files) {
    const folderArray = file.replace(removePrefix, '').split('/');
    const folderPath = folderArray.slice(0, folderArray.length - 1);

    // Avoid the situation where the path in the middle of each path does not exist
    let pathItem = [];
    for (const path of folderPath) {
      pathItem.push(path);
      folders.push([prefix, ...pathItem].join('/'));
    }
  }

  folders = _.uniq(folders);
  for (const folder of folders) {
    createLocalFolder(folder);
  }
};

/**
 * create folder
 * @param  {string} target folder path
 * @returns void
 */
export const createLocalFolder = (target: string): void => {
  try {
    fs.accessSync(target);
  } catch (err) {
    fs.mkdirSync(target);
  }
};
