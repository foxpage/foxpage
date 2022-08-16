import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { ArrowDownOutlined, ArrowUpOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Table, Tag } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/settings/builder/component';
import { GlobalContext } from '@/pages/system';
import { ApplicationSettingBuilderComponent, ComponentCategory } from '@/types/index';
import { objectEmptyCheck } from '@/utils/empty-check';

const mapStateToProps = (store: RootState) => ({
  loading: store.applications.detail.settings.builder.components.loading,
  components: store.applications.detail.settings.builder.components.components,
  pageInfo: store.applications.detail.settings.builder.components.pageInfo,
});

const mapDispatchToProps = {
  updatePageNum: ACTIONS.updatePageNum,
  openEditor: ACTIONS.updateEditorVisible,
  save: ACTIONS.saveCategory,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ComponentList = (props: IProps) => {
  const { loading, components = [], pageInfo, updatePageNum, openEditor, save } = props;

  const { applicationId } = useParams<{ applicationId: string }>();

  // i18n
  const { locale } = useContext(GlobalContext);
  const { category, global, store } = locale.business;

  const columns = [
    {
      title: global.nameLabel,
      dataIndex: 'name',
      render: (name: string, record: ApplicationSettingBuilderComponent) => (
        <>
          <span>{name}</span>
          {record?.status && (
            <Tag color="cyan" style={{ margin: '0 0 0 4px' }}>
              Live
            </Tag>
          )}
        </>
      ),
    },
    {
      title: category.label,
      dataIndex: 'label',
      render: (_text: string, record: ApplicationSettingBuilderComponent) => (
        <span>{record.category?.name}</span>
      ),
    },
    {
      title: category.category,
      dataIndex: 'groupText',
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
      render: (_sort: string, record: ApplicationSettingBuilderComponent) => {
        const { sort = 0 } = record.category || {};
        return <span>{sort}</span>;
      },
    },
    {
      title: global.actions,
      key: '',
      width: 130,
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
            okText={global.yes}
            title={record?.status ? store.revokeTitle : store.commitTitle}
            onConfirm={() => handleCommitRevoke(record.category, record.id, record.name, record.status)}>
            <Button
              type="default"
              size="small"
              shape="circle"
              title={record?.status ? store.revoke : store.commit}
              onClick={() => openEditor(true, record)}
              style={{ marginLeft: 8 }}>
              {record?.status ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const handleCommitRevoke = (category: ComponentCategory, id: string, name: string, status: boolean) => {
    save({
      applicationId,
      type: 'component',
      setting: [
        {
          category,
          id,
          name,
          status: !status,
        },
      ],
    });
  };

  return (
    <Table
      rowKey="id"
      dataSource={components}
      columns={columns}
      loading={loading}
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
      onChange={(pagination) => {
        updatePageNum(pagination.current || pageInfo.size);
      }}
    />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ComponentList);
