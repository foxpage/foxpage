import React from 'react';
import { connect } from 'react-redux';
import { Link , useParams } from 'react-router-dom';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Table, Tag } from 'antd';
import { RootState } from 'typesafe-actions';

import { StoreBuyGoodsType } from '@/constants/store';
import { DeleteButton } from '@/pages/common';
import { suffixTagColor } from '@/pages/common/constant/FileType';
import * as ACTIONS from '@/store/actions/group/application/packages/list';
import { AppComponentType } from '@/types/index';
import periodFormat from '@/utils/period-format';

const mapStateToProps = (store: RootState) => ({
  loading: store.group.application.packages.list.loading,
  pageInfo: store.group.application.packages.list.pageInfo,
  componentList: store.group.application.packages.list.componentList,
  selectPackage: store.group.application.packages.list.selectPackage,
});

const mapDispatchToProps = {
  deleteComponent: ACTIONS.deleteComponentAction,
  openDrawer: () => ACTIONS.updateComponentDrawerState({ open: true, type: 'add' }),
};

type ProjectListProp = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const PackageList: React.FC<ProjectListProp> = props => {
  const {
    loading = false,
    pageInfo = { page: 1, size: 10, total: 1 },
    componentList,
    selectPackage,
    deleteComponent,
    openDrawer,
  } = props;
  const { applicationId, organizationId } = useParams<{ applicationId: string; organizationId: string }>();
  const columns = [
    {
      title: 'name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: AppComponentType) => {
        return (
          <>
            <Link
              to={`/organization/${organizationId}/application/${applicationId}/detail/packages/${
                record.id
              }/detail?name=${encodeURIComponent(record.name)}`}
            >
              {text}
            </Link>
            {record.tags?.find(
              item => item.type === StoreBuyGoodsType.reference || item.type === StoreBuyGoodsType.clone,
            ) && (
              <Tag color={suffixTagColor.refer} style={{ marginLeft: 4 }}>
                refer
              </Tag>
            )}
          </>
        );
      },
    },
    {
      title: 'Creator',
      dataIndex: 'creator',
      key: 'creator',
      render: (creator: AppComponentType['creator']) => {
        return creator?.account || '--';
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (text: string) => {
        return <Tag color={suffixTagColor[text]}>{text}</Tag>;
      },
    },
    {
      title: 'UpdateTime',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 200,
      render: (text: string) => periodFormat(text, 'unknown'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (record: AppComponentType) => {
        const { id } = record;
        return (
          <React.Fragment>
            <Popconfirm
              title={`Are you sure to delete this ${record.type}?`}
              onConfirm={() => {
                deleteComponent({
                  applicationId,
                  id,
                });
              }}
              okText="Yes"
              cancelText="No"
            >
              <DeleteButton type="default" size="small" shape="circle" title="Remove" style={{ marginLeft: 8 }} />
            </Popconfirm>
          </React.Fragment>
        );
      },
    },
  ];
  return (
    <>
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" onClick={openDrawer}>
          <PlusOutlined /> Add{' '}
          {selectPackage ? (selectPackage as string).replace?.(/^\S/, s => s.toUpperCase()) : 'Package'}
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
