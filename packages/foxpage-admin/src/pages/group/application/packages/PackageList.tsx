import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, useParams } from 'react-router-dom';

import { ArrowUpOutlined, PlusOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Table, Tag, Tooltip } from 'antd';
import { RootState } from 'typesafe-actions';

import { StoreBuyGoodsType } from '@/constants/store';
import { DeleteButton } from '@/pages/common';
import { suffixTagColor } from '@/pages/common/constant/FileType';
import GlobalContext from '@/pages/GlobalContext';
import * as ACTIONS from '@/store/actions/group/application/packages/list';
import { fetchResourcesGroupsAction } from '@/store/actions/group/application/resource/groups';
import { AppComponentType, ApplicationUrlParams, ResourceGroup } from '@/types/index';
import periodFormat from '@/utils/period-format';

const getGroup = (tags: AppComponentType['tags'], groups: ResourceGroup[]) => {
  return groups.find(
    (item) => tags.findIndex((tag) => tag.type === 'resourceGroup' && item.id === tag.resourceGroupId) > -1,
  );
};

const mapStateToProps = (store: RootState) => ({
  organizationId: store.system.organizationId,
  groups: store.group.application.resource.groups.groupList,
  loading: store.group.application.packages.list.loading,
  pageInfo: store.group.application.packages.list.pageInfo,
  componentList: store.group.application.packages.list.componentList,
  selectPackage: store.group.application.packages.list.selectPackage,
});

const mapDispatchToProps = {
  deleteComponent: ACTIONS.deleteComponentAction,
  openDrawer: () => ACTIONS.updateComponentDrawerState({ open: true, type: 'add' }),
  fetchGroups: fetchResourcesGroupsAction,
};

type ProjectListProp = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {
    openQuicklyModal?: (status: boolean) => void;
  };

const PackageList: React.FC<ProjectListProp> = (props) => {
  const {
    organizationId,
    loading = false,
    pageInfo = { page: 1, size: 10, total: 1 },
    componentList,
    selectPackage,
    deleteComponent,
    openDrawer,
    openQuicklyModal,
    groups,
    fetchGroups,
  } = props;
  const { applicationId } = useParams<ApplicationUrlParams>();
  const { locale } = useContext(GlobalContext);
  const { global, package: packageI18n, resource } = locale.business;

  useEffect(() => {
    if (applicationId) {
      fetchGroups({
        appId: applicationId,
      });
    }
  }, [applicationId]);

  const columns = [
    {
      title: global.nameLabel,
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: AppComponentType) => {
        return (
          <>
            <Link
              to={`/organization/${organizationId}/application/${applicationId}/detail/packages/${
                record.id
              }/detail?name=${encodeURIComponent(record.name)}`}
              style={{ paddingRight: 8 }}>
              {text}
            </Link>
            {record.tags?.find((item) => item.type === StoreBuyGoodsType.reference) && (
              <Tag color={suffixTagColor.refer} style={{ marginLeft: 4, zoom: 0.8 }}>
                refer
              </Tag>
            )}
            {record.online && (
              <Tag color="cyan" style={{ marginLeft: 4, zoom: 0.8 }}>
                inStore
              </Tag>
            )}
          </>
        );
      },
    },
    {
      title: global.liveVersion,
      dataIndex: 'release',
      key: 'release',
      render: (release: string, record: AppComponentType) => {
        return (
          <>
            {release ? <Tag color="orange">{release}</Tag> : '- '}
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
      render: (tags: AppComponentType['tags']) => {
        const group = getGroup(tags, groups);
        return group ? group.name : '-';
      },
    },
    {
      title: global.creator,
      dataIndex: 'creator',
      key: 'creator',
      render: (creator: AppComponentType['creator']) => {
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
      width: 60,
      render: (record: AppComponentType) => {
        const { id, release } = record;
        return (
          <Popconfirm
            title={`${global.deleteMsg}${record.name}?`}
            onConfirm={() => {
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
        );
      },
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
        {selectPackage === 'component' && (
          <Button
            type="primary"
            onClick={() => (openQuicklyModal ? openQuicklyModal(true) : null)}
            style={{ marginRight: 8 }}>
            <ThunderboltOutlined /> {packageI18n.quickly}
          </Button>
        )}

        <Button type="primary" onClick={openDrawer}>
          <PlusOutlined /> {packageI18n[selectPackage] || packageI18n.component}
        </Button>
      </div>
      <Table
        dataSource={componentList}
        columns={columns}
        loading={loading}
        rowKey="id"
        pagination={
          pageInfo.total > pageInfo.size
            ? { current: pageInfo.page, pageSize: pageInfo.size, total: pageInfo.total }
            : false
        }
      />
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(PackageList);
