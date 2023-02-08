import React, { useCallback, useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import { Button, Popconfirm, Space, Table, Tabs, Tag } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/packages/detail';
import { StoreGoodsPurchaseType } from '@/constants/index';
import { GlobalContext } from '@/pages/system';
import { ComponentVersionEntity, Creator } from '@/types/index';
import { getLocationIfo, periodFormat } from '@/utils/index';

const { TabPane } = Tabs;

const mapStateToProps = (store: RootState) => ({
  applicationId: store.applications.detail.settings.app.applicationId,
  componentInfo: store.applications.detail.packages.detail.componentInfo,
  loading: store.applications.detail.packages.detail.versionList.loading,
  versions: store.applications.detail.packages.detail.versionList.versions,
  pageInfo: store.applications.detail.packages.detail.versionList.pageInfo,
  fileDetail: store.applications.detail.packages.detail.fileDetail,
  dependencies: store.applications.detail.packages.detail.depList,
});

const mapDispatchToProps = {
  updateVersionListState: ACTIONS.updateVersionListState,
  fetchVersionList: ACTIONS.fetchComponentVersionsAction,
  updateVersionStatus: ACTIONS.updateComponentVersionStatusAction,
  liveVersion: ACTIONS.liveComponentVersionAction,
  editVersion: ACTIONS.updateVersionDrawerState,
  viewVersion: ACTIONS.updateVersionDrawerState,
  fetchComponentDeps: ACTIONS.fetchComponentUsed,
};

type ComponentDetailListType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const VersionList: React.FC<ComponentDetailListType> = (props) => {
  const {
    applicationId,
    componentInfo,
    loading,
    versions,
    pageInfo,
    fileDetail,
    dependencies,
    updateVersionListState,
    fetchVersionList,
    updateVersionStatus,
    liveVersion,
    editVersion,
    viewVersion,
    fetchComponentDeps,
  } = props;
  const [type, setType] = useState('versions');

  // url params
  const history = useHistory();
  const { fileId } = getLocationIfo(useLocation());

  // i18n
  const { locale } = useContext(GlobalContext);
  const {
    global,
    content: contentI18n,
    file: fileI18n,
    history: historyI18n,
    package: packageI18n,
    version,
  } = locale.business;

  useEffect(() => {
    if (applicationId && fileId) {
      updateVersionListState({
        applicationId,
        fileId,
      });
    }
  }, [applicationId, fileId]);

  useEffect(() => {
    if (applicationId) {
      if (type === 'dependency') {
        fetchComponentDeps();
      } else {
        fetchVersionList({});
      }
    }
  }, [type, applicationId]);

  const onClickPublish = useCallback(
    (id) => {
      if (applicationId)
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
      if (applicationId)
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
          open: true,
          type: 'edit',
          data: {
            versionId: id,
          },
        });
      } else {
        viewVersion({
          open: true,
          type: 'view',
          data: {
            versionId: id,
          },
        });
      }
    },
    [viewVersion, editVersion],
  );

  const handleDepsView = useCallback((item) => {
    const { applicationId, content, file, folder } = item;

    history.push({
      pathname: '/builder',
      search: `?applicationId=${applicationId}&folderId=${folder.id}&fileId=${file.id}&contentId=${content.id}`,
      state: { backPathname: history.location.pathname, backSearch: history.location.search },
    });
  }, []);

  const columns = [
    {
      title: version.name,
      dataIndex: 'version',
      key: 'version',
      render: (version: string, record: ComponentVersionEntity) => {
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
      title: global.creator,
      dataIndex: 'creator',
      key: 'creator',
      render: (creator: Creator) => {
        return creator ? creator.account : '--';
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
      title: version.status,
      dataIndex: 'status',
      key: 'status',
      width: 100,
    },
    {
      title: global.actions,
      key: 'action',
      align: 'center' as never,
      width: 200,
      render: (record: ComponentVersionEntity) => {
        const isRefer = fileDetail?.tags?.find((item) => item.type === StoreGoodsPurchaseType.reference);
        const actionList: JSX.Element[] = [];
        if (isRefer) {
          actionList.push(
            <Button
              type="link"
              title="View"
              size="small"
              onClick={() => onClickViewOrEdit('view', record.id)}>
              {global.view}
            </Button>,
          );
        } else {
          if (record.status === 'base') {
            actionList.push(
              <Button
                type="link"
                title={global.edit}
                size="small"
                onClick={() => onClickViewOrEdit('edit', record.id)}>
                {global.edit}
              </Button>,
            );
          } else {
            actionList.push(
              <Button
                type="link"
                title={global.edit}
                size="small"
                onClick={() => onClickViewOrEdit('edit', record.id)}>
                {global.edit}
              </Button>,
            );
          }
          if (record.status === 'release') {
            if (!record.isLiveVersion) {
              actionList.push(
                <Popconfirm
                  title={packageI18n.setVersionLiveTip}
                  arrowPointAtCenter
                  onConfirm={() => {
                    onClickLive(componentInfo.id, record.versionNumber);
                  }}>
                  <Button type="link" title="Live" size="small">
                    {version.live}
                  </Button>
                </Popconfirm>,
              );
            }
          } else {
            actionList.push(
              <Button type="link" size="small" title="Publish" onClick={() => onClickPublish(record.id)}>
                {record.status === 'discard' ? version.republish : version.publish}
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

  const depColumns = [
    {
      title: fileI18n.id,
      dataIndex: 'fileId',
      key: 'fileId',
      width: 200,
      render: (_, record) => record?.file?.id || '',
    },
    {
      title: fileI18n.nameLabel,
      dataIndex: 'fileName',
      key: 'fileName',
      render: (_, record) => record?.file?.name || '',
    },
    {
      title: contentI18n.id,
      dataIndex: 'contentId',
      key: 'contentId',
      width: 200,
      render: (_, record) => record?.content?.id || '',
    },
    {
      title: contentI18n.nameLabel,
      dataIndex: 'contentName',
      key: 'contentName',
      render: (_, record) => record?.content?.name || '',
    },
    {
      title: global.creator,
      dataIndex: 'creator',
      key: 'creator',
      render: (_, record) => record?.content?.creator?.account || '',
    },
    {
      title: global.updateTime,
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 200,
      render: (_, record) => periodFormat(record?.content?.updateTime || '', 'unknown'),
    },
    {
      title: global.actions,
      dataIndex: 'actions',
      key: 'actions',
      width: 80,
      align: 'center' as never,
      render: (_, record) => (
        <Button type="link" onClick={() => handleDepsView(record)}>
          {historyI18n.view}
        </Button>
      ),
    },
  ];

  return (
    <Tabs defaultActiveKey="versions" onChange={setType} style={{ marginTop: 24 }}>
      <TabPane tab={global.versions} key="versions">
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
      {componentInfo?.type === 'component' && (
        <TabPane tab={version.dependency} key="dependency">
          <Table
            dataSource={dependencies}
            columns={depColumns}
            loading={loading}
            rowKey={(record) => record.content.id}
            pagination={
              pageInfo.total > pageInfo.size
                ? { current: pageInfo.page, pageSize: pageInfo.size, total: pageInfo.total }
                : false
            }
          />
        </TabPane>
      )}
    </Tabs>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(VersionList);
