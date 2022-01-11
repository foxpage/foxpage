import React, { useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { Button, Popconfirm, Space, Table, Tabs, Tag } from 'antd';
import { RootState } from 'typesafe-actions';

import { StoreBuyGoodsType } from '@/constants/store';
import * as ACTIONS from '@/store/actions/group/application/packages/detail';
import { StateType } from '@/store/reducers/group/application/packages/detail';
import { AppComponentVersionType } from '@/types/application';
import { Creator } from '@/types/user';
import periodFormat from '@/utils/period-format';

const { TabPane } = Tabs;

const mapStateToProps = (store: RootState) => ({
  componentInfo: store.group.application.packages.detail.componentInfo,
  loading: store.group.application.packages.detail.versionList?.loading,
  versions: store.group.application.packages.detail.versionList?.versions,
  pageInfo: store.group.application.packages.detail.versionList?.pageInfo,
  fileDetail: store.group.application.packages.detail.fileDetail,
});

const mapDispatchToProps = {
  updateVersionListState: ACTIONS.updateVersionListState,
  fetchVersionList: ACTIONS.fetchComponentVersionsAction,
  updateVersionStatus: ACTIONS.updateComponentVersionStatusAction,
  liveVersion: ACTIONS.liveComponentVersionAction,
  editVersion: (data: Partial<StateType['versionDrawer']['data']>) =>
    ACTIONS.updateVersionDrawerState({
      open: true,
      type: 'edit',
      data: data,
    }),
  viewVersion: (data: Partial<StateType['versionDrawer']['data']>) =>
    ACTIONS.updateVersionDrawerState({
      open: true,
      type: 'view',
      data: data,
    }),
};

type ComponentDetailProp = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const VersionList: React.FC<ComponentDetailProp> = ({
  componentInfo = {},
  loading = false,
  versions = [],
  pageInfo = {
    total: 0,
    page: 1,
    size: 10,
  },
  fileDetail,
  updateVersionListState,
  fetchVersionList,
  updateVersionStatus,
  liveVersion,
  editVersion,
  viewVersion,
}) => {
  const { applicationId, fileId } = useParams<{ applicationId: string; fileId: string }>();
  // const onClickDisable = useCallback(
  //   id => {
  //     updateVersionStatus({
  //       applicationId,
  //       id,
  //       status: 'discard',
  //     });
  //   },
  //   [applicationId, updateVersionStatus],
  // );
  const onClickPublish = useCallback(
    id => {
      updateVersionStatus({
        applicationId,
        id,
        status: 'release',
      });
    },
    [applicationId, updateVersionStatus],
  );
  const onClickLive = useCallback(
    (id, versionNumber) => {
      liveVersion({
        applicationId,
        id,
        versionNumber,
      });
    },
    [applicationId, liveVersion],
  );
  const onClickViewOrEdit = useCallback(
    (type, id) => {
      if (type === 'edit') {
        editVersion({
          versionId: id,
        });
      } else {
        viewVersion({
          versionId: id,
        });
      }
    },
    [viewVersion, editVersion],
  );
  const columns = [
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      render: (version: string, record: AppComponentVersionType) => {
        const { isLiveVersion } = record;
        return (
          <Space wrap={false} size={6}>
            {version}
            {isLiveVersion && (
              <Tag color="cyan" style={{ marginRight: 0 }}>
                Live
              </Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Creator',
      dataIndex: 'creator',
      key: 'creator',
      render: (creator: Creator) => {
        return creator ? creator.account : '--';
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
    },
    {
      title: 'Actions',
      key: 'action',
      align: 'center' as never,
      width: 200,
      render: (record: AppComponentVersionType) => {
        const isRefer = fileDetail?.tags?.find(item => item.type === StoreBuyGoodsType.reference);
        const actionList: JSX.Element[] = [];
        if (isRefer) {
          actionList.push(
            <Button type="link" title="View" size="small" onClick={() => onClickViewOrEdit('view', record.id)}>
              View
            </Button>,
          );
        } else {
          if (record.status === 'base') {
            actionList.push(
              <Button type="link" title="Edit" size="small" onClick={() => onClickViewOrEdit('edit', record.id)}>
                Edit
              </Button>,
            );
          } else {
            actionList.push(
              <Button type="link" title="View" size="small" onClick={() => onClickViewOrEdit('view', record.id)}>
                View
              </Button>,
            );
          }
          if (record.status === 'release') {
            if (!record.isLiveVersion) {
              // actionList.push(
              //   <Button type="link" title="Disable" size="small" danger onClick={() => onClickDisable(record.id)}>
              //     Disable
              //   </Button>,
              // );

              actionList.push(
                <Popconfirm
                  title="Are you sure set this version status to live?"
                  arrowPointAtCenter
                  onConfirm={() => {
                    onClickLive(componentInfo.id, record.versionNumber);
                  }}
                >
                  <Button type="link" title="Live" size="small">
                    Live
                  </Button>
                </Popconfirm>,
              );
            }
          } else {
            actionList.push(
              <Button type="link" size="small" title="Publish" onClick={() => onClickPublish(record.id)}>
                {record.status === 'discard' ? 'RePublish' : 'Publish'}
              </Button>,
            );
          }
        }
        return (
          <Space size={[2, 2]} align="center" wrap>
            {actionList.map((el, index) => (
              <React.Fragment key={index}>{el}</React.Fragment>
            ))}
          </Space>
        );
      },
    },
  ];
  useEffect(() => {
    updateVersionListState({
      applicationId,
      fileId,
    });
    fetchVersionList({});
  }, [applicationId, fileId]);
  return (
    <Tabs defaultActiveKey="versions" style={{ marginTop: 24 }}>
      <TabPane tab="Versions" key="versions">
        <Table
          dataSource={versions}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={
            pageInfo.total > pageInfo.size
              ? { current: pageInfo.page, pageSize: pageInfo.size, total: pageInfo.total }
              : false
          }
        />
      </TabPane>
    </Tabs>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(VersionList);
