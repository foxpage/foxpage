import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';

import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/templates/list';
import { FileScopeSelector, FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { GlobalContext } from '@/pages/system';

import { List } from './components/index';

const OptionsBox = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
`;

const mapStateToProps = (store: RootState) => ({
  applicationId: store.applications.detail.settings.app.applicationId,
  loading: store.applications.detail.file.templates.list.loading,
  list: store.applications.detail.file.templates.list.list,
  pageInfo: store.applications.detail.file.templates.list.pageInfo,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchTemplateList: ACTIONS.fetchApplicationTemplates,
};

type TemplateListType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Main: React.FC<TemplateListType> = (props) => {
  const { applicationId, loading, list, pageInfo, fetchTemplateList, clearAll } = props;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { application, file } = locale.business;

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  useEffect(() => {
    if (applicationId) {
      fetchTemplateList({ applicationId, page: pageInfo.page, size: pageInfo.size });
    }
  }, [applicationId]);

  return (
    <React.Fragment>
      <FoxPageContent
        breadcrumb={
          <FoxPageBreadcrumb
            breadCrumb={[
              { name: application.applicationList, link: '/#/workspace/applications' },
              { name: file.template },
            ]}
          />
        }>
        <OptionsBox>
          <div style={{ flex: '0 0 200px' }}>
            <FileScopeSelector scope="project" disabled={['application']} />
          </div>
          <div style={{ flexGrow: 1, textAlign: 'right' }}></div>
        </OptionsBox>
        {applicationId && (
          <List
            applicationId={applicationId}
            loading={loading}
            pageInfo={pageInfo}
            list={list}
            onPaginationChange={(page, size) => {
              fetchTemplateList({ applicationId, page, size });
            }}
          />
        )}
      </FoxPageContent>
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
