import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { Modal } from 'antd';

import { AuthorizeDrawer, Content, FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { ROUTE_FOLDER_MAP, ROUTE_SEARCH_MAP, WIDTH_DEFAULT } from '@/constants/index';
import { GlobalContext } from '@/pages/system';
import {
  Application,
  AuthorizeAddParams,
  AuthorizeDeleteParams,
  AuthorizeListFetchParams,
  AuthorizeListItem,
  AuthorizeQueryParams,
  AuthorizeUserFetchParams,
  File,
  PaginationInfo,
  ParentFileFetchParams,
  ProjectEntity,
  ProjectFileFetchParams,
  ProjectFileSaveParams,
  ProjectSaveParams,
  Screenshots,
  User,
} from '@/types/index';
import { getLocationIfo } from '@/utils/index';

import { BasicInfo, Toolbar } from '../common/index';

import { EditDrawer, List } from './components/index';

const PAGE_NUM = 1;

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
  userList?: User[];
  authList?: AuthorizeListItem[];
  screenshots: Screenshots;
  application?: Application;
  fetchFileList: (params: ProjectFileFetchParams) => void;
  fetchParentFiles: (params: ParentFileFetchParams, cb?: (folder) => void) => void;
  openDrawer: (open: boolean, editFile?: File) => void;
  updateEditFile: (name: string, value: unknown) => void;
  saveFile: (params: ProjectFileSaveParams, cb?: () => void) => void;
  checkAuthRole?: (params: AuthorizeQueryParams, cb?: (role: number) => void) => void;
  fetchAuthList?: (params: AuthorizeListFetchParams) => void;
  fetchUserList?: (params: AuthorizeUserFetchParams, cb?: (userList) => void) => void;
  saveUser?: (params: AuthorizeAddParams, cb?: () => void) => void;
  deleteUser?: (params: AuthorizeDeleteParams, cb?: () => void) => void;
  openAuthDrawer?: (visible: boolean, editFile?: File) => void;
  deleteProject: (id: string, applicationId: string, cb?: () => void) => void;
  saveProject?: (params: ProjectSaveParams, cb?: () => void) => void;
  fetchApplicationInfo?: (applicationId: string) => void;
}

const ProjectFileComponent: React.FC<ProjectFileType> = (props: ProjectFileType) => {
  const {
    type,
    pageInfo,
    loading,
    saveLoading,
    fileList,
    screenshots,
    drawerOpen,
    editFile,
    authDrawerOpen = false,
    authLoading = false,
    authList = [],
    application,
    fetchFileList,
    fetchParentFiles,
    openDrawer,
    updateEditFile,
    saveFile,
    checkAuthRole,
    fetchAuthList,
    fetchUserList,
    saveUser,
    deleteUser,
    openAuthDrawer,
    deleteProject,
    saveProject,
    fetchApplicationInfo,
  } = props;
  const [folder, setFolder] = useState<ProjectEntity | undefined>();
  const [folderName, setFolderName] = useState<string>('');
  const [authType, setAuthType] = useState('');
  const [typeId, setTypeId] = useState('');
  const [pageNum, setPageNum] = useState(pageInfo.page || PAGE_NUM);

  // url search params
  const history = useHistory();
  const {
    applicationId,
    folderId,
    folderPage,
    folderSearch,
    page: searchPage,
  } = getLocationIfo(history.location);

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, project } = locale.business;

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
    setPageNum(!!searchPage ? Number(searchPage) : PAGE_NUM);
  }, [searchPage]);

  useEffect(() => {
    if (applicationId && folderId) {
      // fetch file list
      fetchFileList({
        applicationId,
        id: folderId,
        page: pageNum,
        size: pageInfo.size,
      });
    }
  }, [pageNum]);

  useEffect(() => {
    const newTypeId = editFile?.id;
    if (newTypeId) {
      setAuthType('file');
      setTypeId(newTypeId);
    }
  }, [editFile?.id]);

  useEffect(() => {
    if (type !== 'application') {
      if (applicationId && typeof fetchApplicationInfo === 'function') {
        fetchApplicationInfo(applicationId);
      }
    }
  }, [type]);

  const deleteDisabled = useMemo(() => {
    let disabled = true;

    if (fileList.length === 0) disabled = false;

    return disabled;
  }, [fileList.length]);

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
            history.push({
              pathname: ROUTE_FOLDER_MAP[type].replace(':applicationId', applicationId),
              search: `?page=${folderPage || 1}&appId=${folderSearch || ''}`,
            });
          });
      },
      okText: global.yes,
      cancelText: global.no,
    });
  };

  const handleOnBlur = (name: string, cb?: () => void) => {
    if (name !== folderName) {
      setFolderName(name);

      if (applicationId && typeof saveProject === 'function') {
        saveProject(
          {
            applicationId,
            editProject: {
              id: folder?.id || '',
              application: {
                id: folder?.application?.id || applicationId,
                name: folder?.application?.name || '',
              },
              name: name,
            },
          },
          () => {
            if (typeof cb === 'function') cb();
          },
        );
      }
    }
  };

  const handleSearch = (search: string, searchType?: string) => {
    history.push({
      pathname: ROUTE_SEARCH_MAP[type].replace(':applicationId', applicationId),
      search: `?application=&type=${searchType}&typeId=${
        folderId || folder?.id
      }&search=${search}&folderPage=${folderPage || ''}&folderSearch=${
        folderSearch || ''
      }&filePage=${pageNum}`,
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
                  link: `${ROUTE_FOLDER_MAP[type].replace(':applicationId', applicationId)}?page=${
                    folderPage || 1
                  }&appId=${folderSearch || ''}`,
                },
                { name: folderName },
              ]}
            />
          }
          style={{
            maxWidth: type === 'projects' ? WIDTH_DEFAULT : '100%',
            overflow: type === 'projects' ? 'unset' : 'hidden auto',
          }}>
          <Toolbar
            env={type}
            type="folder"
            folderDetail={folder}
            createDisabled={pageInfo.total >= 20}
            deleteDisabled={deleteDisabled}
            onAuthorize={handleAuthorize}
            onCreate={openDrawer}
            onDelete={handleDeleteProject}
            onSearch={handleSearch}
          />
          <BasicInfo env={type} fileType="project" fileDetail={folder} onBlur={handleOnBlur} />
          <List
            type={type}
            loading={loading}
            pageInfo={pageInfo}
            fileList={fileList}
            screenshots={screenshots}
            openDrawer={openDrawer}
          />
        </FoxPageContent>
      </Content>
      <EditDrawer
        drawerOpen={drawerOpen}
        saveLoading={saveLoading}
        pageInfo={pageInfo}
        editFile={editFile}
        application={application}
        updateEditFile={updateEditFile}
        saveFile={saveFile}
        fetchFileList={fetchFileList}
        closeDrawer={openDrawer}
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
        onValidate={checkAuthRole}
        onAdd={saveUser}
        onDelete={deleteUser}
      />
    </>
  );
};

export default ProjectFileComponent;
