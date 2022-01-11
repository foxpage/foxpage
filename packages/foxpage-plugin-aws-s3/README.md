# @foxpage/foxpage-plugin-aws-s3

The plugin for foxpage to get resource list

## Usage

Import this plugin in foxpage-server env config file

```typescript
export default {
  ...
    "plugins": ["@foxpage/foxpage-plugin-aws-s3"],
  ...
}
```

## Methods

#### storageInit(options:S3ConfigType)

Init plugin config

#### storageObjectUpload( objectName: string,content: string | Uint8Array | Buffer)

Upload object to s3 with content

#### storageObjectUploadByPath( objectName: string,pathName: string,options?: { bucket?: string; prefix?: string })

Upload object to s3 with content path

#### storageObjectDownload(objectName: string, targetName?: string)

Download object from s3 by object name (path)

#### storageObjectDelete(objectName: string)

Remove s3 object

#### storageObjectContent(objectName: string)

Get s3 object content detail

#### storageObjectList(prefix: string, options?: StorageListOptions)

Get s3 the special path's object list

#### storageDownloadFolders( prefix: string,target: string = '',options?: { bucketName?: string })

Download objects from s3 by the special path

#### storageZipFolders(source: string, target: string)

Zip the download objects folder to a file

#### storageZipFileContent(target: string)

Get the local zip file content
