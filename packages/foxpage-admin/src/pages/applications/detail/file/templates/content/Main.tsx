import React, { useContext, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import { DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Modal, Tooltip } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/templates/content';
import {
  checkAuthRole,
  deleteFile,
  saveFile,
  updateAuthDrawerVisible,
} from '@/actions/applications/detail/file/templates/list';
import { fetchFileDetail } from '@/actions/applications/detail/projects/content';
import { BasicInfo } from '@/components/business/project/common/index';
import { AuthorizeDrawer, FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { GlobalContext } from '@/pages/system';
import * as SETTINGS_ACTIONS from '@/store/actions/applications/detail/settings/application';
import { getLocationIfo } from '@/utils/location-info';

import { ContentEditDrawer } from '../../components';

import { List } from './components/index';

const mapStateToProps = (store: RootState) => ({
  loading: store.applications.detail.file.templates.content.loading,
  saveLoading: store.applications.detail.file.templates.content.saveLoading,
  list: store.applications.detail.file.templates.content.list,
  drawerOpen: store.applications.detail.file.templates.content.editDrawerOpen,
  editContent: store.applications.detail.file.templates.content.editContent,
  authDrawerOpen: store.applications.detail.file.templates.content.authListDrawerVisible,
  authLoading: store.applications.detail.file.templates.content.authListLoading,
  authList: store.applications.detail.file.templates.content.authList,
  userList: store.applications.detail.file.templates.content.userList,
  fileDetail: store.applications.detail.projects.content.fileDetail,
  application: store.applications.detail.settings.app.application,
  applicationId: store.applications.detail.settings.app.applicationId,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchTemplateContentList: ACTIONS.fetchTemplateContentList,
  openDrawer: ACTIONS.openEditDrawer,
  saveContent: ACTIONS.saveContent,
  offlineContent: ACTIONS.offlineContent,
  copyContent: ACTIONS.copyContent,
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
  updateFile: updateAuthDrawerVisible,
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
    editContent,
    authDrawerOpen,
    authLoading,
    authList,
    clearAll,
    fetchApplicationInfo,
    fetchFileDetail,
    fetchTemplateContentList,
    openAuthDrawer,
    openDrawer,
    saveContent,
    offlineContent,
    copyContent,
    deleteContent,
    updateContentValue,
    updateContentTags,
    checkAuthRole,
    fetchAuthList,
    fetchUserList,
    saveAuth,
    deleteAuth,
    deleteFile,
    saveFile,
    updateFile,
  } = props;
  const [folderId, setFolderId] = useState<string | undefined>();
  const [fileName, setFileName] = useState('');
  const [authType, setAuthType] = useState('content');
  const [typeId, setTypeId] = useState('');

  // url params
  const history = useHistory();
  const { fileId, filePage, fileSearch } = getLocationIfo(useLocation());

  // i18n
  const { locale } = useContext(GlobalContext);
  const { file: fileI18n, global } = locale.business;

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  useEffect(() => {
    if (applicationId && fileId) {
      fetchApplicationInfo(applicationId);

      fetchFileDetail({ applicationId, ids: [fileId] });

      fetchTemplateContentList({ applicationId, fileId });
    }
  }, [applicationId, fileId]);

  useEffect(() => {
    if (fileDetail?.folderId) setFolderId(fileDetail.folderId);
  }, [fileDetail]);

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
                `/applications/${applicationId}/file/templates/list?page=${filePage || ''}&searchText=${
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
    <React.Fragment>
      <FoxPageContent
        breadcrumb={
          <FoxPageBreadcrumb
            breadCrumb={[
              {
                name: fileI18n.template,
                link: `/applications/${applicationId}/file/templates/list?page=${filePage || ''}&searchText=${
                  fileSearch || ''
                }`,
              },
              { name: fileName },
            ]}
          />
        }>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
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
              offlineContent={offlineContent}
              copyContent={copyContent}
              deleteContent={deleteContent}
              openDrawer={openDrawer}
              openAuthDrawer={openAuthDrawer}
            />
            <ContentEditDrawer
              type="template"
              saveLoading={saveLoading}
              drawerOpen={drawerOpen}
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
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
