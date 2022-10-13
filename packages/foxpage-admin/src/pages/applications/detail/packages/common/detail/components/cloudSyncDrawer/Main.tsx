import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { SearchOutlined } from '@ant-design/icons';
import { Button, Col, message, Row, Select, Spin } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/packages/detail';
import * as FAST_ACTIONS from '@/actions/applications/detail/packages/fast';
import * as RESOURCES_ACTIONS from '@/actions/applications/detail/resources/groups';
import { Group, OperationDrawer, Title } from '@/components/index';
import { ResourceTagEnum } from '@/constants/file';
import { GlobalContext } from '@/pages/system';
import { getLocationIfo } from '@/utils/location-info';

import ComponentResource from './components/ComponentResource';

import './style.css';

const { Option } = Select;

const mapStateToProps = (store: RootState) => ({
  applicationId: store.applications.detail.settings.app.applicationId,
  groupList: store.applications.detail.resources.groups.groupList,
  open: store.applications.detail.packages.detail.cloudSyncDrawer.open,
  loading: store.applications.detail.packages.detail.cloudSyncDrawer.loading,
  componentInfo: store.applications.detail.packages.detail.componentInfo,
  fileDetail: store.applications.detail.packages.detail.fileDetail,
  groupLoading: store.applications.detail.packages.fast.loading,
  saving: store.applications.detail.packages.fast.saving,
  lastVersion: store.applications.detail.packages.fast.packages[0]?.lastVersion,
  componentRemote: store.applications.detail.packages.fast.packages[0]?.components[0],
});

const mapDispatchToProps = {
  closeDrawer: ACTIONS.updateCloudSyncDrawerOpenStatus,
  fetchFileDetail: ACTIONS.fetchFileDetail,
  fetchComponentVersionsAction: ACTIONS.fetchComponentVersionsAction,
  fetchComponentRemotes: FAST_ACTIONS.fetchPackages,
  update: FAST_ACTIONS.updateChanges,
  save: FAST_ACTIONS.saveChanges,
  selectGroup: FAST_ACTIONS.selectGroup,
  select: FAST_ACTIONS.updateSelected,
  fetchGroups: RESOURCES_ACTIONS.fetchResourcesGroups,
  updateComponentRemoteInfo: FAST_ACTIONS.updateComponentRemoteInfo
};

type ComponentDetailCloudSyncDrawerType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ComponentCloudSyncDrawer: React.FC<ComponentDetailCloudSyncDrawerType> = (props) => {
  const {
    applicationId,
    open,
    loading,
    groupLoading,
    groupList,
    componentInfo,
    componentRemote,
    fileDetail,
    lastVersion,
    fetchGroups,
    fetchComponentRemotes,
    closeDrawer,
    fetchFileDetail,
    update,
    save,
    selectGroup,
    saving,
    select,
    fetchComponentVersionsAction,
    updateComponentRemoteInfo
  } = props;
  const [groupId, setGroupId] = useState<string>('');

  // url params
  const { fileId } = getLocationIfo(useLocation());

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, version: versionI18n, resource } = locale.business;

  useEffect(() => {
    if (open && applicationId) {
      fetchGroups({
        applicationId,
      });

      if (fileId) fetchFileDetail({ applicationId, ids: [fileId] });
    }
  }, [open, applicationId]);

  useEffect(() => {
    if (componentRemote) {
      const name = componentRemote.resource.name;
      select([name]);
    }
  }, [componentRemote]);

  useEffect(() => {
    const newGroupId =
      fileDetail?.tags?.find((item) => item.type === ResourceTagEnum.ResourceGroup && item.resourceGroupId)
        ?.resourceGroupId || '';
    setGroupId(newGroupId);
    if (newGroupId && open) {
      handleSearch(newGroupId);
    }
  }, [fileDetail?.tags, open]);

  const handleSave = () => {
    if (applicationId)
      save(applicationId, () => {
        closeDrawer(false);
        fetchComponentVersionsAction({});
      });
  };

  const handleSearch = (groupId: string) => {
    if (!groupId) {
      message.warning(resource.groupError);
      return;
    }

    selectGroup(groupId);

    if (applicationId)
      fetchComponentRemotes({
        applicationId,
        groupId,
        name: componentInfo.title,
      });
  };

  return (
    <OperationDrawer
      open={open}
      title={versionI18n.syncTitle}
      onClose={() => closeDrawer(false)}
      width={700}
      destroyOnClose
      actions={
        <Button type="primary" loading={saving} onClick={handleSave}>
          {global.apply}
        </Button>
      }>
      <>
        <Spin spinning={groupLoading || saving}>
          <Group>
            <Row>
              <Col span={2} offset={2} style={{ paddingTop: 5 }}>
                <Title>{resource.group}:</Title>
              </Col>
              <Col span={12}>
                <Select
                  placeholder={resource.group}
                  value={groupId}
                  style={{ width: '100%' }}
                  onChange={(value: string) => {
                    setGroupId(value);
                  }}>
                  {groupList?.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col span={6}>
                <Button
                  type="default"
                  onClick={() => {
                    handleSearch(groupId);
                  }}
                  style={{ marginLeft: 12 }}>
                  <SearchOutlined /> {global.search}
                </Button>
              </Col>
            </Row>
          </Group>
        </Spin>
        <Spin spinning={loading} style={{ minHeight: 100 }}>
          <ComponentResource
            lastVersion={lastVersion}
            componentRemote={componentRemote}
            onChange={(value) => update(componentRemote?.resource.name || '', value)}
            updateComponentRemoteInfo={updateComponentRemoteInfo}
            componentType={fileDetail.componentType}
          />
        </Spin>
      </>
    </OperationDrawer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ComponentCloudSyncDrawer);
