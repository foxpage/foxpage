import {
  BaseResponse,
  CheckDSLParams,
  CheckDSLRes,
  ContentFetchParams,
  ContentPublishedRes,
  ContentPublishParams,
  ContentSavedRes,
  ContentSaveParams,
  ContentSetLiveVersionParams,
  EncryptParams,
  EncryptRes,
  EncryptValidateParams,
  EncryptValidateRes,
  LockerParams,
  LockerResponse,
  PageContent,
  StructureCopyParams,
  StructureCopyRes,
} from '@/types/index';
import FoxPageApi from '@/utils/api-agent';

export const fetchPageBuildVersion = (params: ContentFetchParams): Promise<PageContent> =>
  new Promise((resolve) => {
    FoxPageApi.get('/pages/build-versions', params, (rs: PageContent) => {
      resolve(rs);
    });
  });
export const fetchPageLiveVersion = (params: ContentFetchParams): Promise<PageContent> =>
  new Promise((resolve) => {
    FoxPageApi.get('/pages/live-version', params, (rs: PageContent) => {
      resolve(rs);
    });
  });

export const fetchTemplateBuildVersion = (params: ContentFetchParams): Promise<PageContent> =>
  new Promise((resolve) => {
    FoxPageApi.get('/templates/build-versions', params, (rs: PageContent) => {
      resolve(rs);
    });
  });

export const fetchPageDsl = (params: ContentFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.post('/pages/draft-infos', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

export const fetchTemplateDsl = (params: ContentFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.post('/templates/draft-infos', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });

export const savePageContent = (params: ContentSaveParams): Promise<ContentSavedRes> =>
  new Promise((resolve) => {
    FoxPageApi.put('/pages/versions', params, (rs: ContentSavedRes) => {
      resolve(rs);
    });
  });

export const saveTemplateContent = (params: ContentSaveParams): Promise<ContentSavedRes> =>
  new Promise((resolve) => {
    FoxPageApi.put('/templates/versions', params, (rs: ContentSavedRes) => {
      resolve(rs);
    });
  });

export const publishPage = (params: ContentPublishParams) =>
  new Promise((resolve) => {
    FoxPageApi.put('/pages/publish', params, (rs: ContentPublishedRes) => {
      resolve(rs);
    });
  });

export const publishTemplate = (params: ContentPublishParams) =>
  new Promise((resolve) => {
    FoxPageApi.put('/templates/publish', params, (rs: ContentPublishedRes) => {
      resolve(rs);
    });
  });

export const checkDslBeforePublish = (params: CheckDSLParams) =>
  new Promise((resolve) => {
    FoxPageApi.get('/versions/publish-check', params, (rs: CheckDSLRes) => {
      resolve(rs);
    });
  });

export const lockEdit = (params: LockerParams) => {
  return new Promise((resolve) => {
    FoxPageApi.put('/contents/lock', params, (rs: LockerResponse) => {
      resolve(rs);
    });
  });
};

export const unlockEdit = (params: LockerParams) => {
  return new Promise((resolve) => {
    FoxPageApi.put('/contents/unlock', params, (rs: LockerResponse) => {
      resolve(rs);
    });
  });
};

export const heartBeat = (params: LockerParams) => {
  return new Promise((resolve) => {
    FoxPageApi.put('/contents/heartbeat', params, (rs: LockerResponse) => {
      resolve(rs);
    });
  });
};

export const setLiveVersion = (params: ContentSetLiveVersionParams) => {
  return new Promise((resolve) => {
    FoxPageApi.put('/content/version/live', params, (rs: BaseResponse) => {
      resolve(rs);
    });
  });
};

export const copyStructure = (params: StructureCopyParams) => {
  return new Promise((resolve) => {
    FoxPageApi.post('/projects/relations-clone', params, (rs: StructureCopyRes) => {
      resolve(rs);
    });
  });
};

export const fetchToken = (params: EncryptParams): Promise<EncryptRes> => {
  return new Promise((resolve) => {
    FoxPageApi.post('/contents/encrypt', params, (rs: EncryptRes) => {
      resolve(rs);
    });
  });
};

export const checkToken = (params: EncryptValidateParams): Promise<EncryptValidateRes> => {
  return new Promise((resolve) => {
    FoxPageApi.post('/contents/encrypt-validate', params, (rs: EncryptValidateRes) => {
      resolve(rs);
    });
  });
};
