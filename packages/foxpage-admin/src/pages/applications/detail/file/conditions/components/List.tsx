import React, { useContext } from 'react';
import { connect } from 'react-redux';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Table as AntTable } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/conditions';
import { PublishIcon } from '@/components/index';
import { ConditionTypeEnum } from '@/constants/index';
import { GlobalContext } from '@/pages/system';
import { ConditionEntity } from '@/types/index';
import { periodFormat } from '@/utils/index';

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

type ConditionListType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

function ConditionList(props: ConditionListType) {
  const {
    applicationId,
    loading,
    pageInfo,
    list,
    scope,
    fetchList,
    deleteCondition,
    openDrawer,
    publishCondition,
  } = props;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global } = locale.business;

  const handlePublish = (contentId) => {
    if (contentId) {
      publishCondition(
        {
          applicationId,
          contentId,
          status: 'release',
        },
        () =>
          fetchList({
            applicationId,
            page: pageInfo.page,
            size: pageInfo.size,
          }),
      );
    }
  };

  const handleDelete = (id) => {
    if (applicationId && id) {
      deleteCondition(
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

  const columns: any[] = [
    {
      title: global.nameLabel,
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: global.type,
      dataIndex: 'type',
      key: 'type',
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
      render: (_text: string, record: ConditionEntity) => {
        return record?.creator?.account || '--';
      },
    },
    {
      title: global.createTime,
      dataIndex: 'createTime',
      key: 'createTime',
      width: 200,
      render: (text: string) => {
        return periodFormat(text, 'unknown');
      },
    },
    {
      title: global.actions,
      dataIndex: '',
      key: '',
      width: 150,
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
            <PublishIcon
              svgStyles={{ width: 18, height: 18, position: 'absolute', top: '2px', left: '1px' }}
            />
          </Button>
          <Popconfirm
            title={`${global.deleteMsg}${record.name}?`}
            okText={global.yes}
            cancelText={global.no}
            onConfirm={() => handleDelete(record.id)}>
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
      render: (folderName) => (folderName !== '_condition' ? <span>{folderName}</span> : ''),
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
