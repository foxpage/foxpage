import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { FileOutlined, FolderOutlined } from '@ant-design/icons';
import { Input, Table as AntTable } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/projects/recycleBin';
import { Content, FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { GlobalContext } from '@/pages/system';
import { getLocationIfo, periodFormat } from '@/utils/index';

const { Search } = Input;

const PAGE_NUM = 1;

const Table = styled(AntTable)`
  .ant-table-pagination.ant-pagination {
    margin: 24px 0 0;
  }
`;

const mapStateToProps = (store: RootState) => ({
  loading: store.workspace.projects.recycleBin.loading,
  pageInfo: store.workspace.projects.recycleBin.pageInfo,
  projects: store.workspace.projects.recycleBin.projects,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchRecycles: ACTIONS.fetchRecycle,
};

type ProjectsProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const RecycleBin: React.FC<ProjectsProps> = (props) => {
  const { loading, pageInfo, projects, fetchRecycles, clearAll } = props;
  const [pageNum, setPageNum] = useState<number>(pageInfo.page);
  const [search, setSearch] = useState<string | undefined>();

  // i18n
  const { locale, organizationId } = useContext(GlobalContext);
  const { global } = locale.business;

  // url search params
  const history = useHistory();
  const { page: searchPage, searchText } = getLocationIfo(history.location);

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  useEffect(() => {
    setPageNum(searchPage || PAGE_NUM);
  }, [searchPage]);

  useEffect(() => {
    setSearch(searchText || '');
  }, [searchText]);

  useEffect(() => {
    if (organizationId)
      fetchRecycles({
        organizationId,
        page: pageNum,
        size: pageInfo.size,
        search: search || '',
      });
  }, [pageNum, search, organizationId]);

  const columns = [
    {
      title: '',
      dataIndex: 'id',
      width: 40,
      render: (id: string) => {
        const iconMap = {
          folder: <FolderOutlined style={{ color: '#ff9900' }} />,
          file: <FileOutlined />,
          default: '',
        };

        const folderIdStart = 'fold_';
        const fileIdStart = 'file_';
        const type = id.includes(folderIdStart) ? 'folder' : id.includes(fileIdStart) ? 'file' : 'default';

        return <span>{iconMap[type]}</span>;
      },
    },
    {
      title: global.nameLabel,
      dataIndex: 'name',
    },
    {
      title: global.application,
      dataIndex: 'application',
      render: (application) => application.name,
    },
    {
      title: global.creator,
      dataIndex: 'creator',
      render: (creator) => creator?.account || '--',
    },
    {
      title: global.createTime,
      dataIndex: 'createTime',
      width: 200,
      render: (createTime) => periodFormat(createTime, 'unknown'),
    },
  ];

  const handleSearch = (search) => {
    history.push({
      pathname: history.location.pathname,
      search: `?page=${PAGE_NUM}&searchText=${search}`,
    });
  };

  const handlePaginationChange = (pagination) => {
    history.push({
      pathname: history.location.pathname,
      search: `?page=${pagination.current}&searchText=${search || ''}`,
    });
  };

  return (
    <FoxPageContent
      breadcrumb={
        <FoxPageBreadcrumb
          breadCrumb={[
            {
              name: global.recycles,
            },
          ]}
        />
      }>
      <Content>
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <Search
            placeholder={global.inputSearchText}
            defaultValue={search}
            onSearch={handleSearch}
            style={{ width: 250 }}
          />
        </div>
        <Table
          loading={loading}
          rowKey="id"
          dataSource={projects}
          columns={columns}
          pagination={
            pageInfo.total > pageInfo.size
              ? {
                  position: ['bottomCenter'],
                  current: pageInfo.page,
                  pageSize: pageInfo.size,
                  total: pageInfo.total,
                  showSizeChanger: false,
                }
              : false
          }
          onChange={handlePaginationChange}
        />
      </Content>
    </FoxPageContent>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(RecycleBin);
