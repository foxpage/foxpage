import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';

import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Space, Steps as AntdSteps, Switch, Table, Tabs, Tag } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/packages/detail';
import { ComponentTagType, StoreGoodsPurchaseType } from '@/constants/index';
import { GlobalContext } from '@/pages/system';
import { ComponentVersionEntity, Creator } from '@/types/index';
import { formatter, getLocationIfo, periodFormat } from '@/utils/index';

const PAGE = 1;
const SIZE = 10;

const { TabPane } = Tabs;

const Container = styled.div`
  position: relative;
`;

const SwitchBox = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  line-height: 46px;
  display: flex;
  align-items: center;
`;

const Label = styled.span`
  font-size: 14px;
  margin-right: 8px;
`;

const Steps = styled(AntdSteps)`
  .ant-steps-item-icon {
    transform: scale(0.8);
  }
`;

const StepTitle = styled.span`
  font-size: 14px;
  color: #8b8e92;
`;

const mapStateToProps = (store: RootState) => ({
  applicationId: store.applications.detail.settings.app.applicationId,
  componentInfo: store.applications.detail.packages.detail.componentInfo,
  loading: store.applications.detail.packages.detail.versionList.loading,
  versions: store.applications.detail.packages.detail.versionList.versions,
  pageInfo: store.applications.detail.packages.detail.versionList.pageInfo,
  fileDetail: store.applications.detail.packages.detail.fileDetail,
  dependencies: store.applications.detail.packages.detail.depList.list,
});

const mapDispatchToProps = {
  updateVersionListState: ACTIONS.updateVersionListState,
  fetchVersionList: ACTIONS.fetchComponentVersionsAction,
  updateVersionStatus: ACTIONS.updateComponentVersionStatusAction,
  liveVersion: ACTIONS.liveComponentVersionAction,
  referLiveVersion: ACTIONS.referLiveComponentVersionAction,
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
    referLiveVersion,
    editVersion,
    viewVersion,
    fetchComponentDeps,
  } = props;
  const [type, setType] = useState('versions');
  const [live, setLive] = useState(false);

  // url params
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

  const isRefer = fileDetail?.tags?.find((item) => item.type === StoreGoodsPurchaseType.reference);

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
      if (type === 'dependents') {
        fetchComponentDeps(PAGE, SIZE, live);
      } else {
        fetchVersionList({});
      }
    }
  }, [type, live, applicationId]);

  const disabled = useMemo(() => {
    let disabled = false;

    const tags = fileDetail.tags;
    const isDisabled = tags && tags.find((tag) => tag?.type === ComponentTagType.deprecated && tag?.status);
    if (isDisabled) disabled = true;

    return disabled;
  }, [fileDetail.tags]);

  const handleTabChange = (type) => {
    const pageInfo = { total: 0, page: 1, size: 10 };
    // reset pageInfo
    updateVersionListState({
      pageInfo,
    });

    setType(type);
  };

  const onClickPublish = useCallback(
    (id: string, status: 'canary' | 'release') => {
      if (applicationId)
        updateVersionStatus({
          applicationId,
          id,
          status,
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

  const onClickReferLive = useCallback(
    (id, versionId) => {
      if (applicationId)
        referLiveVersion({
          applicationId,
          id,
          versionId,
        });
    },
    [applicationId, referLiveVersion],
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
    const { applicationId, content, file, folder, version } = item;
    const url = version?.isLive
      ? `/#/builder?applicationId=${applicationId}&folderId=${folder.id}&fileId=${file.id}&contentId=${content.id}`
      : `/#/preview?applicationId=${applicationId}&folderId=${folder.id}&fileId=${file.id}&contentId=${content.id}&versionId=${version.id}`;

    window.open(url);
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
      title: isRefer ? version.publishStatus : version.publishStage,
      key: 'status',
      width: 200,
      render(record: ComponentVersionEntity) {
        const status = record.status;
        const activatedIdx = ['base', 'canary', 'release'].findIndex((el) => el === record.status) + 1;

        if (isRefer) return status;

        return (
          <Steps size="small" labelPlacement="vertical" current={activatedIdx}>
            <Steps.Step title={<StepTitle>{version.base}</StepTitle>} />
            <Steps.Step
              title={<StepTitle>{version.canary}</StepTitle>}
              subTitle={
                status === 'base' && (
                  <Button
                    size="small"
                    type="primary"
                    style={{ marginTop: 8 }}
                    className="scale-90"
                    onClick={() => onClickPublish(record.id, 'canary')}>
                    {version.publish}
                  </Button>
                )
              }
            />
            <Steps.Step
              title={<StepTitle>{version.release}</StepTitle>}
              subTitle={
                ['canary'].includes(status) && (
                  <Button
                    size="small"
                    type="primary"
                    className="scale-90"
                    disabled={status === 'release'}
                    style={{ marginTop: 8 }}
                    onClick={() => onClickPublish(record.id, 'release')}>
                    {version.publish}
                  </Button>
                )
              }
            />
          </Steps>
        );
      },
    },
    {
      title: global.actions,
      key: 'action',
      align: 'center' as never,
      width: 200,
      render: (record: ComponentVersionEntity) => {
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
          if (record.status === 'release' && !record.isLiveVersion) {
            actionList.push(
              <Popconfirm
                title={packageI18n.setVersionLiveTip}
                disabled={disabled}
                arrowPointAtCenter
                onConfirm={() => {
                  onClickReferLive(fileDetail.id, record.id);
                }}>
                <Button type="link" title="Live" size="small" disabled={disabled}>
                  {version.live}
                </Button>
              </Popconfirm>,
            );
          }
        } else {
          actionList.push(
            <Button
              type="link"
              size="small"
              disabled={disabled}
              title={global.edit}
              onClick={() => onClickViewOrEdit('edit', record.id)}>
              {global.edit}
            </Button>,
          );
          const liveDisabled = record.status !== 'release' || record.isLiveVersion;
          actionList.push(
            <Popconfirm
              title={packageI18n.setVersionLiveTip}
              disabled={liveDisabled}
              arrowPointAtCenter
              onConfirm={() => {
                onClickLive(componentInfo.id, record.versionNumber);
              }}>
                <Button type="link" size="small" disabled={liveDisabled}>
                  {version.live}
                </Button>
            </Popconfirm>
          );
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
      width: 100,
      render: (_, record) => (
        <Link
          to={{
            pathname: `/applications/${record.applicationId}/projects/content/content`,
            search: `?applicationId=${record.applicationId}&fileId=${record?.file?.id}&filePage=`,
          }}>
          <span style={{ wordBreak: 'break-all' }}>{record?.file?.name || ''}</span>
        </Link>
      ),
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
      width: 290,
      render: (_, record) => (
        <Link
          to={{
            pathname: `/applications/${record.applicationId}/projects/content/content`,
            search: `?applicationId=${record.applicationId}&fileId=${record?.file?.id}&filePage=`,
          }}>
          <span style={{ wordBreak: 'break-all' }}>{record?.content?.name || ''}</span>
        </Link>
      ),
    },
    {
      title: global.creator,
      dataIndex: 'creator',
      key: 'creator',
      render: (_, record) => record?.content?.creator?.account || '',
    },
    {
      title: version.name,
      dataIndex: 'version',
      key: 'version',
      render: (_, record) => (
        <Tag color="orange" style={{ width: 40, textAlign: 'center' }}>
          {formatter(record?.version?.versionNumber || '')}
        </Tag>
      ),
    },
    {
      title: version.isHistoricalVersion,
      dataIndex: 'isLive',
      key: 'isLive',
      render: (_, record) => (
        <Tag color={record?.version?.isLive ? 'red' : 'green'}>
          {global[record?.version?.isLive ? 'no' : 'yes']}
        </Tag>
      ),
    },
    {
      title: global.updateTime,
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 200,
      render: (_, record) => periodFormat(record?.version?.updateTime || '', 'unknown'),
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
    <Container>
      <Tabs defaultActiveKey="versions" onChange={handleTabChange} style={{ marginTop: 24 }}>
        <TabPane tab={global.versions} key="versions">
          <Table
            dataSource={versions}
            columns={columns}
            loading={loading}
            rowKey="id"
            pagination={
              pageInfo.total > pageInfo.size
                ? {
                    current: pageInfo.page,
                    pageSize: pageInfo.size,
                    total: pageInfo.total,
                    position: ['bottomCenter'],
                  }
                : false
            }
            onChange={(pagination) => {
              fetchVersionList({ page: pagination.current, size: pagination.pageSize });
            }}
          />
        </TabPane>
        {componentInfo?.type === 'component' && (
          <TabPane tab={version.dependents} key="dependents">
            <Table
              dataSource={dependencies}
              columns={depColumns}
              loading={loading}
              rowKey={(record) => record.content.id}
              pagination={
                pageInfo.total > pageInfo.size
                  ? {
                      current: pageInfo.page,
                      pageSize: pageInfo.size,
                      total: pageInfo.total,
                      position: ['bottomCenter'],
                    }
                  : false
              }
              onChange={(pagination) => {
                fetchComponentDeps(pagination.current, pagination.pageSize, live);
              }}
            />
          </TabPane>
        )}
      </Tabs>
      {type === 'dependents' && (
        <SwitchBox>
          <Label>{version.filterHistoricalVersion}</Label>
          <Switch
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            checked={live}
            onChange={setLive}
          />
        </SwitchBox>
      )}
    </Container>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(VersionList);
