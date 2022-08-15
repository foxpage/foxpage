import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';

import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/pages/list';
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
  loading: store.applications.detail.file.pages.list.loading,
  list: store.applications.detail.file.pages.list.list,
  pageInfo: store.applications.detail.file.pages.list.pageInfo,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchPageList: ACTIONS.fetchApplicationPages,
};

type PageListType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Main: React.FC<PageListType> = (props) => {
  const { applicationId, loading, list, pageInfo, fetchPageList, clearAll } = props;

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
      fetchPageList({ applicationId, page: pageInfo.page, size: pageInfo.size });
    }
  }, [applicationId]);

  return (
    <React.Fragment>
      <FoxPageContent
        breadcrumb={
          <FoxPageBreadcrumb
            breadCrumb={[
              { name: application.applicationList, link: '/#/workspace/applications' },
              { name: file.page },
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
              fetchPageList({ applicationId, page, size });
            }}
          />
        )}
      </FoxPageContent>
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
