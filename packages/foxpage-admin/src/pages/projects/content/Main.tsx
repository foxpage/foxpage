import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/projects/content';
import { ProjectContent } from '@/components/index';

const mapStateToProps = (store: RootState) => ({
  fileDetail: store.projects.content.fileDetail,
  loading: store.projects.content.loading,
  saveLoading: store.projects.content.saveLoading,
  contentList: store.projects.content.contents,
  extendRecord: store.projects.content.extendRecord,
  drawerOpen: store.projects.content.editorDrawerOpen,
  editContent: store.projects.content.editContent,
  baseContents: store.projects.content.baseContents,
  locales: store.projects.content.locales,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchList: ACTIONS.fetchContentList,
  fetchFileDetail: ACTIONS.fetchFileDetail,
  fetchParentFiles: ACTIONS.fetchParentFiles,
  commitFileToStore: ACTIONS.commitFileToStore,
  offlineFileFromStore: ACTIONS.offlineFileFromStore,
  updateFileOnlineStatus: ACTIONS.updateFileOnlineStatus,
  openDrawer: ACTIONS.updateEditDrawerOpen,
  deleteContent: ACTIONS.deleteContent,
  updateContentValue: ACTIONS.updateEditContentValue,
  updateContentTags: ACTIONS.updateEditContentTags,
  saveContent: ACTIONS.saveContent,
  fetchLocales: ACTIONS.fetchLocales,
};

type ProjectContentType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Content: React.FC<ProjectContentType> = (props) => {
  const {
    fileDetail,
    loading,
    saveLoading,
    contentList,
    extendRecord,
    drawerOpen,
    editContent,
    baseContents,
    locales,
    clearAll,
    fetchList,
    fetchFileDetail,
    fetchParentFiles,
    commitFileToStore,
    offlineFileFromStore,
    updateFileOnlineStatus,
    openDrawer,
    fetchLocales,
    updateContentValue,
    updateContentTags,
    saveContent,
    deleteContent,
  } = props;

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  return (
    <ProjectContent
      type="projects"
      fileDetail={fileDetail}
      loading={loading}
      saveLoading={saveLoading}
      contentList={contentList}
      extendRecord={extendRecord}
      drawerOpen={drawerOpen}
      editContent={editContent}
      baseContents={baseContents}
      locales={locales}
      fetchList={fetchList}
      fetchFileDetail={fetchFileDetail}
      fetchParentFiles={fetchParentFiles}
      commitToStore={commitFileToStore}
      offlineFromStore={offlineFileFromStore}
      updateFileOnlineStatus={updateFileOnlineStatus}
      openDrawer={openDrawer}
      fetchLocales={fetchLocales}
      updateContentValue={updateContentValue}
      updateContentTags={updateContentTags}
      saveContent={saveContent}
      deleteContent={deleteContent}
    />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Content);
