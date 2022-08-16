import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Table, Tag } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/settings/builder/page';
import { StoreGoodsPurchaseType } from '@/constants/store';
import { GlobalContext } from '@/pages/system';
import { ApplicationSettingBuilderComponent } from '@/types/index';

const mapStateToProps = (store: RootState) => ({
  loading: store.applications.detail.settings.builder.pages.loading,
  pages: store.applications.detail.settings.builder.pages.pages,
  pageInfo: store.applications.detail.settings.builder.pages.pageInfo,
});

const mapDispatchToProps = {
  save: ACTIONS.saveCategory,
  updatePageNum: ACTIONS.updatePageNum,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ComponentList = (props: IProps) => {
  const { loading, pages = [], pageInfo, save, updatePageNum } = props;

  const { applicationId } = useParams<{ applicationId: string }>();

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, store } = locale.business;

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
      title: global.idLabel,
      dataIndex: 'id',
    },
    {
      title: global.type,
      dataIndex: 'delivery',
      render: (delivery: string) =>
        delivery === StoreGoodsPurchaseType.clone ? (
          <Tag color="blue">{store.clone}</Tag>
        ) : (
          <Tag color="green">{store.refer}</Tag>
        ),
    },
    {
      title: global.actions,
      key: '',
      width: 100,
      render: (_text: string, record: ApplicationSettingBuilderComponent) => (
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
            title={record?.status ? store.revoke : store.commit}
            style={{ marginLeft: 8 }}>
            {record?.status ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const handleCommitRevoke = (template) => {
    save({
      applicationId,
      type: 'page',
      setting: [
        {
          category: template.category,
          id: template.id,
          name: template.name || '',
          status: !template.status,
        },
      ],
    });
  };

  return (
    <Table
      rowKey="id"
      dataSource={pages}
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
