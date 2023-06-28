import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';

import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Table as AntTable, Tag, Tooltip } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/variables';
import { Name, PublishIcon } from '@/components/index';
import { GlobalContext } from '@/pages/system';
import { Creator, VariableEntity } from '@/types/index';
import { formatter, periodFormat } from '@/utils/index';

const Table = styled(AntTable)`
  .ant-table-pagination.ant-pagination {
    margin: 24px 0 0;
  }
`;

const mapStateToProps = (store: RootState) => ({
  applicationId: store.applications.detail.settings.app.applicationId,
  loading: store.applications.detail.file.variables.loading,
  pageInfo: store.applications.detail.file.variables.pageInfo,
  list: store.applications.detail.file.variables.list,
  scope: store.applications.detail.file.variables.scope,
});

const mapDispatchToProps = {
  fetchList: ACTIONS.fetchList,
  fetchBuildVersion: ACTIONS.fetchVariableBuilderVersion,
  openEditDrawer: ACTIONS.openEditDrawer,
  saveVariable: ACTIONS.saveVariable,
  publishVariable: ACTIONS.publishVariable,
  commitToStore: ACTIONS.commitToStore,
  deleteVariable: ACTIONS.deleteVariable,
};

type ConditionListType = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {
    search?: string;
  };

function ConditionList(props: ConditionListType) {
  const {
    applicationId,
    loading,
    pageInfo,
    list,
    scope,
    search,
    fetchList,
    fetchBuildVersion,
    publishVariable,
    commitToStore,
    deleteVariable,
    openEditDrawer,
  } = props;

  // url params
  const history = useHistory();

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, store, version } = locale.business;

  const handleFetchList = (page?: number, size?: number) => {
    fetchList({
      applicationId,
      page: page || pageInfo.page,
      size: size || pageInfo.size,
      search: search || '',
    });
  };

  const handleDelete = (record: VariableEntity) => {
    if (applicationId && record.id) {
      deleteVariable(
        {
          applicationId,
          id: record.id,
          status: true,
          variable: record,
        },
        handleFetchList,
      );
    }
  };

  const handlePublish = (contentId) => {
    if (contentId) {
      publishVariable(
        {
          applicationId,
          contentId,
          status: 'release',
        },
        handleFetchList,
      );
    }
  };

  const handleCommit = (id, isOnline) => {
    if (id) {
      commitToStore(
        {
          id,
          applicationId: applicationId,
          type: 'variable',
          isOnline,
        },
        handleFetchList,
      );
    }
  };

  const handlePaginationChange = (pagination) => {
    history.push({
      pathname: history.location.pathname,
      search: `?page=${pagination.current}&searchText=${search}`,
    });
  };

  const columns: any[] = [
    {
      title: global.idLabel,
      dataIndex: 'contentId',
      key: 'contentId',
      width: 160,
    },
    {
      title: global.nameLabel,
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: <Tooltip title={version.liveVersion}>{version.name}</Tooltip>,
      dataIndex: 'version',
      key: 'version',
      width: 90,
      render: (version: Record<string, string>) =>
        version?.live ? <Tag color="orange">{formatter(version.live)}</Tag> : '',
    },
    {
      title: global.type,
      dataIndex: 'type',
      key: 'schemas',
      width: 150,
      render: (_text: string, record: VariableEntity) => {
        const schemas = record.content?.schemas;
        return <React.Fragment>{schemas?.length > 0 ? schemas[0].type : '--'}</React.Fragment>;
      },
    },
    {
      title: global.creator,
      dataIndex: 'creator',
      key: 'creator',
      width: 200,
      render: (creator: Creator) => creator?.email || '',
    },
    {
      title: global.createTime,
      dataIndex: 'createTime',
      key: 'createTime',
      width: 200,
      render: (text: string) => periodFormat(text, 'unknown'),
    },
    {
      title: global.actions,
      key: 'id',
      width: 160,
      render: (_text: string, record: VariableEntity) => {
        return (
          <React.Fragment>
            <Button
              type="default"
              size="small"
              shape="circle"
              title="Edit"
              onClick={() => {
                openEditDrawer(true, record, 'edit');
                fetchBuildVersion(applicationId, record);
              }}
              style={{ marginRight: 8 }}>
              <EditOutlined />
            </Button>
            <Button
              type="default"
              size="small"
              shape="circle"
              title={global.publish}
              onClick={() => handlePublish(record.contentId)}
              style={{ marginRight: 8 }}>
              <PublishIcon />
            </Button>
            <Popconfirm
              title={record?.online ? store.revokeTitle : store.commitTitle}
              okText={global.yes}
              cancelText={global.no}
              onConfirm={() => handleCommit(record.id, record.online)}>
              <Button
                type="default"
                size="small"
                shape="circle"
                title={record?.online ? store.revoke : store.commit}
                style={{ marginRight: 8 }}>
                {record?.online ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
              </Button>
            </Popconfirm>
            <Popconfirm
              title={`${global.deleteMsg} ${record.name}?`}
              onConfirm={() => {
                handleDelete(record);
              }}
              okText={global.yes}
              cancelText={global.no}>
              <Button size="small" shape="circle" icon={<DeleteOutlined />} />
            </Popconfirm>
          </React.Fragment>
        );
      },
    },
  ];

  if (scope === 'project') {
    columns.splice(1, 0, {
      title: global.project,
      dataIndex: 'folderName',
      key: 'folderName',
      render: (folderName, record) =>
        folderName !== '_variable' ? (
          <Link
            to={`/applications/${
              record?.applicationId || applicationId
            }/projects/detail?applicationId=${applicationId}&folderId=${record.folderId}`}>
            <Name>{folderName}</Name>
          </Link>
        ) : (
          ''
        ),
    });
  }

  return (
    <Table
      rowKey="id"
      loading={loading}
      columns={columns}
      dataSource={list}
      pagination={
        pageInfo?.total && pageInfo.total > pageInfo.size
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
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(ConditionList);
