import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Input, Select } from 'antd';
import styled from 'styled-components';

import { ApplicationSelector, Content, FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { WIDTH_DEFAULT } from '@/constants/global';
import { GlobalContext } from '@/pages/system';
import {
  Application,
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
  type: 'application' | 'involved' | 'personal' | 'projects' | 'workspace';
  organizationId: string;
  loading: boolean;
  saveLoading;
  pageInfo: PaginationInfo;
  allApplicationList?: Application[];
  applicationList: Application[];
  projectList: ProjectEntity[];
  editProject: ProjectEntity;
  drawerOpen: boolean;
  fetchList: (params: ProjectListFetchParams) => void;
  // for edit drawer
  fetchAllApps?: (params: PaginationReqParams) => void;
  // for filter
  fetchApps: (params: PaginationReqParams) => void;
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
    organizationId,
    loading,
    saveLoading,
    pageInfo,
    allApplicationList,
    applicationList,
    projectList,
    editProject,
    drawerOpen,
    openDrawer,
    fetchList,
    fetchAllApps,
    fetchApps,
    updateEditProject,
    saveProject,
  } = props;
  const [applicationId, setApplicationId] = useState('');
  const [pageNum, setPageNum] = useState(pageInfo.page);
  const [searchType, setSearchType] = useState('project');
  const [searchCache, setSearchCache] = useState<Record<string, string | undefined>>({
    searchType: '',
    searchText: undefined,
  });
  // for list filter by appId
  const [search, setSearch] = useState('');

  // i18n
  const { locale } = useContext(GlobalContext);
  const { file, global, project } = locale.business;

  // location search params
  const { applicationId: queryApplicationId } = getLocationIfo(useLocation());

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
        searchText: searchCache.searchText,
        searchType: searchCache.searchType || '',
      });
  }, [organizationId, applicationId, search, searchCache, fetchList]);

  // get select project detail info
  useEffect(() => {
    const newApplicationId = editProject?.application?.id;
    if (newApplicationId) setApplicationId(newApplicationId);
  }, [editProject?.application?.id]);

  const handleSearch = useCallback(
    (value, type) => {
      setPageNum(PAGE_NUM);

      if (type === 'appId') setSearch(value);
      if (type === 'search') {
        setSearchCache({
          searchText: value,
          searchType: searchType,
        });
      }
    },
    [searchType],
  );

  const searchTypeOptions = useMemo(
    () => [
      {
        label: project.name,
        value: 'project',
      },
      {
        label: file.name,
        value: 'file',
      },
    ],
    [file, project],
  );

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
                list={applicationList}
                organizationId={organizationId}
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
                      width: 90,
                    }}
                  />
                }
                defaultValue={searchCache.searchText}
                onSearch={(value: string) => handleSearch(value, 'search')}
                style={{ width: 300 }}
              />
              {type !== 'involved' && type !== 'projects' && (
                <Button type="primary" onClick={() => openDrawer(true)} style={{ marginLeft: 8 }}>
                  <PlusOutlined /> {project.add}
                </Button>
              )}
            </div>
          </Header>
          <List
            organizationId={organizationId}
            applicationId={applicationId}
            search={search}
            searchCache={searchCache}
            type={type}
            pageInfo={pageInfo}
            loading={loading}
            projectList={projectList}
            fetchProjectList={fetchList}
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
