import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/projects/search';
import { ProjectSearch } from '@/components/index';

const mapStateToProps = (store: RootState) => ({
  list: store.applications.detail.projects.search.list,
  loading: store.applications.detail.projects.search.loading,
  pageInfo: store.applications.detail.projects.search.pageInfo,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchList: ACTIONS.fetchList,
};

type ProjectProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Search: React.FC<ProjectProps> = (props) => {
  const { list, loading, pageInfo, clearAll, fetchList } = props;

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  return (
    <ProjectSearch
      type="application"
      loading={loading}
      pageInfo={pageInfo}
      list={list}
      fetchList={fetchList}
    />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Search);
