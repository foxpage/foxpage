import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { Card, Divider } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import { ResourceTypeArray } from '@/constants/resource';
import { FoxpageBreadcrumb } from '@/pages/common';
import * as ACTIONS from '@/store/actions/group/application/resource/detail';

import FileDrawer from './components/FileDrawer';
import FolderDrawer from './components/FolderDrawer';
import List from './components/List';
import ToolBar from './components/ToolBar';
import useRelativePathData from './hooks/useRelativePathData';

const UrlInfo = styled.div`
  width: calc(100% - 250px);
  padding: 20px 0 20px 24px;
`;
const UrlInfoItem = styled.div`
  strong {
    margin-right: 4px;
  }
`;

const mapStateToProps = (store: RootState) => ({
  groupInfo: store.group.application.resource.detail.groupInfo,
});

const mapDispatchToProps = {
  updateBaseState: ACTIONS.updateResourcesDetailState,
  fetchGroupInfo: ACTIONS.fetchGroupInfoAction,
};

type ComponentsProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ResourceDetail: React.FC<ComponentsProps> = ({ groupInfo = {}, updateBaseState, fetchGroupInfo }) => {
  const { applicationId, organizationId, resourceRoot } =
    useParams<{ applicationId: string; organizationId: string; resourceRoot: string }>();
  const { folderPath, relativePathBreadCrumb = [] } = useRelativePathData();
  useEffect(() => {
    updateBaseState({
      folderPath,
      applicationId,
    });
  }, [folderPath, applicationId]);
  useEffect(() => {
    fetchGroupInfo({
      applicationId,
      path: resourceRoot,
    });
  }, [resourceRoot, applicationId]);
  return (
    <div>
      <FoxpageBreadcrumb
        breadCrumb={[
          { name: 'Application List', link: `/#/organization/${organizationId}/application/list` },
          {
            name: 'Resource Groups',
            link: `/#/organization/${organizationId}/application/${applicationId}/detail/resource`,
          },
          ...relativePathBreadCrumb,
        ]}
      />
      <div style={{ marginTop: 12, display: 'flex' }}>
        <Card style={{ width: 250, padding: 38, textAlign: 'center', display: 'inline-block' }}>
          <div>{groupInfo.name || ''}</div>
        </Card>
        <UrlInfo>
          <UrlInfoItem>
            <strong>Name:</strong>
            <span>{groupInfo.name || ''}</span>
          </UrlInfoItem>
          <UrlInfoItem>
            <strong>Intro:</strong>
            <span>{groupInfo.intro || ''}</span>
          </UrlInfoItem>
          <UrlInfoItem>
            <strong>Resource Type:</strong>
            <span>{ResourceTypeArray.find(item => item.type === groupInfo.group?.type)?.label}</span>
          </UrlInfoItem>
          <UrlInfoItem>
            <strong>Host:</strong>
            <span>{groupInfo.group?.detail?.host}</span>
          </UrlInfoItem>
        </UrlInfo>
      </div>
      <Divider />
      <ToolBar />
      <List />
      <FolderDrawer />
      <FileDrawer />
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ResourceDetail);
