import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { ArrowDownOutlined, ArrowUpOutlined, DownOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu, Modal } from 'antd';

import { AuthorizeDrawer, Content, FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { WIDTH_DEFAULT } from '@/constants/global';
import { GlobalContext } from '@/pages/system';
import {
  AuthorizeAddParams,
  AuthorizeDeleteParams,
  AuthorizeListFetchParams,
  AuthorizeListItem,
  AuthorizeUserFetchParams,
  ContentEntity,
  File,
  FilesFetchParams,
  GoodsCommitParams,
  GoodsOfflineParams,
  ParentFileFetchParams,
  ProjectContentDeleteParams,
  ProjectContentFetchParams,
  User,
} from '@/types//index';
import { getLocationIfo, getProjectFolder } from '@/utils/index';

import { BasicInfo, EditDrawer, List } from './components/index';

interface ProjectContentType {
  type: 'application' | 'involved' | 'personal' | 'projects' | 'workspace';
  loading: boolean;
  saveLoading: boolean;
  contentList: ContentEntity[];
  extendRecord: Record<string, string[]>;
  fileDetail: File;
  drawerOpen: boolean;
  editContent: Partial<ContentEntity>;
  baseContents: Array<Record<string, string>>;
  locales: string[];
  authDrawerOpen?: boolean;
  authLoading?: boolean;
  authList?: AuthorizeListItem[];
  userList?: User[];
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
  deleteContent: (params: ProjectContentDeleteParams) => void;
  fetchAuthList?: (params: AuthorizeListFetchParams) => void;
  fetchUserList?: (params: AuthorizeUserFetchParams, cb?: () => void) => void;
  saveUser?: (params: AuthorizeAddParams, cb?: () => void) => void;
  deleteUser?: (params: AuthorizeDeleteParams, cb?: () => void) => void;
  openAuthDrawer?: (visible: boolean, editContent?: ContentEntity) => void;
}

const PAGE_NUM = 1;
const PAGE_SIZE = 999;

const ProjectContentComponent: React.FC<ProjectContentType> = (props: ProjectContentType) => {
  const {
    type,
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
    userList = [],
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
    fetchAuthList,
    fetchUserList,
    saveUser,
    deleteUser,
    openAuthDrawer,
  } = props;
  const [folderName, setFolderName] = useState<string>(getProjectFolder()?.name || 'Project details');
  const [typeId, setTypeId] = useState('');

  // url search params
  const { applicationId, folderId, fileId } = getLocationIfo(useLocation());

  // route map with different type
  const typeRouteMap = {
    application: `/applications/${applicationId}/projects`,
    involved: '/workspace/projects/involved',
    personal: '/workspace/projects/personal',
    projects: '/projects',
  };
  const projectFolderLink =
    type === 'application'
      ? `${typeRouteMap[type]}/list?applicationId=${applicationId}`
      : `${typeRouteMap[type]}/list`;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, content, store } = locale.business;

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
          const folderName = folder?.name;
          if (folderName) setFolderName(folderName);
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
  }, [fileDetail?.id]);

  useEffect(() => {
    const newTypeId = editContent?.id;
    if (newTypeId) setTypeId(newTypeId);
  }, [editContent]);

  // fetch content selected authorize list
  useEffect(() => {
    if (authDrawerOpen && typeId) {
      if (typeof fetchAuthList === 'function')
        fetchAuthList({
          applicationId: applicationId as string,
          type: 'content',
          typeId,
        });
    }
  }, [authDrawerOpen, typeId, fetchAuthList]);

  // fetch content selected authorize user available list
  useEffect(() => {
    if (authDrawerOpen) {
      if (typeof fetchUserList === 'function')
        fetchUserList({
          page: PAGE_NUM,
          size: PAGE_SIZE,
        });
    }
  }, [authDrawerOpen, fetchUserList]);

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

  return (
    <>
      <Content>
        <FoxPageContent
          breadcrumb={
            <FoxPageBreadcrumb
              breadCrumb={[
                { name: global.project, link: projectFolderLink },
                {
                  name: folderName,
                  link: `${typeRouteMap[type]}/detail?applicationId=${applicationId}&folderId=${folderId}`,
                },
                {
                  name: fileDetail?.name || 'File details',
                },
              ]}
            />
          }
          style={{
            paddingBottom: 0,
            maxWidth: type === 'projects' ? WIDTH_DEFAULT : '100%',
            overflow: type === 'projects' ? 'unset' : 'hidden auto',
          }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {fileDetail?.online ? (
              <Button
                type="default"
                title="Revoke To Store"
                style={{ marginRight: 8 }}
                onClick={handleRevoke}>
                <ArrowDownOutlined />
                {store.revoke}
              </Button>
            ) : (
              <Button
                type="default"
                title="Commit To Store"
                style={{ marginRight: 8 }}
                onClick={handleCommit}>
                <ArrowUpOutlined />
                {store.commit}
              </Button>
            )}
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item
                    key="1"
                    onClick={() => {
                      openDrawer(true, { isBase: true });
                    }}>
                    {content.addBase}
                  </Menu.Item>
                  <Menu.Item
                    key="2"
                    onClick={() => {
                      openDrawer(true);
                    }}>
                    {content.addLocale}
                  </Menu.Item>
                </Menu>
              }>
              <Button type="primary">
                <PlusOutlined /> {content.add} <DownOutlined />
              </Button>
            </Dropdown>
          </div>
          <BasicInfo fileDetail={fileDetail} />
          <List
            type={type}
            loading={loading}
            contentList={contentList}
            fileDetail={fileDetail}
            extendRecord={extendRecord}
            deleteContent={deleteContent}
            openDrawer={openDrawer}
            openAuthDrawer={openAuthDrawer}
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
        closeDrawer={openDrawer}
        fetchLocales={fetchLocales}
        updateContentValue={updateContentValue}
        updateContentTags={updateContentTags}
        saveContent={saveContent}
      />
      {type !== 'projects' && (
        <AuthorizeDrawer
          type="content"
          typeId={typeId}
          applicationId={applicationId as string}
          visible={authDrawerOpen}
          loading={authLoading}
          list={authList}
          users={userList}
          onClose={openAuthDrawer}
          onFetch={fetchAuthList}
          onAdd={saveUser}
          onDelete={deleteUser}
        />
      )}
    </>
  );
};

export default ProjectContentComponent;
