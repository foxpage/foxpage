import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { ArrowUpOutlined, PlusOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Button, Input, Popconfirm, Table as AntTable, Tag, Tooltip } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/packages/list';
import * as RESOURCES_ACTIONS from '@/actions/applications/detail/resources/groups';
import { DeleteButton } from '@/components/index';
import { StoreGoodsPurchaseType, suffixTagColor } from '@/constants/index';
import { GlobalContext } from '@/pages/system';
import { ComponentEntity, ResourceGroup } from '@/types/index';
import { periodFormat } from '@/utils/index';

const Table = styled(AntTable)`
  .ant-table-pagination.ant-pagination {
    margin: 16px 0 -8px;
  }
`;

const getGroup = (tags: ComponentEntity['tags'], groups: ResourceGroup[]) => {
  return groups.find(
    (item) => tags.findIndex((tag) => tag.type === 'resourceGroup' && item.id === tag.resourceGroupId) > -1,
  );
};

const mapStateToProps = (store: RootState) => ({
  applicationId: store.applications.detail.settings.app.applicationId,
  groups: store.applications.detail.resources.groups.groupList,
  loading: store.applications.detail.packages.list.loading,
  pageInfo: store.applications.detail.packages.list.pageInfo,
  componentList: store.applications.detail.packages.list.componentList,
  selectPackage: store.applications.detail.packages.list.selectPackage,
});

const mapDispatchToProps = {
  deleteComponent: ACTIONS.deleteComponentAction,
  fetchComponentList: ACTIONS.fetchComponentsAction,
  openDrawer: ACTIONS.updateComponentDrawerState,
  fetchGroups: RESOURCES_ACTIONS.fetchResourcesGroups,
};

type ProjectListProp = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {
    type: string;
    openQuicklyModal?: (status: boolean) => void;
  };

const PackageList: React.FC<ProjectListProp> = (props) => {
  const {
    type,
    applicationId,
    groups,
    loading,
    pageInfo = { page: 1, size: 10, total: 1 },
    componentList,
    selectPackage,
    deleteComponent,
    fetchComponentList,
    fetchGroups,
    openDrawer,
    openQuicklyModal,
  } = props;

  const [inputData, setInputData] = useState({
    inputVal: '',
    searchFlag: false,
  });

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, package: packageI18n, resource } = locale.business;

  useEffect(() => {
    if (applicationId) {
      fetchGroups({
        applicationId,
      });
    }
  }, [applicationId]);

  useEffect(() => {
    setInputData({
      inputVal: '',
      searchFlag: false,
    });
  }, [selectPackage]);

  const onSearch = (value) => {
    setInputData({
      searchFlag: true,
      inputVal: value,
    });
    fetchComponentList({
      applicationId,
      page: 1,
      size: 10,
      search: value.trim(),
    });
  };

  const columns: any = [
    {
      title: global.nameLabel,
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ComponentEntity) => {
        return (
          <>
            {record.tags?.find((item) => item.type === StoreGoodsPurchaseType.reference) && (
              <Tag color={suffixTagColor.refer} style={{ zoom: 0.8 }}>
                refer
              </Tag>
            )}
            {record.online && (
              <Tag color="cyan" style={{ zoom: 0.8 }}>
                inStore
              </Tag>
            )}
            <Link
              to={`/applications/${applicationId}/package/${type}s/detail?fileId=${
                record.id
              }&name=${encodeURIComponent(record.name)}`}
              style={{ paddingRight: 8 }}>
              {text}
            </Link>
          </>
        );
      },
    },
    {
      title: global.liveVersion,
      dataIndex: 'release',
      key: 'release',
      width: 120,
      render: (release: string, record: ComponentEntity) => {
        return (
          <>
            {release ? <Tag color="orange">{release}</Tag> : <Tag>0.0.0</Tag>}
            {record.base && (
              <Tooltip title={global.newVersion}>
                <ArrowUpOutlined style={{ color: '#8adf5e' }} />
              </Tooltip>
            )}
          </>
        );
      },
    },
    {
      title: resource.group,
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      render: (tags: ComponentEntity['tags']) => {
        const group = getGroup(tags, groups as any);
        return group ? group.name : '-';
      },
    },
    {
      title: global.creator,
      dataIndex: 'creator',
      key: 'creator',
      width: 150,
      render: (creator: ComponentEntity['creator']) => {
        return creator?.account || '-';
      },
    },
    {
      title: global.updateTime,
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 180,
      render: (text: string) => periodFormat(text, 'unknown'),
    },
    {
      title: global.actions,
      key: 'actions',
      width: 90,
      render: (record: ComponentEntity) => {
        const { id, release } = record;
        return (
          <>
            <Popconfirm
              title={`${global.deleteMsg}${record.name}?`}
              onConfirm={() => {
                if (applicationId)
                  deleteComponent({
                    applicationId,
                    id,
                  });
              }}
              disabled={!!release}
              okText={global.yes}
              cancelText={global.no}
              placement="topRight">
              <DeleteButton
                type="default"
                size="small"
                shape="circle"
                disabled={!!release}
                title={global.remove}
                style={{ marginLeft: 8 }}
              />
            </Popconfirm>
          </>
        );
      },
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <Input.Search
          allowClear={true}
          placeholder={packageI18n.inputNameTips}
          onSearch={onSearch}
          value={inputData.inputVal}
          onChange={(e) => {
            setInputData({
              inputVal: e.target.value,
              searchFlag: false,
            });
          }}
          style={{ marginRight: 8, width: 250 }}
        />
        {selectPackage === 'component' && (
          <Button
            type="primary"
            onClick={() => (openQuicklyModal ? openQuicklyModal(true) : null)}
            style={{ marginRight: 8 }}>
            <ThunderboltOutlined /> {packageI18n.quickly}
          </Button>
        )}

        <Button type="primary" onClick={() => openDrawer({ open: true, type: 'add' })}>
          <PlusOutlined /> {packageI18n[selectPackage] || packageI18n.component}
        </Button>
      </div>
      <Table
        dataSource={componentList}
        columns={columns}
        loading={loading}
        rowKey="id"
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
          const { inputVal, searchFlag } = inputData;
          fetchComponentList({
            applicationId,
            page: pagination.current || 1,
            size: pagination.pageSize || 10,
            search: searchFlag ? inputVal.trim() : '',
          });
        }}
      />
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(PackageList);
