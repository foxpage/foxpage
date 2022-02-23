import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { Link , useParams } from 'react-router-dom';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Table, Tag } from 'antd';
import { RootState } from 'typesafe-actions';

import { StoreBuyGoodsType } from '@/constants/store';
import { DeleteButton } from '@/pages/common';
import { suffixTagColor } from '@/pages/common/constant/FileType';
import GlobalContext from '@/pages/GlobalContext';
import * as ACTIONS from '@/store/actions/group/application/packages/list';
import { AppComponentType, ApplicationUrlParams } from '@/types/index';
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
  const { applicationId, organizationId } = useParams<ApplicationUrlParams>();
  const { locale } = useContext(GlobalContext);
  const { global, package: packageI18n } = locale.business;
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
      title: global.creator,
      dataIndex: 'creator',
      key: 'creator',
      render: (creator: AppComponentType['creator']) => {
        return creator?.account || '--';
      },
    },
    {
      title: global.type,
      dataIndex: 'type',
      key: 'type',
      render: (text: string) => {
        return <Tag color={suffixTagColor[text]}>{packageI18n[text]}</Tag>;
      },
    },
    {
      title: global.updateTime,
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 200,
      render: (text: string) => periodFormat(text, 'unknown'),
    },
    {
      title: global.actions,
      key: 'actions',
      width: 120,
      render: (record: AppComponentType) => {
        const { id } = record;
        return (
          <React.Fragment>
            <Popconfirm
              title={`${global.deleteMsg}${record.name}?`}
              onConfirm={() => {
                deleteComponent({
                  applicationId,
                  id,
                });
              }}
              okText="Yes"
              cancelText="No"
            >
              <DeleteButton
                type="default"
                size="small"
                shape="circle"
                title={global.remove}
                style={{ marginLeft: 8 }}
              />
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
