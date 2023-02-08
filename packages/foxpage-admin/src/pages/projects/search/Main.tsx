import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/projects/search';
import { ProjectSearch } from '@/components/index';

const mapStateToProps = (store: RootState) => ({
  appList: store.projects.search.appList,
  list: store.projects.search.list,
  loading: store.projects.search.loading,
  pageInfo: store.projects.search.pageInfo,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchAPPList: ACTIONS.fetchAPPList,
  fetchList: ACTIONS.fetchList,
};

type ProjectProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Search: React.FC<ProjectProps> = (props) => {
  const { appList, list, loading, pageInfo, clearAll, fetchAPPList, fetchList } = props;

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  return (
    <ProjectSearch
      type="projects"
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
