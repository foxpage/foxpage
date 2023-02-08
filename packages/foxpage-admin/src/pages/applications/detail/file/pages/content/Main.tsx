import React, { useContext, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { DeleteOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Modal, Tooltip } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/pages/content';
import {
  checkAuthRole,
  deleteFile,
  openEditDrawer,
  saveFile,
  updateAuthDrawerVisible,
  updateEditFileValue,
} from '@/actions/applications/detail/file/pages/list';
import { fetchFileDetail } from '@/actions/applications/detail/projects/content';
import { BasicInfo } from '@/components/business/project/common/index';
import { EditDrawer as FileEditDrawer } from '@/components/business/project/file/components/index';
import { AuthorizeDrawer, FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { GlobalContext } from '@/pages/system';
import * as SETTINGS_ACTIONS from '@/store/actions/applications/detail/settings/application';
import { File, FileType } from '@/types/index';
import { getLocationIfo } from '@/utils/location-info';

import { ContentEditDrawer } from '../../components';

import { List } from './components/index';

const mapStateToProps = (store: RootState) => ({
  loading: store.applications.detail.file.pages.content.loading,
  saveLoading: store.applications.detail.file.pages.content.saveLoading,
  list: store.applications.detail.file.pages.content.list,
  drawerOpen: store.applications.detail.file.pages.content.editDrawerOpen,
  baseContents: store.applications.detail.file.pages.content.baseContents,
  editContent: store.applications.detail.file.pages.content.editContent,
  authDrawerOpen: store.applications.detail.file.pages.content.authListDrawerVisible,
  authLoading: store.applications.detail.file.pages.content.authListLoading,
  authList: store.applications.detail.file.pages.content.authList,
  fileDetail: store.applications.detail.projects.content.fileDetail,
  application: store.applications.detail.settings.app.application,
  applicationId: store.applications.detail.settings.app.applicationId,
  fileDrawerOpen: store.applications.detail.file.pages.list.drawerOpen,
  editFile: store.applications.detail.file.pages.list.editFile,
  fileSaveLoading: store.applications.detail.file.pages.list.saveLoading,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchPageContentList: ACTIONS.fetchPageContentList,
  openDrawer: ACTIONS.openEditDrawer,
  saveContent: ACTIONS.saveContent,
  offlineContent: ACTIONS.offlineContent,
  copyContent: ACTIONS.copyContent,
  saveAsBaseContent: ACTIONS.saveAsBaseContent,
  deleteContent: ACTIONS.deleteContent,
  updateContentValue: ACTIONS.updateEditContentValue,
  updateContentTags: ACTIONS.updateEditContentTags,
  openAuthDrawer: ACTIONS.updateAuthDrawerVisible,
  fetchAuthList: ACTIONS.fetchAuthList,
  fetchUserList: ACTIONS.fetchUserList,
  saveAuth: ACTIONS.saveAuthUser,
  deleteAuth: ACTIONS.deleteAuthUser,
  fetchFileDetail: fetchFileDetail,
  fetchApplicationInfo: SETTINGS_ACTIONS.fetchApplicationInfo,
  checkAuthRole,
  deleteFile,
  saveFile,
  openEditFileDrawer: openEditDrawer,
  updateFile: updateAuthDrawerVisible,
  updateEditFile: updateEditFileValue,
};

type PageListType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Main: React.FC<PageListType> = (props) => {
  const {
    application,
    applicationId,
    fileDetail,
    loading,
    saveLoading,
    list,
    drawerOpen,
    baseContents,
    editContent,
    authDrawerOpen,
    authLoading,
    authList,
    editFile,
    fileDrawerOpen,
    fileSaveLoading,
    clearAll,
    fetchApplicationInfo,
    fetchFileDetail,
    fetchPageContentList,
    openAuthDrawer,
    openDrawer,
    saveContent,
    offlineContent,
    copyContent,
    saveAsBaseContent,
    deleteContent,
    updateContentValue,
    updateContentTags,
    checkAuthRole,
    fetchAuthList,
    fetchUserList,
    saveAuth,
    deleteAuth,
    deleteFile,
    openEditFileDrawer,
    saveFile,
    updateFile,
    updateEditFile,
  } = props;
  const [folderId, setFolderId] = useState<string | undefined>();
  const [fileName, setFileName] = useState('');
  const [authType, setAuthType] = useState('content');
  const [typeId, setTypeId] = useState('');

  // url params
  const history = useHistory();
  const { fileId, filePage, fileSearch } = getLocationIfo(history.location);

  // i18n
  const { locale } = useContext(GlobalContext);
  const { file: fileI18n, global } = locale.business;

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  useEffect(() => {
    if (applicationId) {
      fetchApplicationInfo(applicationId);

      if (fileId) {
        fetchFileDetail({ applicationId, ids: [fileId] });

        fetchPageContentList({ applicationId, fileId });
      }
    }
  }, [applicationId, fileId]);

  useEffect(() => {
    if (fileDetail?.folderId) setFolderId(fileDetail.folderId);
  }, [fileDetail?.folderId]);

  useEffect(() => {
    setFileName(fileDetail?.name);
  }, [fileDetail?.name]);

  useEffect(() => {
    if (fileDetail?.id) updateFile(false, fileDetail);
  }, [fileDetail?.id]);

  useEffect(() => {
    const newTypeId = editContent?.id;
    if (newTypeId) setTypeId(newTypeId);
  }, [editContent]);

  const deleteDisabled = useMemo(() => {
    let disabled = true;

    const livePage = list && list.find((content) => !!content.version);
    if (!fileDetail?.online && !livePage) disabled = false;

    return disabled;
  }, [list, fileDetail]);

  const handleAuthorize = (type, id) => {
    if (typeof openAuthDrawer === 'function') {
      setAuthType(type);
      setTypeId(id);

      openAuthDrawer(true);
    }
  };

  const handleDeleteFile = () => {
    Modal.confirm({
      title: fileI18n.delete,
      content: fileI18n.deleteMessage,
      onOk: () => {
        if ((fileDetail?.applicationId || fileDetail?.application?.id) && typeof deleteFile === 'function') {
          deleteFile(
            {
              id: fileDetail.id,
              applicationId: fileDetail?.applicationId || fileDetail.application.id,
              folderId: fileDetail.folderId,
            },
            () => {
              history.push(
                `/applications/${applicationId}/file/pages/list?page=${filePage || ''}&searchText=${
                  fileSearch || ''
                }`,
              );
            },
          );
        }
      },
      okText: global.yes,
      cancelText: global.no,
    });
  };

  const handleEdit = () => {
    const editFile: File = {
      intro: fileDetail?.intro || '',
      tags: fileDetail?.tags || [],
      suffix: fileDetail?.suffix || '',
      deleted: fileDetail?.deleted || false,
      id: fileDetail?.id || '',
      name: fileDetail?.name || '',
      folderId: fileDetail?.folderId || '',
      type: fileDetail?.type as FileType,
      componentType: fileDetail?.componentType as any,
      createTime: fileDetail?.createTime,
      updateTime: fileDetail?.updateTime,
      creator: fileDetail?.creator,
      application: {
        id: fileDetail?.applicationId || '',
        name: '',
      },
      hasContent: fileDetail?.hasContent || false,
      hasLiveContent: fileDetail?.hasLiveContent || false,
    };

    openEditFileDrawer(true, editFile);
  };

  const handleOnBlur = (name: string, cb?: () => void) => {
    if (name !== fileDetail?.name) {
      setFileName(name);

      if (typeof saveFile === 'function' && applicationId && folderId) {
        saveFile(
          {
            applicationId,
            folderId,
            name,
          },
          () => {
            if (typeof cb === 'function') cb();
          },
        );
      }
    }
  };

  return (
    <>
      <FoxPageContent
        breadcrumb={
          <FoxPageBreadcrumb
            breadCrumb={[
              {
                name: fileI18n.page,
                link: `/applications/${applicationId}/file/pages/list?page=${filePage || ''}&searchText=${
                  fileSearch || ''
                }`,
              },
              { name: fileName },
            ]}
          />
        }>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <Button onClick={handleEdit} style={{ marginRight: 8 }}>
            <EditOutlined /> {fileI18n.edit}
          </Button>
          <Button onClick={() => handleAuthorize('file', fileDetail.id)} style={{ marginRight: 8 }}>
            <UserOutlined /> {fileI18n.authorize}
          </Button>
          <Tooltip
            title={
              deleteDisabled
                ? fileDetail?.online
                  ? fileI18n.fileCommitToStoreTips
                  : fileI18n.filePageLiveTips
                : ''
            }>
            <Button danger disabled={deleteDisabled} onClick={handleDeleteFile} style={{ marginRight: 8 }}>
              <DeleteOutlined /> {fileI18n.delete}
            </Button>
          </Tooltip>
        </div>
        <BasicInfo fileType="file" fileDetail={fileDetail} onBlur={handleOnBlur} />
        {applicationId && (
          <>
            <List
              applicationId={applicationId}
              folderId={folderId || ''}
              loading={loading}
              contents={list}
              fileDetail={fileDetail}
              locales={application?.locales || []}
              offlineContent={offlineContent}
              copyContent={copyContent}
              saveAsBaseContent={saveAsBaseContent}
              deleteContent={deleteContent}
              openDrawer={openDrawer}
              openAuthDrawer={handleAuthorize}
            />
            <FileEditDrawer
              drawerOpen={fileDrawerOpen}
              saveLoading={fileSaveLoading}
              editFile={editFile as File}
              fetchFileDetail={fetchFileDetail}
              updateEditFile={updateEditFile}
              saveFile={saveFile}
              closeDrawer={openEditFileDrawer}
            />
            <ContentEditDrawer
              type="page"
              saveLoading={saveLoading}
              drawerOpen={drawerOpen}
              baseContents={baseContents}
              locales={application?.locales || []}
              editContent={editContent}
              closeDrawer={openDrawer}
              updateContentValue={updateContentValue}
              updateContentTags={updateContentTags}
              saveContent={saveContent}
            />
            <AuthorizeDrawer
              needFetch
              type={authType}
              typeId={typeId}
              applicationId={applicationId as string}
              visible={authDrawerOpen}
              loading={authLoading}
              list={authList}
              onClose={openAuthDrawer}
              onSearch={fetchUserList}
              onFetch={fetchAuthList}
              onAdd={saveAuth}
              onDelete={deleteAuth}
              onValidate={checkAuthRole}
            />
          </>
        )}
      </FoxPageContent>
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
