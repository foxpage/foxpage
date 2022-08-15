import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { ArrowDownOutlined, ArrowUpOutlined, CloudSyncOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/packages/detail';
import * as PROJECT_ACTIONS from '@/actions/projects/content';
import { clearResourcesCache } from '@/apis/application';
import { FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { FileType, StoreGoodsPurchaseType } from '@/constants/index';
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
    commitFileToStore,
    offlineFileFromStore,
  } = props;
  const { id = '', type, online } = componentInfo;

  // url params
  const { fileId, name: componentName } = getLocationIfo(useLocation());

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, application, store, version } = locale.business;

  const isRefer = fileDetail?.tags?.find((item) => item.type === StoreGoodsPurchaseType.reference);

  useEffect(() => {
    clearResourcesCache();

    return () => {
      clearAll();
    };
  }, []);

  useEffect(() => {
    if (applicationId && fileId) fetchFileDetail({ applicationId, ids: [fileId] });
  }, [applicationId]);

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

  return (
    <>
      <FoxPageContent
        breadcrumb={
          <FoxPageBreadcrumb
            breadCrumb={[
              { name: application.applicationList, link: '/#/workspace/applications' },
              {
                name: global.packages,
                link: `/#/applications/${applicationId}/packages/list`,
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
                    {online ? (
                      <Button type="default" style={{ marginRight: 8 }} onClick={handleRevoke}>
                        <ArrowDownOutlined />
                        {store.revoke}
                      </Button>
                    ) : (
                      <Button type="default" style={{ marginRight: 8 }} onClick={handleCommit}>
                        <ArrowUpOutlined />
                        {store.commit}
                      </Button>
                    )}
                  </>
                )}
                {fileDetail?.type === 'component' && (
                  <Button type="default" style={{ marginRight: 8 }} onClick={() => openCloudSyncDrawer(true)}>
                    <CloudSyncOutlined /> {global.update}
                  </Button>
                )}

                <Button type="primary" disabled={!id} onClick={() => addVersion({ open: true, type: 'add' })}>
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
