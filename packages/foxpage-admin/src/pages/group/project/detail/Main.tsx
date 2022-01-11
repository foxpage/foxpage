import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';

import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/project/detail';
import { fetchParentFiles } from '@/apis/group/project';
import { FoxpageBreadcrumb } from '@/pages/common';
import { ProjectDetailUrlParams } from '@/types/project';
import { getProjectFolder, isFromWorkspace, PROJECT_URL_PREFIX, WORKSPACE_URL_PREFIX } from '@/utils/project/file';

import EditDrawer from './EditDrawer';
import List from './List';

const PAGE_SIZE = 10;

const mapStateToProps = (store: RootState) => ({
  loading: store.group.project.detail.loading,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchFileList: ACTIONS.fetchFileList,
  openDrawer: ACTIONS.setAddFileDrawerOpenStatus,
};

type FileListType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Main: React.FC<FileListType> = props => {
  const [folderName, setFolderName] = useState<string>(getProjectFolder()?.name || 'Project details');
  const { folderId, applicationId, organizationId } = useParams<ProjectDetailUrlParams>();
  const { fetchFileList, openDrawer, clearAll } = props;

  const { search } = useLocation();
  const fromWorkspace = isFromWorkspace(search);

  useEffect(() => {
    if (applicationId) {
      fetchFileList({ folderId, applicationId, page: 1, size: PAGE_SIZE });
    }
    (async () => {
      const parents = await fetchParentFiles({ applicationId, id: folderId });
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
    <React.Fragment>
      <FoxpageBreadcrumb
        breadCrumb={[
          {
            name: 'Project',
            link: `/#/organization/${organizationId}/${fromWorkspace ? WORKSPACE_URL_PREFIX : PROJECT_URL_PREFIX}`,
          },
          { name: folderName },
        ]}
      />
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" onClick={openDrawer}>
          <PlusOutlined /> Add File
        </Button>
      </div>
      <List />
      <EditDrawer />
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
