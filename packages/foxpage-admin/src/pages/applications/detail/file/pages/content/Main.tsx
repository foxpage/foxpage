import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/pages/content';
import { fetchFileDetail } from '@/actions/applications/detail/projects/content';
import { FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { GlobalContext } from '@/pages/system';
import * as SETTINGS_ACTIONS from '@/store/actions/applications/detail/settings/application';
import { getLocationIfo } from '@/utils/location-info';

import { BasicInfo, List } from './components/index';

const mapStateToProps = (store: RootState) => ({
  loading: store.applications.detail.file.pages.content.loading,
  list: store.applications.detail.file.pages.content.list,
  fileDetail: store.applications.detail.projects.content.fileDetail,
  applicationId: store.applications.detail.settings.app.applicationId,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchPageContentList: ACTIONS.fetchPageContentList,
  fetchFileDetail: fetchFileDetail,
  fetchApplicationInfo: SETTINGS_ACTIONS.fetchApplicationInfo,
};

type PageListType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Main: React.FC<PageListType> = (props) => {
  const {
    applicationId,
    fileDetail,
    loading,
    list,
    fetchApplicationInfo,
    fetchFileDetail,
    fetchPageContentList,
    clearAll,
  } = props;

  // url params
  const { folderId, fileId } = getLocationIfo(useLocation());

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, application, file } = locale.business;

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

  return (
    <>
      <FoxPageContent
        breadcrumb={
          <FoxPageBreadcrumb
            breadCrumb={[
              { name: application.applicationList, link: '/#/workspace/applications' },
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
          <List
            applicationId={applicationId}
            folderId={folderId || ''}
            loading={loading}
            fileDetail={fileDetail}
            contents={list}
          />
        )}
      </FoxPageContent>
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
