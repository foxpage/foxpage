import React, { useCallback, useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';

import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/application/pages/content';
import { fetchApplicationInfo } from '@/actions/group/application/settings';
import ContentEditDrawer from '@/components/business/content/ContentEditDrawer';
import ContentList from '@/components/business/content/ContentList';
import { FileTypeEnum } from '@/constants/index';
import GlobalContext from '@/pages/GlobalContext';
import { ContentType, ContentUrlParams } from '@/types/application/content';

import { FoxpageBreadcrumb, FoxpageDetailContent } from '../../../common';

const mapStateToProps = (store: RootState) => ({
  organizationId: store.system.organizationId,
  loading: store.group.application.pages.content.loading,
  list: store.group.application.pages.content.list,
  locales: store.group.application.settings.application?.locales,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchApplicationInfo: fetchApplicationInfo,
  fetchPageContentList: ACTIONS.fetchPageContentList,
  deletePageContent: ACTIONS.deletePageContent,
  updatePageContent: ACTIONS.updatePageContent,
};

type PageListType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Main: React.FC<PageListType> = (props) => {
  const { applicationId, fileId } = useParams<ContentUrlParams>();
  const {
    organizationId,
    loading,
    list,
    locales = [],
    fetchApplicationInfo,
    fetchPageContentList,
    clearAll,
    deletePageContent,
    updatePageContent,
  } = props;
  const [editContent, setEditContent] = useState<ContentType | undefined>();

  const { search } = useLocation();
  const folderId = new URLSearchParams(search).get('folderId');
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
      fetchPageContentList({ applicationId, fileId });
    }
  }, [applicationId, fileId]);

  const handleDelete = (content: ContentType) => {
    deletePageContent({
      applicationId,
      id: content.id,
      status: true,
      onSuccess: () => {
        setEditContent(undefined);
        fetchPageContentList({
          applicationId,
          fileId,
        });
      },
    });
  };

  const handleEdit = (content: ContentType) => {
    updatePageContent({
      applicationId,
      content,
      onSuccess: () => {
        setEditContent(undefined);
        fetchPageContentList({
          applicationId,
          fileId,
        });
      },
    });
  };

  const handleOpenEditDrawer = useCallback(
    (content: ContentType) => {
      setEditContent(content);
    },
    [locales],
  );

  return (
    <>
      <FoxpageDetailContent
        breadcrumb={
          <FoxpageBreadcrumb
            breadCrumb={[
              { name: application.applicationList, link: '/#/workspace/application' },
              {
                name: file.page,
                link: `/#/organization/${organizationId}/application/${applicationId}/detail/file/page`,
              },
              { name: global.contents },
            ]}
          />
        }>
        <ContentList
          applicationId={applicationId}
          folderId={folderId || ''}
          fileType={FileTypeEnum.page}
          loading={loading}
          contents={list}
          onDelete={handleDelete}
          onEdit={handleOpenEditDrawer}
        />
      </FoxpageDetailContent>
      <ContentEditDrawer
        open={!!editContent}
        content={editContent}
        locales={locales}
        onSave={handleEdit}
        onClose={() => {
          setEditContent(undefined);
        }}
      />
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
