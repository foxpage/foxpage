import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Table as AntTable, Tag, Tooltip } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/functions';
import { FunctionTypeEnum } from '@/constants/index';
import { Name, PublishIcon } from '@/pages/components';
import { GlobalContext } from '@/pages/system';
import { Creator, FuncEntity } from '@/types/index';
import { formatter, periodFormat } from '@/utils/index';

const Table = styled(AntTable)`
  .ant-table-pagination.ant-pagination {
    margin: 24px 0 0;
  }
`;

const mapStateToProps = (store: RootState) => ({
  applicationId: store.applications.detail.settings.app.applicationId,
  loading: store.applications.detail.file.functions.loading,
  pageInfo: store.applications.detail.file.functions.pageInfo,
  list: store.applications.detail.file.functions.list,
  scope: store.applications.detail.file.functions.scope,
});

const mapDispatchToProps = {
  fetchList: ACTIONS.fetchList,
  openDrawer: ACTIONS.openEditDrawer,
  deleteFunction: ACTIONS.deleteFunction,
  publishFunction: ACTIONS.publishFunction,
};

type FunctionListType = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {
    search?: string;
  };

function FunctionList(props: FunctionListType) {
  const {
    applicationId,
    loading,
    pageInfo,
    list,
    scope,
    search,
    fetchList,
    deleteFunction,
    openDrawer,
    publishFunction,
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
      publishFunction(
        {
          applicationId,
          contentId,
          status: 'release',
        },
        handleFetchList,
      );
    }
  };

  const handleDelete = (record: FuncEntity) => {
    if (applicationId && record.id) {
      deleteFunction(
        {
          applicationId,
          id: record.id,
          status: true,
          fun: record,
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
      render: (_text: string, record: FuncEntity) => {
        const schemas = record.content?.schemas;
        return (
          <React.Fragment>
            {schemas?.length > 0 && schemas[0]?.props?.async ? FunctionTypeEnum.async : FunctionTypeEnum.sync}
          </React.Fragment>
        );
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
      dataIndex: '',
      key: '',
      width: 160,
      render: (_text: string, record: FuncEntity) => (
        <>
          <Button
            shape="circle"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openDrawer(true, record)}
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
            okText="Yes"
            cancelText="No"
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
        folderName !== '_function' ? (
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

export default connect(mapStateToProps, mapDispatchToProps)(FunctionList);
