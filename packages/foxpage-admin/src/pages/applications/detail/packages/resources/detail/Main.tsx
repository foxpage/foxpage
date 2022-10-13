import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { Card, Divider } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/resources/detail';
import { FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { ResourceTypeArray } from '@/constants/resource';
import { GlobalContext } from '@/pages/system';

import useRelativePathData from './hooks/useRelativePathData';
import { FileDrawer, FolderDrawer, List, ToolBar } from './components';

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
  storeApplicationId: store.applications.detail.settings.app.applicationId,
  groupInfo: store.applications.detail.resources.detail.groupInfo,
});

const mapDispatchToProps = {
  updateFolderPath: ACTIONS.updateFolderPath,
  fetchGroupInfo: ACTIONS.fetchGroupInfo,
};

type ComponentsProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ResourceDetail: React.FC<ComponentsProps> = (props) => {
  const { storeApplicationId, groupInfo, updateFolderPath, fetchGroupInfo } = props;
  const [applicationId, setApplicationId] = useState<string | undefined>();

  // url search params
  const { folderPath, relativePathBreadCrumb = [] } = useRelativePathData();
  const { resourceRoot } = useParams<{
    resourceRoot: string;
  }>();

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, resource } = locale.business;

  useEffect(() => {
    if (storeApplicationId) setApplicationId(storeApplicationId);
  }, [storeApplicationId]);

  useEffect(() => {
    updateFolderPath(folderPath);
  }, [folderPath]);

  useEffect(() => {
    if (applicationId)
      fetchGroupInfo({
        applicationId,
        path: resourceRoot,
      });
  }, [applicationId]);

  return (
    <>
      <FoxPageContent
        breadcrumb={
          <FoxPageBreadcrumb
            breadCrumb={[
              {
                name: resource.resourceGroup,
                link: `/applications/${applicationId}/package/resources/list`,
              },
              ...relativePathBreadCrumb,
            ]}
          />
        }>
        <>
          <div style={{ display: 'flex' }}>
            <Card style={{ width: 250, padding: 38, textAlign: 'center', display: 'inline-block' }}>
              <div>{groupInfo.name || ''}</div>
            </Card>
            <UrlInfo>
              <UrlInfoItem>
                <strong>{resource.groupName}:</strong>
                <span>{groupInfo.name || ''}</span>
              </UrlInfoItem>
              <UrlInfoItem>
                <strong>{resource.groupInfo}:</strong>
                <span>{groupInfo.intro || ''}</span>
              </UrlInfoItem>
              <UrlInfoItem>
                <strong>{resource.groupType}:</strong>
                <span>
                  {
                    resource[
                      ResourceTypeArray.find((item) => item.type === groupInfo.group?.type)?.label ||
                        ResourceTypeArray[0].label
                    ]
                  }
                </span>
              </UrlInfoItem>
              <UrlInfoItem>
                <strong>{global.host}:</strong>
                <span>{groupInfo.group?.detail?.host}</span>
              </UrlInfoItem>
            </UrlInfo>
          </div>
          <Divider />
          <ToolBar />
          <List />
        </>
      </FoxPageContent>

      <FolderDrawer />
      <FileDrawer />
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ResourceDetail);
