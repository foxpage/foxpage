import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/templates/content';
import { fetchFileDetail } from '@/actions/applications/detail/projects/content';
import { AuthorizeDrawer, FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { GlobalContext } from '@/pages/system';
import * as SETTINGS_ACTIONS from '@/store/actions/applications/detail/settings/application';
import { getLocationIfo } from '@/utils/location-info';

import { ContentEditDrawer } from '../../components';

import { BasicInfo, List } from './components/index';

const PAGE_NUM = 1;
const PAGE_SIZE = 999;

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
  deleteContent: ACTIONS.deleteContent,
  openDrawer: ACTIONS.openEditDrawer,
  saveContent: ACTIONS.saveContent,
  updateContentValue: ACTIONS.updateEditContentValue,
  updateContentTags: ACTIONS.updateEditContentTags,
  openAuthDrawer: ACTIONS.updateAuthDrawerVisible,
  fetchAuthList: ACTIONS.fetchAuthList,
  fetchUserList: ACTIONS.fetchUserList,
  saveAuth: ACTIONS.saveAuthUser,
  deleteAuth: ACTIONS.deleteAuthUser,
  fetchFileDetail: fetchFileDetail,
  fetchApplicationInfo: SETTINGS_ACTIONS.fetchApplicationInfo,
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
    userList,
    clearAll,
    deleteContent,
    fetchApplicationInfo,
    fetchFileDetail,
    fetchTemplateContentList,
    openAuthDrawer,
    openDrawer,
    saveContent,
    updateContentValue,
    updateContentTags,
    fetchAuthList,
    fetchUserList,
    saveAuth,
    deleteAuth,
  } = props;
  const [folderId, setFolderId] = useState<string | undefined>();

  // url search params
  const { fileId } = getLocationIfo(useLocation());

  // i18n
  const { locale } = useContext(GlobalContext);
  const { file, global } = locale.business;

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  useEffect(() => {
    if (authDrawerOpen) {
      fetchUserList({
        page: PAGE_NUM,
        size: PAGE_SIZE,
      });
    }
  }, [authDrawerOpen]);

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

  return (
    <React.Fragment>
      <FoxPageContent
        breadcrumb={
          <FoxPageBreadcrumb
            breadCrumb={[
              {
                name: file.template,
                link: `/applications/${applicationId}/file/templates/list`,
              },
              { name: global.contents },
            ]}
          />
        }>
        <BasicInfo fileDetail={fileDetail} />
        {applicationId && (
          <>
            <List
              applicationId={applicationId}
              folderId={folderId || ''}
              loading={loading}
              contents={list}
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
              type="content"
              typeId={editContent?.id || ''}
              applicationId={applicationId as string}
              visible={authDrawerOpen}
              loading={authLoading}
              list={authList}
              users={userList}
              onClose={openAuthDrawer}
              onFetch={fetchAuthList}
              onAdd={saveAuth}
              onDelete={deleteAuth}
            />
          </>
        )}
      </FoxPageContent>
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
