import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { Input, Select } from 'antd';
import styled from 'styled-components';

import { ApplicationSelector, Content, FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { ROUTE_FOLDER_MAP, WIDTH_DEFAULT } from '@/constants/index';
import { GlobalContext } from '@/pages/system';
import {
  Application,
  CommonSearchParams,
  PaginationInfo,
  PaginationReqParams,
  ProjectSearchEntity,
} from '@/types/index';
import { getLocationIfo } from '@/utils/location-info';

import { List } from './components/index';

const PAGE_NUM = 1;

const { Search: AntSearch } = Input;

interface ProjectProps {
  type: 'application' | 'involved' | 'personal' | 'projects';
  appList?: Application[];
  list: ProjectSearchEntity[];
  loading: boolean;
  pageInfo: PaginationInfo;
  fetchAPPList?: (params: PaginationReqParams) => void;
  fetchList: (params: CommonSearchParams) => void;
}

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

const ProjectSearchComponent: React.FC<ProjectProps> = (props) => {
  const { type, loading, pageInfo, appList, list, fetchAPPList, fetchList } = props;
  const [pageNum, setPageNum] = useState(pageInfo.page);

  // location search params
  const {
    applicationId: queryApplicationId,
    type: queryType,
    typeId: queryTypeId,
    search: querySearch,
    folderPage,
    folderSearch,
  } = getLocationIfo(useLocation());
  const { applicationId } = useParams<{ applicationId: string }>();

  const [searchType, setSearchType] = useState(queryType || 'project');
  // handle do not call api when search type change only
  const [searchCache, setSearchCache] = useState<Record<string, string | undefined>>({
    searchType: queryType || 'project',
    searchTypeId: queryTypeId,
    searchText: querySearch,
    searchApp: queryApplicationId || applicationId,
  });

  // i18n
  const { locale, organizationId } = useContext(GlobalContext);
  const { global, content: contentI18n, file: fileI18n, project: projectI18n } = locale.business;

  useEffect(() => {
    if (organizationId)
      fetchList({
        organizationId,
        applicationId: searchCache.searchApp,
        type: searchCache.searchType as any,
        typeId: searchCache.searchTypeId,
        page: pageNum,
        search: searchCache.searchText,
        size: pageInfo.size,
      });
  }, [organizationId, searchCache, fetchList]);

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
        value: !!searchCache?.searchTypeId ? 'project_content' : 'content',
      },
    ],
    [contentI18n, fileI18n, projectI18n, searchCache?.searchTypeId],
  );

  const handleSearch = (value) => {
    setPageNum(PAGE_NUM);

    setSearchCache({
      searchApp: searchCache.searchApp,
      searchText: value,
      searchType,
      searchTypeId: searchCache.searchTypeId,
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
                    folderPage || PAGE_NUM
                  }&appId=${folderSearch || ''}`,
                },
                { name: global.search },
              ]}
            />
          }
          style={{
            maxWidth: type === 'projects' ? WIDTH_DEFAULT : '100%',
            overflow: type === 'projects' ? 'unset' : 'hidden auto',
          }}>
          <Header>
            {type !== 'application' && appList ? (
              <ApplicationSelector
                defaultApp={searchCache.searchApp}
                list={appList}
                onFetch={fetchAPPList}
                onSelect={(value: string) =>
                  setSearchCache({
                    ...searchCache,
                    searchApp: value,
                  })
                }
              />
            ) : (
              <div />
            )}
            <Search
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
              placeholder={global.inputSearchText}
              defaultValue={searchCache.searchText}
              onSearch={(value: string) => handleSearch(value)}
              style={{ width: 300 }}
            />
          </Header>
          <List
            applicationId={searchCache.searchApp}
            searchText={searchCache.searchText}
            type={searchType}
            env={type}
            pageInfo={pageInfo}
            loading={loading}
            list={list}
            fetchList={fetchList}
          />
        </FoxPageContent>
      </Content>
    </>
  );
};

export default ProjectSearchComponent;
