import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { Modal } from 'antd';

import { AuthorizeDrawer, Content, FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { ROUTE_FILE_MAP, ROUTE_FOLDER_MAP, WIDTH_DEFAULT } from '@/constants/index';
import { GlobalContext } from '@/pages/system';
import {
  Application,
  AuthorizeAddParams,
  AuthorizeDeleteParams,
  AuthorizeListFetchParams,
  AuthorizeListItem,
  AuthorizeQueryParams,
  AuthorizeUserFetchParams,
  ContentEntity,
  File,
  FilesFetchParams,
  GoodsCommitParams,
  GoodsOfflineParams,
  ParentFileFetchParams,
  ProjectContentCopyParams,
  ProjectContentDeleteParams,
  ProjectContentFetchParams,
  ProjectContentOfflineParams,
  ProjectContentSaveAsBaseParams,
  ProjectEntity,
  ProjectFileDeleteParams,
  ProjectFileSaveParams,
  Screenshots,
  User,
} from '@/types/index';
import { getLocationIfo } from '@/utils/index';

import { BasicInfo, Toolbar } from '../common/index';
import { EditDrawer as FileEditDrawer } from '../file/components/index';

import { EditDrawer, List } from './components/index';

interface ProjectContentType {
  type: 'application' | 'involved' | 'personal' | 'projects' | 'workspace';
  applicationInfo?: Application;
  loading: boolean;
  saveLoading: boolean;
  contentList: ContentEntity[];
  extendRecord: Record<string, string[]>;
  fileDetail: File;
  folderDetail: ProjectEntity;
  drawerOpen: boolean;
  editContent: Partial<ContentEntity>;
  baseContents: Array<Record<string, string>>;
  locales: string[];
  authDrawerOpen?: boolean;
  authLoading?: boolean;
  userList?: User[];
  authList?: AuthorizeListItem[];
  editFile?: File;
  fileDrawerOpen?: boolean;
  fileSaveLoading?: boolean;
  screenshots: Screenshots;
  fetchList: (params: ProjectContentFetchParams) => void;
  fetchFileDetail: (params: FilesFetchParams) => void;
  fetchParentFiles: (params: ParentFileFetchParams, cb?: (folder) => void) => void;
  commitToStore: (params: GoodsCommitParams, cb?: () => void) => void;
  offlineFromStore: (params: GoodsOfflineParams, cb?: () => void) => void;
  updateFileOnlineStatus: (online: boolean) => void;
  openDrawer: (open: boolean, editContent?: Partial<ContentEntity>) => void;
  fetchLocales: (applicationId: string) => void;
  updateContentValue: (key: string, value: unknown) => void;
  updateContentTags: (key: string, value: unknown) => void;
  saveContent: (params: ProjectContentFetchParams) => void;
  offlineContent?: (params: ProjectContentOfflineParams) => void;
  copyContent?: (params: ProjectContentCopyParams) => void;
  saveAsBaseContent?: (params: ProjectContentSaveAsBaseParams) => void;
  deleteContent: (params: ProjectContentDeleteParams) => void;
  checkAuthRole?: (params: AuthorizeQueryParams, cb?: (role: number) => void) => void;
  fetchAuthList?: (params: AuthorizeListFetchParams) => void;
  fetchUserList?: (params: AuthorizeUserFetchParams, cb?: (userList) => void) => void;
  saveUser?: (params: AuthorizeAddParams, cb?: () => void) => void;
  deleteUser?: (params: AuthorizeDeleteParams, cb?: () => void) => void;
  openAuthDrawer?: (visible: boolean, editContent?: ContentEntity) => void;
  deleteFile?: (params: ProjectFileDeleteParams, cb?: () => void) => void;
  saveFile?: (params: ProjectFileSaveParams, cb?: () => void) => void;
  updateFile?: (open: boolean, editFile?: File) => void;
  updateEditFile?: (name: string, value: unknown) => void;
  fetchApplicationInfo?: (applicationId: string) => void;
}

const ProjectContentComponent: React.FC<ProjectContentType> = (props: ProjectContentType) => {
  const {
    type,
    applicationInfo,
    loading,
    saveLoading,
    contentList,
    extendRecord,
    fileDetail,
    drawerOpen,
    editContent,
    baseContents,
    locales,
    authDrawerOpen = false,
    authLoading = false,
    authList = [],
    editFile,
    fileDrawerOpen,
    fileSaveLoading,
    fetchList,
    fetchFileDetail,
    fetchParentFiles,
    commitToStore,
    offlineFromStore,
    updateFileOnlineStatus,
    openDrawer,
    fetchLocales,
    updateContentValue,
    updateContentTags,
    saveContent,
    deleteContent,
    copyContent,
    saveAsBaseContent,
    offlineContent,
    checkAuthRole,
    fetchAuthList,
    fetchUserList,
    saveUser,
    deleteUser,
    openAuthDrawer,
    deleteFile,
    saveFile,
    updateFile,
    updateEditFile,
    fetchApplicationInfo,
    screenshots,
  } = props;
  const [folderId, setFolderId] = useState<string | undefined>();
  const [folderName, setFolderName] = useState<string>('');
  const [fileName, setFileName] = useState('');
  const [authType, setAuthType] = useState('content');
  const [typeId, setTypeId] = useState('');

  // url search params
  const history = useHistory();
  const { applicationId, fileId, filePage, folderPage, folderSearch } = getLocationIfo(useLocation());

  // i18n
  const { locale } = useContext(GlobalContext);
  const { file: fileI18n, global, store } = locale.business;

  useEffect(() => {
    if (applicationId && fileId) {
      // fetch content list
      fetchFileDetail({ applicationId, ids: [fileId] });

      // fetch folder detail
      fetchParentFiles(
        {
          applicationId,
          id: fileId,
        },
        (folder) => {
          if (folder?.name) setFolderName(folder.name);
          if (folder?.id) setFolderId(folder.id);
        },
      );
    }
  }, []);

  useEffect(() => {
    if (applicationId && fileId && fileDetail?.id) {
      fetchList({
        applicationId,
        fileId,
        fileType: fileDetail.type,
      });
    }

    if (typeof updateFile === 'function' && fileDetail?.id) {
      updateFile(false, fileDetail);
    }
  }, [fileDetail?.id]);

  useEffect(() => {
    const newTypeId = editContent?.id;
    if (newTypeId) setTypeId(newTypeId);
  }, [editContent]);

  useEffect(() => {
    setFileName(fileDetail?.name);
  }, [fileDetail?.name]);

  useEffect(() => {
    if (typeof fetchApplicationInfo === 'function' && applicationId) {
      fetchApplicationInfo(applicationId);
    }
  }, [applicationId, fetchApplicationInfo]);

  const deleteDisabled = useMemo(() => {
    let disabled = true;

    const livePage = contentList && contentList.find((content) => !!content.version);
    if (!fileDetail?.online && !livePage) disabled = false;

    return disabled;
  }, [contentList, fileDetail]);

  const handleCommit = () => {
    if (fileDetail) {
      Modal.confirm({
        title: store.commitTitle,
        content: store.commitMsg,
        onOk: () => {
          commitToStore(
            {
              id: fileId as string,
              applicationId: applicationId as string,
              type: fileDetail.type,
            },
            () => {
              updateFileOnlineStatus(true);
            },
          );
        },
        okText: store.commitYes,
        cancelText: store.commitNo,
      });
    }
  };

  const handleRevoke = () => {
    Modal.confirm({
      title: store.revokeTitle,
      content: store.revokeMsg,
      onOk: () => {
        offlineFromStore(
          {
            id: fileId as string,
            applicationId: applicationId as string,
          },
          () => {
            updateFileOnlineStatus(false);
          },
        );
      },
      okText: store.commitYes,
      cancelText: store.commitNo,
    });
  };

  const handleAuthorize = (type, id) => {
    if (typeof openAuthDrawer === 'function') {
      setAuthType(type);
      setTypeId(id);

      openAuthDrawer(true);
    }
  };

  const handleDeleteFile = () => {
    Modal.confirm({
      title: fileI18n.delete,
      content: fileI18n.deleteMessage,
      onOk: () => {
        if ((fileDetail?.applicationId || fileDetail?.application?.id) && typeof deleteFile === 'function') {
          deleteFile(
            {
              id: fileDetail.id,
              applicationId: fileDetail?.applicationId || fileDetail.application.id,
              folderId: fileDetail.folderId,
            },
            () => {
              history.push(
                `${ROUTE_FILE_MAP[type].replace(
                  ':applicationId',
                  applicationId,
                )}?applicationId=${applicationId}&folderId=${fileDetail?.folderId}`,
              );
            },
          );
        }
      },
      okText: global.yes,
      cancelText: global.no,
    });
  };

  const handleOnBlur = (name: string, cb?: () => void) => {
    if (name !== fileDetail?.name) {
      setFileName(name);

      if (typeof saveFile === 'function' && applicationId && folderId) {
        saveFile(
          {
            applicationId,
            folderId,
            name,
          },
          () => {
            if (typeof cb === 'function') cb();
          },
        );
      }
    }
  };

  return (
    <>
      <Content>
        <FoxPageContent
          breadcrumb={
            <FoxPageBreadcrumb
              breadCrumb={[
                {
                  name: global.project,
                  link: `${ROUTE_FOLDER_MAP[type].replace(':applicationId', applicationId)}?page=${
                    folderPage || ''
                  }&appId=${folderSearch || ''}`,
                },
                {
                  name: folderName,
                  link: `${ROUTE_FILE_MAP[type].replace(
                    ':applicationId',
                    applicationId,
                  )}?applicationId=${applicationId}&folderId=${folderId}&folderPage=${
                    folderPage || ''
                  }&folderSearch=${folderSearch || ''}&page=${filePage || ''}`,
                },
                {
                  name: fileName,
                },
              ]}
            />
          }
          style={{
            paddingBottom: 0,
            maxWidth: type === 'projects' ? WIDTH_DEFAULT : '100%',
            overflow: type === 'projects' ? 'unset' : 'hidden auto',
          }}>
          <Toolbar
            env={type}
            type="file"
            fileDetail={fileDetail}
            deleteDisabled={deleteDisabled}
            onAuthorize={handleAuthorize}
            onCommit={handleCommit}
            onCreate={openDrawer}
            onDelete={handleDeleteFile}
            onEdit={updateFile}
            onRevoke={handleRevoke}
          />
          <BasicInfo fileType="file" fileDetail={fileDetail} onBlur={handleOnBlur} />
          <List
            type={type}
            loading={loading}
            contentList={contentList}
            fileDetail={fileDetail}
            extendRecord={extendRecord}
            locales={locales}
            deleteContent={deleteContent}
            copyContent={copyContent}
            saveAsBaseContent={saveAsBaseContent}
            offlineContent={offlineContent}
            openDrawer={openDrawer}
            openAuthDrawer={handleAuthorize}
            screenshots={screenshots}
          />
        </FoxPageContent>
      </Content>
      <EditDrawer
        saveLoading={saveLoading}
        drawerOpen={drawerOpen}
        fileDetail={fileDetail}
        editContent={editContent}
        locales={locales}
        baseContents={baseContents}
        contentList={contentList}
        closeDrawer={openDrawer}
        fetchLocales={fetchLocales}
        updateContentValue={updateContentValue}
        updateContentTags={updateContentTags}
        saveContent={saveContent}
      />
      <FileEditDrawer
        application={applicationInfo}
        drawerOpen={fileDrawerOpen}
        saveLoading={fileSaveLoading}
        editFile={editFile as File}
        fetchContentList={fetchList}
        fetchFileDetail={fetchFileDetail}
        updateEditFile={updateEditFile}
        saveFile={saveFile}
        closeDrawer={updateFile}
      />
      <AuthorizeDrawer
        needFetch
        type={authType}
        typeId={typeId}
        applicationId={applicationId as string}
        visible={authDrawerOpen}
        loading={authLoading}
        list={authList}
        onClose={openAuthDrawer}
        onSearch={fetchUserList}
        onFetch={fetchAuthList}
        onAdd={saveUser}
        onDelete={deleteUser}
        onValidate={checkAuthRole}
      />
    </>
  );
};

export default ProjectContentComponent;
