import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import _ from 'lodash';
import { RootState } from 'typesafe-actions';

import { updateRequireLoadStatus } from '@/actions/builder/component-load';
import * as ACTIONS from '@/actions/builder/page';
import { clearResource } from '@/actions/builder/template';
import { FileTypeEnum } from '@/constants/index';
import { PageContentType, PageFileType, PageParam } from '@/types/builder/page';

import File from './File';
import Folder from './Folder';

const mapStateToProps = (store: RootState) => ({
  pageList: store.builder.page.pageList,
  storeContentId: store.builder.page.contentId,
  locale: store.builder.page.locale,
  fileDetail: store.builder.page.fileDetail,
});

const mapDispatchToProps = {
  selectContent: ACTIONS.selectContent,
  selectFoldStatus: ACTIONS.setFileFoldStatus,
  fetch: ACTIONS.fetchPageList,
  setLocale: ACTIONS.setLocale,
  fetchFileDetail: ACTIONS.fetchFileDetail,
  clearResource: clearResource,
  updateRequireLoadStatus: updateRequireLoadStatus,
};

type Type = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const PageList: React.FC<Type> = props => {
  const {
    pageList = [],
    locale,
    storeContentId,
    fileDetail,
    fetch,
    selectContent,
    selectFoldStatus,
    setLocale,
    fetchFileDetail,
    clearResource,
    updateRequireLoadStatus,
  } = props;
  const { fileId, folderId, applicationId, contentId } = useParams<PageParam>();

  useEffect(() => {
    if (fileId) {
      fetchFileDetail({ applicationId, ids: [fileId] });
    }
  }, []);

  useEffect(() => {
    if (!fileId || fileId && fileDetail?.type) {
      fetch({ applicationId, folderId, fileId, contentId, fileType: fileDetail?.type || FileTypeEnum.page });
    }
  }, [fileDetail]);

  useEffect(() => {
    if (!storeContentId && pageList.length > 0) {
      if (fileId) {
        const content = pageList.find(item => item.id === contentId) || pageList[0];
        const localeTag = content?.tags.filter(item => item.locale);
        handleSelectContent({
          applicationId,
          folderId,
          fileId,
          contentId: contentId || content.id,
          locale: localeTag.length > 0 ? localeTag[0].locale : '',
          fileType: fileDetail?.type || FileTypeEnum.page,
        });
      } else {
        const file = _.cloneDeep(pageList[0]);
        delete file.contents;
        localStorage['foxpage_project_file'] = JSON.stringify(file);
        const contents = pageList[0].contents || [];
        if (contents.length > 0) {
          const localeTag = contents[0]?.tags.filter(item => item.locale);
          handleSelectContent({
            applicationId,
            folderId,
            fileId: file.id,
            contentId: contents[0].id,
            locale: localeTag[0].locale,
            fileType: (file as unknown as PageFileType).type,
          });
        }
      }
    }
  }, [pageList]);

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
    <div
      style={{
        padding: '10px 0',
        overflowY: 'auto',
        borderBottom: '2px solid #dbdbdb',
        textAlign: 'center',
        maxHeight: '50%',
        paddingBottom: 36,
      }}
    >
      {pageList.length > 0 && (
        <React.Fragment>
          {pageList[0].folderId ? (
            <Folder
              contentId={storeContentId}
              fileList={pageList as unknown as PageFileType[]}
              selectFoldStatus={selectFoldStatus}
              locale={locale}
              selectContent={handleSelectContent}
              setLocale={handleLocaleChange}
            />
          ) : (
            <File
              contentId={storeContentId}
              contentList={pageList as PageContentType[]}
              selectFoldStatus={selectFoldStatus}
              locale={locale}
              fileDetail={fileDetail}
              selectContent={handleSelectContent}
              setLocale={handleLocaleChange}
            />
          )}
        </React.Fragment>
      )}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(PageList);
