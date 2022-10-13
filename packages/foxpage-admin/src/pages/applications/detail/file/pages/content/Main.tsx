import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/pages/content';
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
  loading: store.applications.detail.file.pages.content.loading,
  saveLoading: store.applications.detail.file.pages.content.saveLoading,
  list: store.applications.detail.file.pages.content.list,
  drawerOpen: store.applications.detail.file.pages.content.editDrawerOpen,
  baseContents: store.applications.detail.file.pages.content.baseContents,
  editContent: store.applications.detail.file.pages.content.editContent,
  authDrawerOpen: store.applications.detail.file.pages.content.authListDrawerVisible,
  authLoading: store.applications.detail.file.pages.content.authListLoading,
  authList: store.applications.detail.file.pages.content.authList,
  userList: store.applications.detail.file.pages.content.userList,
  fileDetail: store.applications.detail.projects.content.fileDetail,
  application: store.applications.detail.settings.app.application,
  applicationId: store.applications.detail.settings.app.applicationId,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchPageContentList: ACTIONS.fetchPageContentList,
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
    baseContents,
    editContent,
    authDrawerOpen,
    authLoading,
    authList,
    userList,
    clearAll,
    deleteContent,
    fetchApplicationInfo,
    fetchFileDetail,
    fetchPageContentList,
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

  // url params
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
  }, [fileDetail]);

  return (
    <>
      <FoxPageContent
        breadcrumb={
          <FoxPageBreadcrumb
            breadCrumb={[
              {
                name: file.page,
                link: `/applications/${applicationId}/file/pages/list`,
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
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
