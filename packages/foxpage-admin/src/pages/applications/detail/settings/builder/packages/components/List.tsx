import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Table, Tag, Tooltip } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/settings/builder/component';
import { StoreGoodsPurchaseType, suffixTagColor } from '@/constants/index';
import { GlobalContext } from '@/pages/system';
import { ApplicationSettingBuilderComponent } from '@/types/index';
import { objectEmptyCheck } from '@/utils/empty-check';

const mapStateToProps = (store: RootState) => ({
  loading: store.applications.detail.settings.builder.components.loading,
  components: store.applications.detail.settings.builder.components.components,
  pageInfo: store.applications.detail.settings.builder.components.pageInfo,
});

const mapDispatchToProps = {
  remove: ACTIONS.deleteCategory,
  save: ACTIONS.saveCategory,
  openEditor: ACTIONS.updateEditorVisible,
  updatePageNum: ACTIONS.updatePageNum,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ComponentList = (props: IProps) => {
  const { loading, components = [], pageInfo, updatePageNum, openEditor, save, remove } = props;

  const { applicationId } = useParams<{ applicationId: string }>();

  // i18n
  const { locale } = useContext(GlobalContext);
  const { builder, category, global, store, version } = locale.business;

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
      title: category.label,
      dataIndex: 'label',
      width: 300,
      render: (_text: string, record: ApplicationSettingBuilderComponent) => (
        <span>{record.category?.name}</span>
      ),
    },
    {
      title: version.status,
      dataIndex: 'status',
      width: 100,
      render: (status: boolean) => status && <Tag color="cyan">Live</Tag>,
    },
    {
      title: category.category,
      dataIndex: 'groupText',
      width: 300,
      render: (_text: string, record: ApplicationSettingBuilderComponent) =>
        !objectEmptyCheck(record.category) ? (
          <Tag color="blue">{record.category?.categoryName + '.' + record.category?.groupName}</Tag>
        ) : (
          '-'
        ),
    },
    {
      title: category.sort,
      dataIndex: 'sort',
      width: 100,
      render: (_sort: string, record: ApplicationSettingBuilderComponent) => {
        const { sort = 0 } = record.category || {};
        return <span>{sort}</span>;
      },
    },
    {
      title: global.actions,
      key: '',
      width: 150,
      render: (_text: string, record: ApplicationSettingBuilderComponent) => (
        <>
          <Button
            type="default"
            size="small"
            shape="circle"
            title={global.edit}
            onClick={() => openEditor(true, record)}
            style={{ marginLeft: 8 }}>
            <EditOutlined />
          </Button>
          <Popconfirm
            cancelText={global.no}
            disabled={objectEmptyCheck(record.category)}
            okText={global.yes}
            title={record?.status ? store.revokeTitle : store.commitTitle}
            onConfirm={() => handleCommitRevoke(record)}>
            <Tooltip title={objectEmptyCheck(record.category) ? builder.commitTips : ''}>
              <Button
                type="default"
                size="small"
                shape="circle"
                disabled={objectEmptyCheck(record.category)}
                title={record?.status ? store.revoke : store.commit}
                style={{ marginLeft: 8 }}>
                {record?.status ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
              </Button>
            </Tooltip>
          </Popconfirm>
          <Popconfirm
            title={`${global.deleteMsg} ${record?.name || ''}?`}
            disabled={record.status}
            onConfirm={() => {
              handleDelete(record.idx, record.type);
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

  const handleDelete = (id: string, type: string) => {
    if (applicationId && id) {
      remove({
        applicationId,
        type,
        ids: id,
      });
    }
  };

  const handleCommitRevoke = (record: ApplicationSettingBuilderComponent) => {
    const { category, id, idx, name, type, status } = record;
    save({
      applicationId,
      type,
      setting: [
        {
          category,
          id,
          idx,
          name,
          status: !status,
        },
      ],
    });
  };

  return (
    <Table
      rowKey="idx"
      dataSource={components}
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
        updatePageNum(pagination.current || 1);
      }}
    />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ComponentList);
