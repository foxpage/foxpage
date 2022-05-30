import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/projects/detail';
import { fetchParentFiles } from '@/apis/group/project';
import { FoxpageBreadcrumb, FoxpageDetailContent } from '@/pages/common';
import { Content, StyledLayout } from '@/pages/components';
import GlobalContext from '@/pages/GlobalContext';
import getLocationIfo from '@/utils/get-location-info';
import { getProjectFolder } from '@/utils/project/file';

import EditDrawer from './EditDrawer';
import List from './List';

const PAGE_SIZE = 10;

const mapStateToProps = (store: RootState) => ({
  loading: store.projects.detail.loading,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchFileList: ACTIONS.fetchFileList,
  openDrawer: ACTIONS.setAddFileDrawerOpenStatus,
};

type FileListType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Main: React.FC<FileListType> = (props) => {
  const { fetchFileList, openDrawer, clearAll } = props;
  const [folderName, setFolderName] = useState<string>(getProjectFolder()?.name || 'Project details');

  // multi-language
  const { locale } = useContext(GlobalContext);
  const { global, file } = locale.business;

  // url search params
  const { applicationId, folderId } = getLocationIfo(useLocation());

  useEffect(() => {
    if (applicationId && folderId) {
      fetchFileList({
        applicationId,
        folderId,
        page: 1,
        size: PAGE_SIZE,
      });
    }

    (async () => {
      const parents = await fetchParentFiles({
        applicationId: applicationId as string,
        id: folderId as string,
      });
      const folder = parents?.data?.length > 0 ? parents.data[0] : undefined;
      if (folder) {
        setFolderName(folder.name);
      }
    })();

    return () => {
      clearAll();
    };
  }, []);

  return (
    <StyledLayout>
      <Content>
        <FoxpageDetailContent
          breadcrumb={
            <FoxpageBreadcrumb
              breadCrumb={[
                {
                  name: global.project,
                  link: '/#/projects/list',
                },
                { name: folderName },
              ]}
            />
          }>
          <>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="primary" onClick={() => openDrawer(true)}>
                <PlusOutlined /> {file.add}
              </Button>
            </div>
            <List />
          </>
        </FoxpageDetailContent>
      </Content>
      <EditDrawer />
    </StyledLayout>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
