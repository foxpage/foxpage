import {
  Application,
  CheckDSLMain,
  Component,
  Content,
  ContentVersion,
  File,
  FileType,
  PageContent,
  RelationDetails,
  ResponseBody,
  StructureNode,
} from '@foxpage/foxpage-client-types';

// fetch
export interface ContentFetchParams {
  applicationId: string;
  id: string;
  type?: FileType;
  // preview
  versionId?: string;
}

export interface ContentFetchedRes extends ResponseBody<PageContent> {}

export interface ContentSaveParams {
  id: string;
  content: Content;
  applicationId: string;
  contentUpdateTime?: string;
}

export interface ContentSavedRes extends ResponseBody<PageContent> {}

export interface ContentCreateParams {
  applicationId: string;
  content: Content;
  fileId: string;
  title: string;
}

export interface ContentPublishParams {
  id: string;
  status: 'release';
  applicationId: string;
}

export interface ContentPublishedRes extends ResponseBody<PageContent> {}

export interface ContentCloneParams {
  applicationId: string;
  targetContentId: string;
  sourceContentId: string;
}

export interface CheckDSLParams {
  applicationId: string;
  contentId: string;
  versionId: string;
}

export interface CheckDSLRes extends ResponseBody<CheckDSLMain> {}

export interface InitStateParams {
  application: Application;
  components: Component[];
  extendPage?: PageContent;
  file: File;
  locale?: string;
  rootNode?: StructureNode;
  parseInLocal?: boolean;
}

export interface ContentVersionsParams {
  applicationId: string;
  id: string;
}
export interface ContentVersionRes extends ResponseBody {
  data: ContentVersion[];
}

export interface ContentSetLiveVersionParams {
  applicationId: string;
  contentId: string;
  versionId?: string;
  versionNumber?: number;
}

export interface StructureCopyParams {
  applicationId: string;
  contentId: string;
  relationSchemas: Pick<Content, 'relation' | 'schemas'>;
}

export interface StructureCopyRes extends ResponseBody {
  data: {
    relations: RelationDetails;
    relationSchemas: Pick<Content, 'relation' | 'schemas'>;
  };
}

export interface UploadBase64Params {
  base64Str: string;
}

export interface UploadBase64Res {
  url: string;
  pictureName: string;
}

export interface UpdateContentScreenshotParams {
  applicationId: string;
  id: string;
  pictures: [
    {
      url: string;
      type: string;
      sort: number;
    },
  ];
}

export interface EncryptParams {
  data: {
    folderId: string;
  }
  expireTime?: number;
}

export interface EncryptRes extends ResponseBody {
  data: {
    token: string;
  };
}

export interface EncryptValidateParams {
  data: {
    contentId: string;
  }
  token: string;
};

export interface EncryptValidateRes extends ResponseBody {
  data: {
    status: boolean;
  };
}
