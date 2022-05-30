import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { ArrowDownOutlined, ArrowUpOutlined, DownOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu, Modal } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/projects/project/content';
import { fetchParentFiles } from '@/apis/group/project';
import { FoxpageBreadcrumb, FoxpageDetailContent } from '@/pages/common';
import { AuthorizeDrawer } from '@/pages/components';
import GlobalContext from '@/pages/GlobalContext';
import getLocationIfo from '@/utils/get-location-info';
import { getProjectFolder } from '@/utils/project/file';

import EditDrawer from './EditDrawer';
import List from './List';

const PAGE_NUM = 1;
const PAGE_SIZE = 999;

const mapStateToProps = (store: RootState) => ({
  fileDetail: store.workspace.projects.project.content.fileDetail,
  editContent: store.workspace.projects.project.content.editContent,
  visible: store.workspace.projects.project.content.authListDrawerVisible,
  authLoading: store.workspace.projects.project.content.authListLoading,
  authList: store.workspace.projects.project.content.authList,
  userList: store.workspace.projects.project.content.userList,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchList: ACTIONS.fetchContentList,
  openDrawer: ACTIONS.updateEditDrawerOpen,
  commitFileToStore: ACTIONS.commitFileToStore,
  offlineFileFromStore: ACTIONS.offlineFileFromStore,
  fetchFileDetail: ACTIONS.fetchFileDetail,
  updateFileOnlineStatus: ACTIONS.updateFileOnlineStatus,
  openAuthDrawer: ACTIONS.updateAuthDrawerVisible,
  fetchAuthList: ACTIONS.fetchAuthList,
  fetchUserList: ACTIONS.fetchUserList,
  addUser: ACTIONS.authAddUser,
  deleteUser: ACTIONS.authDeleteUser,
};

type ProjectContentType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ProjectContent: React.FC<ProjectContentType> = (props) => {
  const {
    fileDetail,
    editContent,
    visible,
    authLoading,
    authList,
    userList,
    clearAll,
    fetchFileDetail,
    openDrawer,
    fetchList,
    commitFileToStore,
    offlineFileFromStore,
    updateFileOnlineStatus,
    openAuthDrawer,
    fetchAuthList,
    fetchUserList,
    addUser,
    deleteUser,
  } = props;
  const [folderName, setFolderName] = useState<string>(getProjectFolder()?.name || 'Project details');
  const [typeId, setTypeId] = useState('');

  // multi-language
  const { locale } = useContext(GlobalContext);
  const { global, content, store } = locale.business;

  // url search params
  const { applicationId, folderId, fileId } = getLocationIfo(useLocation());

  useEffect(() => {
    if (applicationId && fileId) {
      fetchFileDetail({ applicationId, ids: [fileId] });
    }

    (async () => {
      const parents = await fetchParentFiles({
        applicationId: applicationId as string,
        id: fileId as string,
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

  useEffect(() => {
    if (fileDetail?.id) {
      fetchList({
        applicationId: applicationId as string,
        fileId: fileId as string,
        fileType: fileDetail.type,
      });
    }
  }, [fileDetail?.id]);

  useEffect(() => {
    const newTypeId = editContent?.id;
    if (newTypeId) setTypeId(newTypeId);
  }, [editContent]);

  // fetch content selected authorize list
  useEffect(() => {
    if (visible && typeId) {
      fetchAuthList({
        applicationId: applicationId as string,
        type: 'content',
        typeId,
      });
    }
  }, [visible, typeId, fetchAuthList]);

  // fetch content selected authorize user available list
  useEffect(() => {
    if (visible) {
      fetchUserList({
        page: PAGE_NUM,
        size: PAGE_SIZE,
      });
    }
  }, [visible, fetchUserList]);

  const handleCommit = () => {
    if (fileDetail) {
      Modal.confirm({
        title: store.commitTitle,
        content: store.commitMsg,
        onOk: () => {
          commitFileToStore({
            id: fileId as string,
            applicationId: applicationId as string,
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
          id: fileId as string,
          applicationId: applicationId as string,
          onSuccess: () => {
            updateFileOnlineStatus(false);
          },
        });
      },
      okText: store.commitYes,
      cancelText: store.commitNo,
    });
  };

  return (
    <React.Fragment>
      <FoxpageDetailContent
        breadcrumb={
          <FoxpageBreadcrumb
            breadCrumb={[
              { name: global.project, link: '/#/workspace/project/list' },
              {
                name: folderName,
                link: `/#/workspace/project/detail?applicationId=${applicationId}&folderId=${folderId}`,
              },
              {
                name: fileDetail?.name || 'File details',
              },
            ]}
          />
        }>
        <>
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
            {fileDetail?.online ? (
              <Button
                type="default"
                title="Revoke To Store"
                style={{ marginRight: 8 }}
                onClick={handleRevoke}>
                <ArrowDownOutlined />
                {store.revoke}
              </Button>
            ) : (
              <Button
                type="default"
                title="Commit To Store"
                style={{ marginRight: 8 }}
                onClick={handleCommit}>
                <ArrowUpOutlined />
                {store.commit}
              </Button>
            )}
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item
                    key="1"
                    onClick={() => {
                      openDrawer(true, { isBase: true });
                    }}>
                    {content.addBase}
                  </Menu.Item>
                  <Menu.Item
                    key="2"
                    onClick={() => {
                      openDrawer(true);
                    }}>
                    {content.addLocale}
                  </Menu.Item>
                </Menu>
              }>
              <Button type="primary">
                <PlusOutlined /> {content.add} <DownOutlined />
              </Button>
            </Dropdown>
          </div>
          <List />
        </>
      </FoxpageDetailContent>

      <EditDrawer />
      <AuthorizeDrawer
        type="content"
        typeId={typeId}
        applicationId={applicationId as string}
        visible={visible}
        loading={authLoading}
        list={authList}
        users={userList}
        onClose={openAuthDrawer}
        onFetch={fetchAuthList}
        onAdd={addUser}
        onDelete={deleteUser}
      />
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectContent);
