import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Table as AntTable, Tag, Tooltip } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/conditions';
import { Name, PublishIcon } from '@/components/index';
import { ConditionTypeEnum } from '@/constants/index';
import { GlobalContext } from '@/pages/system';
import { ConditionEntity, Creator } from '@/types/index';
import { formatter, periodFormat } from '@/utils/index';

const Table = styled(AntTable)`
  .ant-table-pagination.ant-pagination {
    margin: 24px 0 0;
  }
`;

const mapStateToProps = (store: RootState) => ({
  applicationId: store.applications.detail.settings.app.applicationId,
  loading: store.applications.detail.file.conditions.loading,
  pageInfo: store.applications.detail.file.conditions.pageInfo,
  list: store.applications.detail.file.conditions.list,
  scope: store.applications.detail.file.conditions.scope,
});

const mapDispatchToProps = {
  fetchList: ACTIONS.fetchList,
  openDrawer: ACTIONS.openEditDrawer,
  deleteCondition: ACTIONS.deleteCondition,
  publishCondition: ACTIONS.publishCondition,
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
    deleteCondition,
    openDrawer,
    publishCondition,
  } = props;

  // url params
  const history = useHistory();

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, version } = locale.business;

  const handleFetchList = (page?: number, size?: number) => {
    fetchList({
      applicationId,
      page: page || pageInfo.page,
      size: size || pageInfo.size,
      search: search || '',
    });
  };

  const handlePublish = (contentId) => {
    if (contentId) {
      publishCondition(
        {
          applicationId,
          contentId,
          status: 'release',
        },
        handleFetchList,
      );
    }
  };

  const handleDelete = (record: ConditionEntity) => {
    if (applicationId && record.id) {
      deleteCondition(
        {
          applicationId,
          id: record.id,
          status: true,
          condition: record,
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
      key: 'type',
      width: 90,
      render: (_text: string, record: ConditionEntity) => {
        const schemas = record.content?.schemas;
        if (schemas?.length > 0) {
          const type = schemas[0].type;
          if (type) {
            return ConditionTypeEnum[type] || '';
          }
        }
        return '';
      },
    },
    {
      title: global.creator,
      dataIndex: 'creator',
      key: 'creator',
      width: 200,
      render: (creator: Creator) => creator?.email || '--',
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
      dataIndex: '',
      key: '',
      width: 160,
      render: (_text: string, record: ConditionEntity) => (
        <>
          <Button
            size="small"
            shape="circle"
            icon={<EditOutlined />}
            onClick={() => {
              openDrawer(true, record);
            }}
            style={{ marginRight: 8 }}
          />
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
            title={`${global.deleteMsg}${record.name}?`}
            okText={global.yes}
            cancelText={global.no}
            onConfirm={() => handleDelete(record)}>
            <Button size="small" shape="circle" icon={<DeleteOutlined />} />
          </Popconfirm>
        </>
      ),
    },
  ];

  if (scope === 'project') {
    columns.splice(1, 0, {
      title: global.project,
      dataIndex: 'folderName',
      key: 'folderName',
      render: (folderName, record) =>
        folderName !== '_condition' ? (
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
