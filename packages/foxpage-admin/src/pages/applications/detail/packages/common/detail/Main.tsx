import React, { useContext, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CheckCircleOutlined,
  CloudSyncOutlined,
  PlusOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { Button, Modal, Tooltip } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/packages/detail';
import * as PROJECT_ACTIONS from '@/actions/projects/content';
import { clearResourcesCache } from '@/apis/application';
import { FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { ComponentTagType, FileType, StoreGoodsPurchaseType } from '@/constants/index';
import { GlobalContext } from '@/pages/system';
import { getLocationIfo } from '@/utils/location-info';

import { CloudSyncDrawer, Header, List, VersionEditDrawer } from './components/index';

const mapStateToProps = (store: RootState) => ({
  applicationId: store.applications.detail.settings.app.applicationId,
  componentInfo: store.applications.detail.packages.detail.componentInfo,
  fileDetail: store.applications.detail.packages.detail.fileDetail,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  addVersion: ACTIONS.updateVersionDrawerState,
  openCloudSyncDrawer: ACTIONS.updateCloudSyncDrawerOpenStatus,
  updateComponentOnlineStatus: ACTIONS.updateComponentOnlineStatus,
  fetchFileDetail: ACTIONS.fetchFileDetail,
  disabledComponent: ACTIONS.saveComponentDisabled,
  commitFileToStore: PROJECT_ACTIONS.commitFileToStore,
  offlineFileFromStore: PROJECT_ACTIONS.offlineFileFromStore,
};

type ComponentDetailProp = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ComponentDetail: React.FC<ComponentDetailProp> = (props) => {
  const {
    applicationId,
    componentInfo,
    fileDetail,
    clearAll,
    addVersion,
    openCloudSyncDrawer,
    updateComponentOnlineStatus,
    fetchFileDetail,
    disabledComponent,
    commitFileToStore,
    offlineFileFromStore,
  } = props;
  const { id = '', type, online } = componentInfo;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { file: fileI18n, global, package: packageI18n, store, version } = locale.business;

  const isRefer = fileDetail?.tags?.find((item) => item.type === StoreGoodsPurchaseType.reference);

  // url params
  const location = useLocation();
  const { fileId, filePage, fileSearch, name: componentName } = getLocationIfo(location);
  const cType = useMemo(() => {
    const pathName = location?.pathname || '';
    return pathName && pathName.substring(pathName.indexOf('package/') + 8, pathName.indexOf('/detail') - 1);
  }, [location]);

  useEffect(() => {
    clearResourcesCache();

    return () => {
      clearAll();
    };
  }, []);

  useEffect(() => {
    if (applicationId && fileId) fetchFileDetail({ applicationId, ids: [fileId] });
  }, [applicationId]);

  const loadOnIgnite = useMemo(() => {
    let loadOnIgnite = false;

    const tags = fileDetail.tags;
    const isLoad = tags && tags.find((tag) => tag?.type === ComponentTagType.loadOnIgnite && tag?.status);
    if (isLoad) loadOnIgnite = true;

    return loadOnIgnite;
  }, [fileDetail.tags]);

  const disabled = useMemo(() => {
    let disabled = false;

    if (fileDetail.deprecated) disabled = true;

    return disabled;
  }, [fileDetail.deprecated]);

  const handleCommit = () => {
    Modal.confirm({
      title: store.commitTitle,
      content: store.commitMsg,
      onOk: () => {
        if (applicationId && fileId)
          commitFileToStore(
            {
              id: fileId,
              applicationId,
              type: FileType.package,
            },
            () => {
              updateComponentOnlineStatus(true);
            },
          );
      },
      okText: global.yes,
      cancelText: global.no,
    });
  };

  const handleRevoke = () => {
    Modal.confirm({
      title: store.revokeTitle,
      content: store.revokeMsg,
      onOk: () => {
        if (applicationId && fileId)
          offlineFileFromStore(
            {
              id: fileId,
              applicationId,
            },
            () => {
              updateComponentOnlineStatus(false);
            },
          );
      },
      okText: global.yes,
      cancelText: global.no,
    });
  };

  const handleLiveDisabled = () => {
    Modal.confirm({
      title: disabled ? packageI18n.liveTitle : packageI18n.disabledTitle,
      content: disabled ? packageI18n.liveMsg : packageI18n.disabledMsg,
      onOk: () => {
        if (applicationId && fileId)
          disabledComponent(
            {
              applicationId,
              id: fileId,
              status: !disabled,
            },
            () => {
              // refresh file detail
              fetchFileDetail({ applicationId, ids: [fileId] });
            },
          );
      },
      okText: global.yes,
      cancelText: global.no,
    });
  };

  return (
    <>
      <FoxPageContent
        breadcrumb={
          <FoxPageBreadcrumb
            breadCrumb={[
              {
                name: cType === 'editor' ? packageI18n.editor : packageI18n.component,
                link: `/applications/${applicationId}/package/${cType}s/list?page=${
                  filePage || ''
                }&searchText=${fileSearch || ''}`,
              },
              { name: componentName },
            ]}
          />
        }>
        <>
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
            {!isRefer && (
              <>
                {(type === 'component' || type === 'systemComponent') && (
                  <>
                    <Tooltip
                      title={
                        componentInfo.online
                          ? fileI18n.fileCommitToStoreTips
                          : loadOnIgnite
                          ? packageI18n.disabledTips
                          : ''
                      }>
                      <Button
                        type={disabled ? 'primary' : 'ghost'}
                        danger={!disabled}
                        disabled={loadOnIgnite || componentInfo.online}
                        onClick={handleLiveDisabled}
                        style={{ marginRight: 8 }}>
                        {disabled ? <CheckCircleOutlined /> : <StopOutlined />}
                        {disabled ? version.live : packageI18n.disabled}
                      </Button>
                    </Tooltip>
                    {online ? (
                      <Button
                        type="default"
                        disabled={disabled}
                        onClick={handleRevoke}
                        style={{ marginRight: 8 }}>
                        <ArrowDownOutlined />
                        {store.revoke}
                      </Button>
                    ) : (
                      <Button
                        type="default"
                        disabled={disabled}
                        onClick={handleCommit}
                        style={{ marginRight: 8 }}>
                        <ArrowUpOutlined />
                        {store.commit}
                      </Button>
                    )}
                  </>
                )}
                {fileDetail?.type === 'component' && (
                  <Button
                    type="default"
                    disabled={disabled}
                    onClick={() => openCloudSyncDrawer(true)}
                    style={{ marginRight: 8 }}>
                    <CloudSyncOutlined /> {global.update}
                  </Button>
                )}

                <Button
                  type="primary"
                  disabled={disabled || !id}
                  onClick={() => addVersion({ open: true, type: 'add' })}>
                  <PlusOutlined /> {version.add}
                </Button>
              </>
            )}
          </div>
          <Header />
          <List />
        </>
      </FoxPageContent>

      <VersionEditDrawer />
      <CloudSyncDrawer />
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ComponentDetail);
