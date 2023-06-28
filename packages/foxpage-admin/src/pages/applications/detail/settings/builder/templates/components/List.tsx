import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { Link, useParams } from 'react-router-dom';

import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Table, Tag, Tooltip } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/settings/builder/template';
import { ROUTE_CONTENT_MAP, StoreGoodsPurchaseType, suffixTagColor } from '@/constants/index';
import { GlobalContext } from '@/pages/system';
import { ApplicationSettingBuilderComponent } from '@/types/index';

const TYPE = 'template';

const mapStateToProps = (store: RootState) => ({
  loading: store.applications.detail.settings.builder.templates.loading,
  templates: store.applications.detail.settings.builder.templates.templates,
  pageInfo: store.applications.detail.settings.builder.templates.pageInfo,
});

const mapDispatchToProps = {
  remove: ACTIONS.deleteCategory,
  save: ACTIONS.saveCategory,
  updatePageNum: ACTIONS.updatePageNum,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ComponentList = (props: IProps) => {
  const { loading, templates = [], pageInfo, remove, save, updatePageNum } = props;

  const { applicationId } = useParams<{ applicationId: string }>();

  // i18n
  const { locale } = useContext(GlobalContext);
  const { builder, global, store, version } = locale.business;

  const columns = [
    {
      title: global.nameLabel,
      dataIndex: 'name',
      render: (name: string, record: ApplicationSettingBuilderComponent) => (
        <>
          {record.delivery === StoreGoodsPurchaseType.reference && (
            <Tag color={suffixTagColor.refer} style={{ zoom: 0.8 }}>
              refer
            </Tag>
          )}
          <span>{name}</span>
        </>
      ),
    },
    {
      title: version.status,
      dataIndex: 'status',
      width: 100,
      render: (status: boolean) => status && <Tag color="cyan">Live</Tag>,
    },
    {
      title: global.idLabel,
      dataIndex: 'id',
      width: 300,
      render: (id: string) => (
        <Link
          to={{
            pathname: `${ROUTE_CONTENT_MAP['application'].replace(':applicationId', applicationId)}`,
            search: `?applicationId=${applicationId}&fileId=${id}`,
          }}>
          {id}
        </Link>
      ),
    },
    {
      title: global.actions,
      key: '',
      width: 100,
      render: (_text: string, record: ApplicationSettingBuilderComponent) => (
        <>
          <Popconfirm
            cancelText={global.no}
            okText={global.yes}
            placement="topLeft"
            title={record?.status ? store.revokeTitle : store.commitTitle}
            onConfirm={() => handleCommitRevoke(record)}>
            <Button
              type="default"
              size="small"
              shape="circle"
              title={record?.status ? store.revoke : store.commit}>
              {record?.status ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
            </Button>
          </Popconfirm>
          <Popconfirm
            title={`${global.deleteMsg} ${record?.name || ''}?`}
            disabled={record.status}
            onConfirm={() => {
              handleDelete(record.idx);
            }}
            okText={global.yes}
            cancelText={global.no}>
            <Tooltip title={record.status ? builder.deleteTips : ''}>
              <Button
                size="small"
                shape="circle"
                icon={<DeleteOutlined />}
                disabled={record.status}
                style={{ marginLeft: 8 }}
              />
            </Tooltip>
          </Popconfirm>
        </>
      ),
    },
  ];

  const handleDelete = (id: string) => {
    if (applicationId && id) {
      remove({
        applicationId,
        type: TYPE,
        ids: id,
      });
    }
  };

  const handleCommitRevoke = (template) => {
    save({
      applicationId,
      type: TYPE,
      setting: [
        {
          category: template.category,
          id: template.id,
          idx: template.idx,
          name: template.name || '',
          status: !template.status,
        } as any,
      ],
    });
  };

  return (
    <Table
      rowKey="idx"
      dataSource={templates}
      columns={columns}
      loading={loading}
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
      onChange={(pagination) => {
        updatePageNum(pagination.current || pageInfo.size);
      }}
    />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ComponentList);
