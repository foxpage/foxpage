import React, { useContext } from 'react';
import { connect } from 'react-redux';

import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Table as AntTable } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/variables';
import { PublishIcon } from '@/components/index';
import { GlobalContext } from '@/pages/system';
import { Creator, VariableEntity } from '@/types/index';
import { periodFormat } from '@/utils/index';

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

type ConditionListType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

function ConditionList(props: ConditionListType) {
  const {
    applicationId,
    loading,
    pageInfo,
    list,
    scope,
    fetchList,
    fetchBuildVersion,
    publishVariable,
    commitToStore,
    deleteVariable,
    openEditDrawer,
  } = props;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, store } = locale.business;

  const handleFetchList = () => {
    fetchList({ applicationId, page: pageInfo.page, size: pageInfo.size });
  };

  const handleDelete = (id) => {
    if (applicationId && id) {
      deleteVariable(
        {
          applicationId,
          id,
          status: true,
        },
        () => {
          fetchList({
            applicationId,
            page: pageInfo.page,
            size: pageInfo.size,
          });
        },
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

  const columns: any[] = [
    {
      title: global.nameLabel,
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: global.type,
      dataIndex: 'type',
      key: 'schemas',
      render: (_text: string, record: VariableEntity) => {
        const schemas = record.content?.schemas;
        return <React.Fragment>{schemas?.length > 0 ? schemas[0].type : '--'}</React.Fragment>;
      },
    },
    {
      title: global.creator,
      dataIndex: 'creator',
      key: 'creator',
      render: (creator: Creator) => creator?.account || '',
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
      width: 180,
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
              <PublishIcon
                svgStyles={{ width: 18, height: 18, position: 'absolute', top: '2px', left: '1px' }}
              />
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
                handleDelete(record.id);
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
      render: (folderName) => (folderName !== '_variable' ? <span>{folderName}</span> : ''),
    });
  }

  return (
    <Table
      rowKey="id"
      loading={loading}
      columns={columns}
      dataSource={list}
      pagination={
        pageInfo.total > pageInfo.size
          ? {
              position: ['bottomCenter'],
              current: pageInfo.page,
              pageSize: pageInfo.size,
              total: pageInfo.total,
            }
          : false
      }
      onChange={(pagination) => {
        fetchList({
          applicationId,
          page: pagination.current || 1,
          size: pagination.pageSize || 10,
        });
      }}
    />
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(ConditionList);
