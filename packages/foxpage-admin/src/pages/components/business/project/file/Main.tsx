import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { DeleteOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Input, Modal } from 'antd';

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
  ProjectEntity,
  ProjectFileDeleteParams,
  ProjectFileFetchParams,
  ProjectFileSaveParams,
  ProjectSaveParams,
  User,
} from '@/types/index';
import { getLocationIfo, getLoginUser, getProjectFolder } from '@/utils/index';

import { BasicInfo } from '../common/index';

import { EditDrawer, List } from './components/index';

const { Search } = Input;

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
  deleteProject: (id: string, applicationId: string, cb?: () => void) => void;
  saveProject?: (params: ProjectSaveParams, cb?: () => void) => void;
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
    deleteProject,
    saveProject,
  } = props;
  const [folder, setFolder] = useState<ProjectEntity | undefined>();
  const [folderName, setFolderName] = useState<string>(getProjectFolder()?.name || 'Project details');
  const [authType, setAuthType] = useState('');
  const [typeId, setTypeId] = useState('');
  const [search, setSearch] = useState<string | undefined>();

  // i18n
  const { locale } = useContext(GlobalContext);
  const { authorize, file, global, project } = locale.business;

  // url search params
  const { applicationId, folderId } = getLocationIfo(useLocation());

  // auth check
  const { userInfo } = getLoginUser();

  // route map with different type
  const history = useHistory();
  const typeRouteMap = {
    application: `/applications/${applicationId}/projects/list?applicationId=${applicationId}`,
    involved: '/workspace/projects/involved/list',
    personal: '/workspace/projects/personal/list',
    projects: '/projects/list',
  };

  // fetch project detail
  useEffect(() => {
    if (applicationId && folderId) {
      fetchParentFiles(
        {
          applicationId,
          id: folderId,
        },
        (folder) => {
          setFolder(folder);

          const folderName = folder?.name;
          if (folderName) setFolderName(folderName);
        },
      );
    }
  }, []);

  useEffect(() => {
    if (applicationId && folderId) {
      // fetch file list
      fetchFileList({
        applicationId,
        id: folderId,
        page: !!search ? PAGE_NUM : pageInfo.page,
        size: pageInfo.size,
        search: search || '',
      });
    }
  }, [search]);

  useEffect(() => {
    const newTypeId = editFile?.id;
    if (newTypeId) {
      setAuthType('file');
      setTypeId(newTypeId);
    }
  }, [editFile?.id]);

  // fetch file selected authorize list
  useEffect(() => {
    if (authDrawerOpen && applicationId && typeId) {
      if (typeof fetchAuthList === 'function')
        fetchAuthList({
          applicationId: applicationId as string,
          type: authType,
          typeId,
        });
    }
  }, [authDrawerOpen, authType, typeId, fetchAuthList]);

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

  const authCheck = useMemo(() => {
    let disable = true;

    if (type === 'projects' && userInfo?.id === folder?.creator?.id) {
      disable = false;
    } else if (type === 'personal') {
      disable = false;
    } else if (type === 'application') {
      disable = false;
    }

    return disable;
  }, [type, userInfo?.id, folder?.creator]);

  const handleAuthorize = () => {
    if (typeof openAuthDrawer === 'function') {
      setAuthType('folder');
      setTypeId(folder?.id || '');

      openAuthDrawer(true);
    }
  };

  const handleDeleteProject = () => {
    Modal.confirm({
      title: project.delete,
      content: project.deleteMessage,
      onOk: () => {
        if (folder && folder.application?.id)
          deleteProject(folder.id, folder.application.id, () => {
            const backPathName = {
              application: `/applications/${applicationId}/projects/list?applicationId=${applicationId}`,
              personal: '/workspace',
              projects: '/projects',
            };
            history.push(backPathName[type]);
          });
      },
      okText: global.yes,
      cancelText: global.no,
    });
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
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: 8,
              }}>
              <Search
                placeholder={global.searchPlaceholder}
                defaultValue={search}
                onSearch={setSearch}
                style={{ width: 250 }}
              />
              {!authCheck && (
                <>
                  {type !== 'projects' && (
                    <Button type="ghost" onClick={handleAuthorize} style={{ marginLeft: 8 }}>
                      <UserOutlined /> {authorize.name}
                    </Button>
                  )}
                  <Button type="ghost" danger onClick={handleDeleteProject} style={{ marginLeft: 8 }}>
                    <DeleteOutlined /> {project.delete}
                  </Button>
                </>
              )}
              <Button type="primary" onClick={() => openDrawer(true)} style={{ marginLeft: 8 }}>
                <PlusOutlined /> {file.add}
              </Button>
            </div>
            <BasicInfo
              env={type}
              fileType="project"
              fileDetail={folder}
              saveProject={saveProject}
              updateFolderName={setFolderName}
            />
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
      <AuthorizeDrawer
        type={authType}
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
    </>
  );
};

export default ProjectFileComponent;
