import React from 'react';
import { connect } from 'react-redux';

import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/header';
// import * as PAGE_ACTIONS from '@/store/actions/builder/main';
import { CatalogContentSelectParams } from '@/types/builder';

import { List } from './components';

const Container = styled.div`
  display: flex;
  justify-content: flex-start;
  min-width: 240px;
`;

const mapStateToProps = (store: RootState) => ({
  applicationId: store.builder.header.applicationId,
  contentId: store.builder.header.contentId,
  fileId: store.builder.header.fileId,
  folderId: store.builder.header.folderId,
  pageList: store.builder.header.pageList,
  locale: store.builder.header.locale,
  projectName: store.builder.header.project,
});

const mapDispatchToProps = {
  selectContent: ACTIONS.selectContent,
  selectFoldStatus: ACTIONS.updateFileFold,
  updateLocale: ACTIONS.updateLocale,
};

type Type = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Catalog: React.FC<Type> = (props) => {
  const {
    applicationId,
    contentId,
    fileId,
    folderId,
    pageList = [],
    locale,
    projectName,
    selectContent,
    selectFoldStatus,
    updateLocale,
  } = props;

  const handleSelectContent = (params: CatalogContentSelectParams) => {
    selectContent(params);
  };

  const handleLocaleChange = (locale: string) => {
    updateLocale(locale);
  };

  return (
    <Container>
      {pageList.length > 0 && (
        <List
          root={projectName}
          applicationId={applicationId}
          contentId={contentId}
          fileId={fileId}
          folderId={folderId}
          contentList={pageList}
          locale={locale}
          selectFoldStatus={selectFoldStatus}
          selectContent={handleSelectContent}
          setLocale={handleLocaleChange}
        />
      )}
    </Container>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Catalog);
