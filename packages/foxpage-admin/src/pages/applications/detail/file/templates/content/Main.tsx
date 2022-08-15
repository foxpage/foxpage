import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/templates/content';
import { fetchFileDetail } from '@/actions/applications/detail/projects/content';
import { FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { GlobalContext } from '@/pages/system';
import * as SETTINGS_ACTIONS from '@/store/actions/applications/detail/settings/application';
import { getLocationIfo } from '@/utils/location-info';

import { BasicInfo, List } from './components/index';

const mapStateToProps = (store: RootState) => ({
  loading: store.applications.detail.file.templates.content.loading,
  list: store.applications.detail.file.templates.content.list,
  fileDetail: store.applications.detail.projects.content.fileDetail,
  applicationId: store.applications.detail.settings.app.applicationId,
});

const mapDispatchToProps = {
  fetchApplicationInfo: SETTINGS_ACTIONS.fetchApplicationInfo,
  clearAll: ACTIONS.clearAll,
  fetchTemplateContentList: ACTIONS.fetchTemplateContentList,
  fetchFileDetail: fetchFileDetail,
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
    fetchTemplateContentList,
    clearAll,
  } = props;

  // url search params
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
    if (applicationId && fileId) {
      fetchApplicationInfo(applicationId);

      fetchFileDetail({ applicationId, ids: [fileId] });

      fetchTemplateContentList({ applicationId, fileId });
    }
  }, [applicationId, fileId]);

  return (
    <React.Fragment>
      <FoxPageContent
        breadcrumb={
          <FoxPageBreadcrumb
            breadCrumb={[
              { name: application.applicationList, link: '/#/workspace/applications' },
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
          <List applicationId={applicationId} folderId={folderId || ''} loading={loading} contents={list} />
        )}
      </FoxPageContent>
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
