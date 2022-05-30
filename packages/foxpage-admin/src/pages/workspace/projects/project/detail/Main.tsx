import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/projects/project/detail';
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
  pageInfo: store.workspace.projects.project.detail.pageInfo,
  editFile: store.workspace.projects.project.detail.editFile,
  visible: store.workspace.projects.project.detail.authListDrawerVisible,
  authLoading: store.workspace.projects.project.detail.authListLoading,
  authList: store.workspace.projects.project.detail.authList,
  userList: store.workspace.projects.project.detail.userList,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchFileList: ACTIONS.fetchFileList,
  openDrawer: ACTIONS.setAddFileDrawerOpenStatus,
  openAuthDrawer: ACTIONS.updateAuthDrawerVisible,
  fetchAuthList: ACTIONS.fetchAuthList,
  fetchUserList: ACTIONS.fetchUserList,
  addUser: ACTIONS.authAddUser,
  deleteUser: ACTIONS.authDeleteUser,
};

type FileListType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Main: React.FC<FileListType> = (props) => {
  const {
    pageInfo,
    editFile,
    visible,
    authLoading,
    authList,
    userList,
    clearAll,
    fetchFileList,
    openDrawer,
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
  const { global, file } = locale.business;

  // url search params
  const { applicationId, folderId } = getLocationIfo(useLocation());

  useEffect(() => {
    if (applicationId && folderId) {
      fetchFileList({
        applicationId,
        folderId,
        page: pageInfo.page,
        size: pageInfo.size,
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

  useEffect(() => {
    const newTypeId = editFile?.id;
    if (newTypeId) setTypeId(newTypeId);
  }, [editFile]);

  // fetch file selected authorize list
  useEffect(() => {
    if (visible && applicationId && typeId) {
      fetchAuthList({
        applicationId: applicationId as string,
        type: 'file',
        typeId,
      });
    }
  }, [visible, typeId, fetchAuthList]);

  // fetch file selected authorize user available list
  useEffect(() => {
    if (visible) {
      fetchUserList({
        page: PAGE_NUM,
        size: PAGE_SIZE,
      });
    }
  }, [visible, fetchUserList]);

  return (
    <React.Fragment>
      <FoxpageDetailContent
        breadcrumb={
          <FoxpageBreadcrumb
            breadCrumb={[
              {
                name: global.project,
                link: '/#/workspace/project/list',
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

      <EditDrawer />
      <AuthorizeDrawer
        type="file"
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

export default connect(mapStateToProps, mapDispatchToProps)(Main);
