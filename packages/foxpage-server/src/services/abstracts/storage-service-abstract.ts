/**
 *对象存储资源信息服务
 */
export interface StorageServiceAbstract {
  // Get a list of objects
  getList(): Promise<{}>;
  // Get object details
  getDetail(): Promise<{}>;
  // Get object content
  getContent(): Promise<{}>;
  // Add, update object content
  putContent(): Promise<{}>;
  // Delete object
  removeContent(): Promise<{}>;
  // Copy object
  copyContent(): Promise<{}>;
}
