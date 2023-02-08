import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Input, Select } from 'antd';
import styled from 'styled-components';

import { ApplicationSelector, Content, FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { ROUTE_SEARCH_MAP, WIDTH_DEFAULT } from '@/constants/index';
import { GlobalContext } from '@/pages/system';
import {
  Application,
  AuthorizeQueryParams,
  PaginationInfo,
  PaginationReqParams,
  ProjectEntity,
  ProjectListFetchParams,
  ProjectSaveParams,
} from '@/types/index';
import { getLocationIfo } from '@/utils/location-info';

import { EditDrawer, List } from './components/index';

const { Search: AntSearch } = Input;

interface ProjectProps {
  type: 'application' | 'projects' | 'personal' | 'involved';
  loading: boolean;
  saveLoading;
  pageInfo: PaginationInfo;
  allApplicationList?: Application[];
  applicationList: Application[];
  projectList: ProjectEntity[];
  editProject: ProjectEntity;
  drawerOpen: boolean;
  mask?: number;
  fetchList: (params: ProjectListFetchParams) => void;
  // for edit drawer
  fetchAllApps?: (params: PaginationReqParams) => void;
  // for filter
  fetchApps: (params: PaginationReqParams) => void;
  queryMask?: (params: AuthorizeQueryParams) => void;
  updateEditProject: (name: string, value: unknown) => void;
  saveProject: (params: ProjectSaveParams, cb?: () => void) => void;
  openDrawer: (open: boolean, editProject?: ProjectEntity) => void;
}

const PAGE_NUM = 1;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const Search = styled(AntSearch)`
  .ant-input-group-addon {
    .ant-select-focused {
      .ant-select-selector {
        color: rgba(0, 0, 0, 0.85);
      }
    }
  }
`;

const ProjectFolderComponent: React.FC<ProjectProps> = (props) => {
  const {
    type,
    loading,
    saveLoading,
    pageInfo,
    allApplicationList,
    applicationList,
    projectList,
    editProject,
    drawerOpen,
    mask,
    openDrawer,
    fetchList,
    fetchAllApps,
    fetchApps,
    queryMask,
    updateEditProject,
    saveProject,
  } = props;
  const [applicationId, setApplicationId] = useState('');
  const [pageNum, setPageNum] = useState(pageInfo.page);
  const [searchType, setSearchType] = useState('project');
  // for list filter by appId
  const [search, setSearch] = useState('');

  // location search params
  const history = useHistory();
  const { page: searchPage, appId: searchAppId } = getLocationIfo(history.location);
  const { applicationId: queryApplicationId } = useParams<{ applicationId: string }>();

  // i18n
  const { locale, organizationId } = useContext(GlobalContext);
  const { content: contentI18n, file: fileI18n, global, project: projectI18n } = locale.business;

  useEffect(() => {
    setPageNum(Number(searchPage) || PAGE_NUM);
  }, [searchPage]);

  useEffect(() => {
    setSearch(searchAppId || '');
  }, [searchAppId]);

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
  }, [organizationId, applicationId, pageNum, search, fetchList]);

  // get select project detail info
  useEffect(() => {
    const newApplicationId = editProject?.application?.id;
    if (newApplicationId) setApplicationId(newApplicationId);
  }, [editProject?.application?.id]);

  // auth check
  useEffect(() => {
    if (typeof queryMask === 'function' && queryApplicationId) {
      queryMask({
        applicationId: queryApplicationId,
        type: 'application',
      });
    }
  }, [queryApplicationId, queryMask]);

  const handleSearch = useCallback(
    (value, vType) => {
      setPageNum(PAGE_NUM);

      if (vType === 'appId') {
        history.push({
          pathname: history.location.pathname,
          search: `?page=1&appId=${value || ''}`,
        });
      }

      if (vType === 'search') {
        history.push({
          pathname: ROUTE_SEARCH_MAP[type].replace(':applicationId', applicationId),
          search: `?applicationId=${
            search || ''
          }&type=${searchType}&search=${value}&folderPage=${pageNum}&folderSearch=${searchAppId || ''}`,
        });
      }
    },
    [applicationId, search, searchType, type, pageNum],
  );

  const searchTypeOptions = useMemo(
    () => [
      {
        label: projectI18n.name,
        value: 'project',
      },
      {
        label: fileI18n.name,
        value: 'page_template',
      },
      {
        label: contentI18n.name,
        value: 'content',
      },
    ],
    [contentI18n, fileI18n, projectI18n],
  );

  const isAdmin = useMemo(() => {
    let isAdmin = true;

    if (type === 'involved') {
      isAdmin = false;
    }
    if (type === 'projects') {
      isAdmin = false;
    }
    if (type === 'application') {
      isAdmin = !!mask && (mask & 1) === 1;
    }

    return isAdmin;
  }, [mask, type]);

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
              <ApplicationSelector
                defaultApp={searchAppId}
                list={applicationList}
                onFetch={fetchApps}
                onSelect={(value: string) => handleSearch(value, 'appId')}
              />
            ) : (
              <div />
            )}
            <div>
              <Search
                placeholder={global.inputSearchText}
                addonBefore={
                  <Select
                    options={searchTypeOptions}
                    value={searchType}
                    onChange={setSearchType}
                    style={{
                      width: 100,
                    }}
                  />
                }
                onSearch={(value: string) => handleSearch(value, 'search')}
                style={{ width: 300 }}
              />
              {isAdmin && (
                <Button type="primary" onClick={() => openDrawer(true)} style={{ marginLeft: 8 }}>
                  <PlusOutlined /> {projectI18n.add}
                </Button>
              )}
            </div>
          </Header>
          <List
            applicationId={applicationId}
            search={search}
            type={type}
            pageInfo={pageInfo}
            loading={loading}
            projectList={projectList}
          />
        </FoxPageContent>
      </Content>
      <EditDrawer
        saveLoading={saveLoading}
        applicationId={type === 'application' ? applicationId : undefined}
        type={type}
        pageInfo={pageInfo}
        search={search}
        drawerOpen={drawerOpen}
        editProject={editProject}
        apps={allApplicationList}
        fetchProjectList={fetchList}
        fetchApps={fetchAllApps}
        updateEditProject={updateEditProject}
        saveProject={saveProject}
        closeDrawer={openDrawer}
      />
    </>
  );
};

export default ProjectFolderComponent;
