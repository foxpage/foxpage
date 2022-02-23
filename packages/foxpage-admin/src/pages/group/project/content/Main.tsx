import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';

import { ArrowDownOutlined, ArrowUpOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/project/content';
import { fetchParentFiles } from '@/apis/group/project';
import { FoxpageBreadcrumb } from '@/pages/common';
import GlobalContext from '@/pages/GlobalContext';
import { ProjectContentUrlParams } from '@/types/project';
import {
  getProjectFolder,
  getUrlFromParam,
  isFromWorkspace,
  PROJECT_URL_PREFIX,
  WORKSPACE_URL_PREFIX,
} from '@/utils/project/file';

import EditDrawer from './EditDrawer';
import List from './List';

const mapStateToProps = (store: RootState) => ({
  loading: store.group.project.content.loading,
  fileDetail: store.group.project.content.fileDetail,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchList: ACTIONS.fetchContentList,
  openDrawer: ACTIONS.updateEditDrawerOpen,
  commitFileToStore: ACTIONS.commitFileToStore,
  offlineFileFromStore: ACTIONS.offlineFileFromStore,
  fetchFileDetail: ACTIONS.fetchFileDetail,
  updateFileOnlineStatus: ACTIONS.updateFileOnlineStatus,
};

type ProjectContentType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ProjectContent: React.FC<ProjectContentType> = props => {
  const {
    fileDetail,
    fetchFileDetail,
    clearAll,
    openDrawer,
    fetchList,
    commitFileToStore,
    offlineFileFromStore,
    updateFileOnlineStatus,
  } = props;
  const { fileId, folderId, applicationId, organizationId } = useParams<ProjectContentUrlParams>();
  const [folderName, setFolderName] = useState<string>(getProjectFolder()?.name || 'Project details');
  const { search } = useLocation();
  const { locale } = useContext(GlobalContext);
  const { global, content, store } = locale.business;
  const fromWorkspace = isFromWorkspace(search);

  useEffect(() => {
    fetchFileDetail({ applicationId, ids: [fileId] });
    (async () => {
      const parents = await fetchParentFiles({ applicationId, id: fileId });
      const folder = parents?.data?.length > 0 ? parents.data[0] : undefined;
      if (folder) {
        setFolderName(folder.name);
      }
    })();

    return () => {
      clearAll();
    };
  }, []);

  useEffect(() => {
    if (fileDetail?.id) {
      fetchList({ applicationId, fileId, fileType: fileDetail.type });
    }
  }, [fileDetail?.id]);

  const handleCommit = () => {
    if (fileDetail) {
      Modal.confirm({
        title: store.commitTitle,
        content: store.commitMsg,
        onOk: () => {
          commitFileToStore({
            id: fileId,
            applicationId,
            type: fileDetail.type,
            onSuccess: () => {
              updateFileOnlineStatus(true);
            },
          });
        },
        okText: store.commitYes,
        cancelText: store.commitNo,
      });
    }
  };

  const handleRevoke = () => {
    Modal.confirm({
      title: store.revokeTitle,
      content: store.revokeMsg,
      onOk: () => {
        offlineFileFromStore({
          id: fileId,
          applicationId,
          onSuccess: () => {
            updateFileOnlineStatus(false);
          },
        });
      },
      okText: store.commitYes,
      cancelText: store.commitNo,
    });
  };

  const urlPrefix = fromWorkspace ? WORKSPACE_URL_PREFIX : PROJECT_URL_PREFIX;
  return (
    <React.Fragment>
      <FoxpageBreadcrumb
        breadCrumb={[
          { name: global.project, link: `/#/organization/${organizationId}/${urlPrefix}` },
          {
            name: folderName,
            link: `/#/organization/${organizationId}/${urlPrefix}/${applicationId}/folder/${folderId}?from=${getUrlFromParam(
              search,
            )}`,
          },
          {
            name: fileDetail?.name || 'File details',
          },
        ]}
      />
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
        {fileDetail?.online ? (
          <Button type="default" title="Revoke To Store" style={{ marginRight: 8 }} onClick={handleRevoke}>
            <ArrowDownOutlined />
            {store.revoke}
          </Button>
        ) : (
          <Button type="default" title="Commit To Store" style={{ marginRight: 8 }} onClick={handleCommit}>
            <ArrowUpOutlined />
            {store.commit}
          </Button>
        )}
        <Button
          type="primary"
          onClick={() => {
            openDrawer(true);
          }}
        >
          <PlusOutlined /> {content.add}
        </Button>
      </div>
      <List />
      <EditDrawer />
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectContent);
