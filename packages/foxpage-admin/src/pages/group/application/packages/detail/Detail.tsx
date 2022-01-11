import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';

import { ArrowDownOutlined, ArrowUpOutlined, CloudSyncOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import { RootState } from 'typesafe-actions';

import { clearResourcesCache } from '@/apis/group/application/resource';
import { FileTypeEnum } from '@/constants/index';
import { StoreBuyGoodsType } from '@/constants/store';
import { FoxpageBreadcrumb } from '@/pages/common';
import * as ACTIONS from '@/store/actions/group/application/packages/detail';
import { commitFileToStore, offlineFileFromStore } from '@/store/actions/group/project/content';
import { FileUrlParams } from '@/types/index';

import CloudSyncDrawer from './CloudSyncDrawer';
import Header from './Header';
import VersionEditDrawer from './VersionEditDrawer';
import VersionList from './VersionList';

const mapStateToProps = (store: RootState) => ({
  componentInfo: store.group.application.packages.detail.componentInfo,
  fileDetail: store.group.application.packages.detail.fileDetail,
});

const mapDispatchToProps = {
  addVersion: () => ACTIONS.updateVersionDrawerState({ open: true, type: 'add' }),
  openCloudSyncDrawer: () => ACTIONS.updateCloudSyncDrawerOpenStatus(true),
  commitFileToStore: commitFileToStore,
  offlineFileFromStore: offlineFileFromStore,
  updateComponentOnlineStatus: ACTIONS.updateComponentOnlineStatus,
  fetchFileDetail: ACTIONS.fetchFileDetail,
};

type ComponentDetailProp = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ComponentDetail: React.FC<ComponentDetailProp> = props => {
  const {
    componentInfo,
    fileDetail,
    addVersion,
    commitFileToStore,
    offlineFileFromStore,
    updateComponentOnlineStatus,
    fetchFileDetail,
    openCloudSyncDrawer,
  } = props;
  const { id = '', type, online } = componentInfo;
  const { applicationId, organizationId, fileId } = useParams<FileUrlParams>();
  const location = useLocation();
  const componentName = new URLSearchParams(location.search).get('name') || 'Component Detail';

  const isRefer = fileDetail?.tags?.find(item => item.type === StoreBuyGoodsType.reference);

  useEffect(() => {
    fetchFileDetail({ applicationId, ids: [fileId] });
    clearResourcesCache();
  }, []);

  const handleCommit = () => {
    Modal.confirm({
      title: 'Are you sure commit?',
      content: 'This file will be sold on the store.',
      onOk: () => {
        commitFileToStore({
          id: fileId,
          applicationId,
          type: FileTypeEnum.package,
          onSuccess: () => {
            updateComponentOnlineStatus(true);
          },
        });
      },
      okText: 'Yes',
      cancelText: 'No',
    });
  };

  const handleRevoke = () => {
    Modal.confirm({
      title: 'Are you sure revoke?',
      content: 'This file will be not sold on the store.',
      onOk: () => {
        offlineFileFromStore({
          id: fileId,
          applicationId,
          onSuccess: () => {
            updateComponentOnlineStatus(false);
          },
        });
      },
      okText: 'Yes',
      cancelText: 'No',
    });
  };

  return (
    <div>
      {/* /organization/:organizationId/application/:applicationId/detail/component/:fileId/detail */}
      <FoxpageBreadcrumb
        breadCrumb={[
          { name: 'Application List', link: `/#/organization/${organizationId}/application/list` },
          {
            name: 'Packages',
            link: `/#/organization/${organizationId}/application/${applicationId}/detail/packages`,
          },
          { name: componentName },
        ]}
      />
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
        {!isRefer && (
          <>
            {type === 'component' && (
              <>
                {online ? (
                  <Button type="default" title="Revoke To Store" style={{ marginRight: 8 }} onClick={handleRevoke}>
                    <ArrowDownOutlined />
                    Revoke
                  </Button>
                ) : (
                  <Button type="default" title="Commit To Store" style={{ marginRight: 8 }} onClick={handleCommit}>
                    <ArrowUpOutlined />
                    Commit
                  </Button>
                )}
              </>
            )}
            <Button type="default" style={{ marginRight: 8 }} onClick={openCloudSyncDrawer}>
              <CloudSyncOutlined /> Update
            </Button>
            <Button type="primary" disabled={!id} onClick={addVersion}>
              <PlusOutlined /> New Version
            </Button>
          </>
        )}
      </div>
      <Header />
      <VersionList />
      <VersionEditDrawer />
      <CloudSyncDrawer />
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ComponentDetail);
