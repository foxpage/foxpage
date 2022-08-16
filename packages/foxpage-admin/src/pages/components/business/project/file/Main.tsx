import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';

import { AuthorizeDrawer, Content, FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { WIDTH_DEFAULT } from '@/constants/global';
import { GlobalContext } from '@/pages/system';
import {
  AuthorizeAddParams,
  AuthorizeDeleteParams,
  AuthorizeListFetchParams,
  AuthorizeListItem,
  AuthorizeUserFetchParams,
  File,
  PaginationInfo,
  ParentFileFetchParams,
  ProjectFileDeleteParams,
  ProjectFileFetchParams,
  ProjectFileSaveParams,
  User,
} from '@/types/index';
import { getLocationIfo, getProjectFolder } from '@/utils/index';

import { EditDrawer, List } from './components/index';

const PAGE_NUM = 1;
const PAGE_SIZE = 999;

interface ProjectFileType {
  type: 'application' | 'involved' | 'personal' | 'projects' | 'workspace';
  pageInfo: PaginationInfo;
  loading: boolean;
  fileList: File[];
  drawerOpen: boolean;
  editFile: File;
  saveLoading: boolean;
  authDrawerOpen?: boolean;
  authLoading?: boolean;
  authList?: AuthorizeListItem[];
  userList?: User[];
  fetchFileList: (params: ProjectFileFetchParams) => void;
  fetchParentFiles: (params: ParentFileFetchParams, cb?: (folder) => void) => void;
  openDrawer: (open: boolean, editFile?: File) => void;
  updateEditFile: (name: string, value: unknown) => void;
  saveFile: (params: ProjectFileSaveParams, cb?: () => void) => void;
  deleteFile: (params: ProjectFileDeleteParams) => void;
  fetchAuthList?: (params: AuthorizeListFetchParams) => void;
  fetchUserList?: (params: AuthorizeUserFetchParams, cb?: () => void) => void;
  saveUser?: (params: AuthorizeAddParams, cb?: () => void) => void;
  deleteUser?: (params: AuthorizeDeleteParams, cb?: () => void) => void;
  openAuthDrawer?: (visible: boolean, editFile?: File) => void;
}

const ProjectFileComponent: React.FC<ProjectFileType> = (props: ProjectFileType) => {
  const {
    type,
    pageInfo,
    loading,
    saveLoading,
    fileList,
    drawerOpen,
    editFile,
    authDrawerOpen = false,
    authLoading = false,
    authList = [],
    userList = [],
    fetchFileList,
    fetchParentFiles,
    openDrawer,
    updateEditFile,
    saveFile,
    deleteFile,
    fetchAuthList,
    fetchUserList,
    saveUser,
    deleteUser,
    openAuthDrawer,
  } = props;
  const [folderName, setFolderName] = useState<string>(getProjectFolder()?.name || 'Project details');
  const [typeId, setTypeId] = useState('');

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, file } = locale.business;

  // url search params
  const { applicationId, folderId } = getLocationIfo(useLocation());

  // route map with different type
  const typeRouteMap = {
    application: `/applications/${applicationId}/projects/list?applicationId=${applicationId}`,
    involved: '/workspace/projects/involved/list',
    personal: '/workspace/projects/personal/list',
    projects: '/projects/list',
  };

  useEffect(() => {
    if (applicationId && folderId) {
      // fetch file list
      fetchFileList({
        applicationId,
        id: folderId,
        page: pageInfo.page,
        size: pageInfo.size,
      });

      // fetch folder detail
      fetchParentFiles(
        {
          applicationId,
          id: folderId,
        },
        (folder) => {
          const folderName = folder?.name;
          if (folderName) setFolderName(folderName);
        },
      );
    }
  }, []);

  useEffect(() => {
    const newTypeId = editFile?.id;
    if (newTypeId) setTypeId(newTypeId);
  }, [editFile]);

  // fetch file selected authorize list
  useEffect(() => {
    if (authDrawerOpen && applicationId && typeId) {
      if (typeof fetchAuthList === 'function')
        fetchAuthList({
          applicationId: applicationId as string,
          type: 'file',
          typeId,
        });
    }
  }, [authDrawerOpen, typeId, fetchAuthList]);

  // fetch file selected authorize user available list
  useEffect(() => {
    if (authDrawerOpen) {
      if (typeof fetchUserList === 'function')
        fetchUserList({
          page: PAGE_NUM,
          size: PAGE_SIZE,
        });
    }
  }, [authDrawerOpen, fetchUserList]);

  return (
    <>
      <Content>
        <FoxPageContent
          breadcrumb={
            <FoxPageBreadcrumb
              breadCrumb={[
                {
                  name: global.project,
                  link: typeRouteMap[type],
                },
                { name: folderName },
              ]}
            />
          }
          style={{
            maxWidth: type === 'projects' ? WIDTH_DEFAULT : '100%',
            overflow: type === 'projects' ? 'unset' : 'hidden auto',
          }}>
          <>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="primary" onClick={() => openDrawer(true)}>
                <PlusOutlined /> {file.add}
              </Button>
            </div>
            <List
              type={type}
              loading={loading}
              pageInfo={pageInfo}
              fileList={fileList}
              fetchFileList={fetchFileList}
              deleteFile={deleteFile}
              openDrawer={openDrawer}
              openAuthDrawer={openAuthDrawer}
            />
          </>
        </FoxPageContent>
      </Content>
      <EditDrawer
        drawerOpen={drawerOpen}
        saveLoading={saveLoading}
        pageInfo={pageInfo}
        editFile={editFile}
        updateEditFile={updateEditFile}
        saveFile={saveFile}
        fetchFileList={fetchFileList}
        closeDrawer={openDrawer}
      />
      {type !== 'projects' && (
        <AuthorizeDrawer
          type="file"
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

export default ProjectFileComponent;
