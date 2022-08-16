import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import styled from 'styled-components';

import {
  ApplicationSelector,
  AuthorizeDrawer,
  Content,
  FoxPageBreadcrumb,
  FoxPageContent,
} from '@/components/index';
import { WIDTH_DEFAULT } from '@/constants/global';
import { GlobalContext } from '@/pages/system';
import {
  Application,
  AuthorizeAddParams,
  AuthorizeDeleteParams,
  AuthorizeListFetchParams,
  AuthorizeListItem,
  AuthorizeUserFetchParams,
  PaginationInfo,
  PaginationReqParams,
  ProjectEntity,
  ProjectListFetchParams,
  ProjectSaveParams,
  User,
} from '@/types/index';
import { getLocationIfo } from '@/utils/location-info';

import { EditDrawer, List } from './components/index';

interface ProjectProps {
  type: 'application' | 'involved' | 'personal' | 'projects' | 'workspace';
  organizationId: string;
  loading: boolean;
  saveLoading;
  pageInfo: PaginationInfo;
  applicationList: Application[];
  projectList: ProjectEntity[];
  editProject: ProjectEntity;
  drawerOpen: boolean;
  authDrawerOpen?: boolean;
  authLoading?: boolean;
  authList?: AuthorizeListItem[];
  userList?: User[];
  fetchList: (params: ProjectListFetchParams) => void;
  fetchApps: (params: PaginationReqParams) => void;
  updateEditProject: (name: string, value: unknown) => void;
  saveProject: (params: ProjectSaveParams, cb?: () => void) => void;
  deleteProject: (id: string, applicationId: string, organizationId: string, search?: string) => void;
  openDrawer: (open: boolean, editProject?: ProjectEntity) => void;
  fetchAuthList?: (params: AuthorizeListFetchParams) => void;
  fetchUserList?: (params: AuthorizeUserFetchParams, cb?: () => void) => void;
  saveUser?: (params: AuthorizeAddParams, cb?: () => void) => void;
  deleteUser?: (params: AuthorizeDeleteParams, cb?: () => void) => void;
  openAuthDrawer?: (visible: boolean, editProject?: ProjectEntity) => void;
}

const PAGE_NUM = 1;
const PAGE_SIZE = 999;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const ProjectFolderComponent: React.FC<ProjectProps> = (props) => {
  const {
    type,
    organizationId,
    loading,
    saveLoading,
    pageInfo,
    applicationList,
    projectList,
    editProject,
    drawerOpen,
    authDrawerOpen = false,
    authLoading = false,
    authList = [],
    userList = [],
    openDrawer,
    fetchList,
    fetchApps,
    updateEditProject,
    saveProject,
    deleteProject,
    fetchAuthList,
    fetchUserList,
    saveUser,
    deleteUser,
    openAuthDrawer,
  } = props;
  const [applicationId, setApplicationId] = useState('');
  const [pageNum, setPageNum] = useState(pageInfo.page);
  const [search, setSearch] = useState('');
  const [typeId, setTypeId] = useState('');

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, project } = locale.business;

  // location search params
  const { applicationId: queryApplicationId } = getLocationIfo(useLocation());

  const isFromProject = !type && !applicationId;

  useEffect(() => {
    if (queryApplicationId) setApplicationId(queryApplicationId);
  }, [queryApplicationId]);

  useEffect(() => {
    if (organizationId)
      fetchList({
        organizationId,
        applicationId,
        page: pageNum,
        size: pageInfo.size,
        search,
      });
  }, [organizationId, applicationId, search, fetchList]);

  // get select project detail info
  useEffect(() => {
    const newApplicationId = editProject?.application?.id;
    if (newApplicationId) setApplicationId(newApplicationId);

    const newTypeId = editProject?.id;
    if (newTypeId) setTypeId(newTypeId);
  }, [editProject?.id, editProject?.application?.id]);

  // fetch project selected auth list
  useEffect(() => {
    if (authDrawerOpen && applicationId && typeId) {
      if (typeof fetchAuthList === 'function')
        fetchAuthList({
          applicationId,
          type: 'folder',
          typeId,
        });
    }
  }, [authDrawerOpen, applicationId, typeId, fetchAuthList]);

  // fetch project selected authorize user available list
  useEffect(() => {
    if (authDrawerOpen) {
      if (typeof fetchUserList === 'function')
        fetchUserList({
          page: PAGE_NUM,
          size: PAGE_SIZE,
        });
    }
  }, [authDrawerOpen, fetchUserList]);

  const handleSearch = (appId) => {
    setPageNum(PAGE_NUM);

    setSearch(appId);
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
                },
              ]}
            />
          }
          style={{
            maxWidth: type === 'projects' ? WIDTH_DEFAULT : '100%',
            overflow: type === 'projects' ? 'unset' : 'hidden auto',
          }}>
          <Header>
            {type !== 'application' ? (
              <ApplicationSelector list={applicationList} onSelect={handleSearch} />
            ) : (
              <div />
            )}
            {type !== 'involved' && (
              <Button type="primary" onClick={() => openDrawer(true)}>
                <PlusOutlined /> {project.add}
              </Button>
            )}
          </Header>
          <List
            organizationId={organizationId}
            applicationId={applicationId}
            search={search}
            type={type}
            pageInfo={pageInfo}
            loading={loading}
            projectList={projectList}
            fetchProjectList={fetchList}
            deleteProject={deleteProject}
            openDrawer={openDrawer}
            openAuthDrawer={openAuthDrawer}
          />
        </FoxPageContent>
      </Content>
      <EditDrawer
        saveLoading={saveLoading}
        organizationId={organizationId}
        applicationId={type === 'application' ? applicationId : undefined}
        type={type}
        pageInfo={pageInfo}
        search={search}
        drawerOpen={drawerOpen}
        editProject={editProject}
        apps={applicationList}
        fetchProjectList={fetchList}
        fetchApps={fetchApps}
        updateEditProject={updateEditProject}
        saveProject={saveProject}
        closeDrawer={openDrawer}
      />
      {!isFromProject && (
        <AuthorizeDrawer
          type="folder"
          typeId={typeId}
          applicationId={applicationId}
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

export default ProjectFolderComponent;
