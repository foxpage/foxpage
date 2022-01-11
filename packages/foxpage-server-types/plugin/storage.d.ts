/**
 * foxpage server storage plugin abstract class
 * @export
 * @abstract
 * @class StorageAbstract
 */
export abstract class StorageAbstract {
  abstract storageInit(config: any): void;
  abstract storageObjectUpload(objectKey: string, content: string | Uint8Array | Buffer): Promise<any>;
  abstract storageObjectUploadByPath(
    objectKey: string,
    path: string,
    options?: { bucket?: string },
  ): Promise<any>;
  abstract storageObjectDownload(objectKey: string, targetKey?: string): Promise<DownloadObjectRes>;
  abstract storageObjectDelete(objectKey: string): Promise<any>;
  abstract storageObjectContent(objectKey: string): Promise<any>;
  abstract storageObjectList(prefix: string, options?: StorageListOptions): Promise<any>;
  abstract storageDownloadFolders(
    prefix: string,
    target?: string,
    options?:{bucketName?:string}
  ): Promise<Record<string, number | string | Buffer | string[]>>;
  abstract storageZipFolders(source: string, target: string): Promise<Record<string, any>>;
  abstract storageZipFileContent(target: string): Buffer;
}

export interface StorageListOptions {
  bucketName?:string,
  maxKeys?: number;
  page?: number;
  size?: number;
}

export interface StorageListRes {
  type: string;
  value: string;
  prefix: string;
}

export interface DownloadObjectRes {
  code: number;
  objectName: string;
  data: string;
}
