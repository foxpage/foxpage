import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/projects/involved/search';
import { ProjectSearch } from '@/components/index';

const mapStateToProps = (store: RootState) => ({
  loading: store.workspace.projects.involved.search.loading,
  appList: store.workspace.projects.involved.search.appList,
  list: store.workspace.projects.involved.search.list,
  pageInfo: store.workspace.projects.involved.search.pageInfo,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchAPPList: ACTIONS.fetchAPPList,
  fetchList: ACTIONS.fetchList,
};

type ProjectProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Search: React.FC<ProjectProps> = (props) => {
  const { loading, pageInfo, appList, list, clearAll, fetchAPPList, fetchList } = props;

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  return (
    <ProjectSearch
      type="involved"
      loading={loading}
      pageInfo={pageInfo}
      appList={appList}
      list={list}
      fetchAPPList={fetchAPPList}
      fetchList={fetchList}
    />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Search);
