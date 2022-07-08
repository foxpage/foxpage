import React from 'react';
import { connect } from 'react-redux';

import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import { updateRequireLoadStatus } from '@/actions/builder/component-load';
import * as ACTIONS from '@/actions/builder/page';
import { clearResource } from '@/actions/builder/template';
import { PageContentType, PageParam } from '@/types/builder/page';

import Catalog from './Catalog';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  min-width: 160px;
`;

const mapStateToProps = (store: RootState) => ({
  pageList: store.builder.page.pageList,
  storeContentId: store.builder.page.contentId,
  storeFileId: store.builder.page.fileId,
  locale: store.builder.page.locale,
  projectName: store.builder.page.project,
});

const mapDispatchToProps = {
  selectContent: ACTIONS.selectContent,
  selectFoldStatus: ACTIONS.setFileFoldStatus,
  setLocale: ACTIONS.setLocale,
  clearResource: clearResource,
  updateRequireLoadStatus: updateRequireLoadStatus,
};

type Type = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Switch: React.FC<Type> = (props) => {
  const {
    pageList = [],
    locale,
    storeFileId,
    storeContentId,
    projectName,
    selectContent,
    selectFoldStatus,
    setLocale,
    clearResource,
    updateRequireLoadStatus,
  } = props;

  const handleSelectContent = (params: PageParam) => {
    clearResource({
      onSuccess: () => {
        selectContent(params);
      },
    });
  };

  const handleLocaleChange = (locale: string) => {
    updateRequireLoadStatus(true);
    setLocale(locale);
  };

  return (
    <Container>
      {pageList.length > 0 && (
        <Catalog
          root={projectName}
          fileId={storeFileId}
          contentId={storeContentId}
          contentList={pageList as PageContentType[]}
          selectFoldStatus={selectFoldStatus}
          locale={locale}
          selectContent={handleSelectContent}
          setLocale={handleLocaleChange}
        />
      )}
    </Container>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Switch);
