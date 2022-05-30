import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { SearchOutlined } from '@ant-design/icons';
import { Button, Col, message, Row, Select, Spin } from 'antd';
import _ from 'lodash';
import { RootState } from 'typesafe-actions';

import OperationDrawer from '@/components/business/OperationDrawer';
import { Group, Title } from '@/components/widgets';
import { FileTagType } from '@/constants/file';
import GlobalContext from '@/pages/GlobalContext';
import * as ACTIONS from '@/store/actions/group/application/packages/detail';
import * as FAST_ACTIONS from '@/store/actions/group/application/packages/fast';
import { fetchResourcesGroupsAction } from '@/store/actions/group/application/resource/groups';
import { FileUrlParams } from '@/types/application';

import ComponentResource from './ComponentResource';

import './style.css';

const { Option } = Select;

const mapStateToProps = (store: RootState) => ({
  open: store.group.application.packages.detail.cloudSyncDrawer.open,
  loading: store.group.application.packages.detail.cloudSyncDrawer.loading,
  groupList: store.group.application.resource.groups.groupList,
  componentInfo: store.group.application.packages.detail.componentInfo,
  fileDetail: store.group.application.packages.detail.fileDetail,
  groupLoading: store.group.application.packages.fast.loading,
  saving: store.group.application.packages.fast.saving,
  lastVersion: store.group.application.packages.fast.packages[0]?.lastVersion,
  componentRemote: store.group.application.packages.fast.packages[0]?.components[0],
});

const mapDispatchToProps = {
  closeDrawer: () => ACTIONS.updateCloudSyncDrawerOpenStatus(false),
  fetchGroups: fetchResourcesGroupsAction,
  fetchFileDetail: ACTIONS.fetchFileDetail,
  fetchComponentVersionsAction: ACTIONS.fetchComponentVersionsAction,
  fetchComponentRemotes: FAST_ACTIONS.fetchPackages,
  update: FAST_ACTIONS.updateChanges,
  save: FAST_ACTIONS.saveChanges,
  selectGroup: FAST_ACTIONS.selectGroup,
  select: FAST_ACTIONS.updateSelected,
};

type CloudSyncDrawerProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ComponentCloudSyncDrawer: React.FC<CloudSyncDrawerProps> = (props) => {
  const {
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
  } = props;
  const { applicationId, fileId } = useParams<FileUrlParams>();
  const [groupId, setGroupId] = useState<string>('');
  const { locale } = useContext(GlobalContext);
  const { global, version: versionI18n, resource } = locale.business;

  useEffect(() => {
    if (open) {
      fetchGroups({
        appId: applicationId,
      });
      fetchFileDetail({ applicationId, ids: [fileId] });
    }
  }, [open]);

  useEffect(() => {
    if (componentRemote) {
      const name = componentRemote.resource.name;
      select([name]);
    }
  }, [componentRemote]);

  useEffect(() => {
    const newGroupId =
      fileDetail?.tags?.find((item) => item.type === FileTagType.ResourceGroup && item.resourceGroupId)
        ?.resourceGroupId || '';
    setGroupId(newGroupId);
    if (newGroupId && open) {
      handleSearch(newGroupId);
    }
  }, [fileDetail?.tags, open]);

  const handleSave = () => {
    save(applicationId, () => {
      closeDrawer();
      fetchComponentVersionsAction({});
    });
  };

  const handleSearch = (groupId: string) => {
    if (!groupId) {
      message.warning(resource.groupError);
      return;
    }
    selectGroup(groupId);
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
      onClose={closeDrawer}
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
          />
        </Spin>
      </>
    </OperationDrawer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ComponentCloudSyncDrawer);
