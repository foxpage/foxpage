import React, { useCallback, useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';

import { RootState } from 'typesafe-actions';

import { fetchApplicationInfo } from '@/actions/group/application/settings';
import * as ACTIONS from '@/actions/group/application/templates/content';
import ContentEditDrawer from '@/components/business/content/ContentEditDrawer';
import ContentList from '@/components/business/content/ContentList';
import { FileTypeEnum } from '@/constants/index';
import GlobalContext from '@/pages/GlobalContext';
import { ContentType, ContentUrlParams } from '@/types/application/content';

import { FoxpageBreadcrumb, FoxpageDetailContent } from '../../../common';

const mapStateToProps = (store: RootState) => ({
  loading: store.group.application.templates.content.loading,
  list: store.group.application.templates.content.list,
  locales: store.group.application.settings.application?.locales,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchApplicationInfo: fetchApplicationInfo,
  fetchTemplateContentList: ACTIONS.fetchTemplateContentList,
  deleteTemplateContent: ACTIONS.deleteTemplateContent,
  updateTemplateContent: ACTIONS.updateTemplateContent,
};

type PageListType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Main: React.FC<PageListType> = (props) => {
  const { applicationId, organizationId, fileId } = useParams<ContentUrlParams>();
  const {
    loading,
    list,
    locales = [],
    fetchApplicationInfo,
    fetchTemplateContentList,
    clearAll,
    deleteTemplateContent,
    updateTemplateContent,
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
      fetchTemplateContentList({ applicationId, fileId });
    }
  }, [applicationId, fileId]);

  const handleDelete = (content: ContentType) => {
    deleteTemplateContent({
      applicationId,
      id: content.id,
      status: true,
      onSuccess: () => {
        setEditContent(undefined);
        fetchTemplateContentList({
          applicationId,
          fileId,
        });
      },
    });
  };

  const handleEdit = (content: ContentType) => {
    updateTemplateContent({
      applicationId,
      content,
      onSuccess: () => {
        setEditContent(undefined);
        fetchTemplateContentList({
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
    <React.Fragment>
      <FoxpageDetailContent
        breadcrumb={
          <FoxpageBreadcrumb
            breadCrumb={[
              { name: application.applicationList, link: '/#/workspace/application' },
              {
                name: file.template,
                link: `/#/organization/${organizationId}/application/${applicationId}/detail/file/template`,
              },
              { name: global.contents },
            ]}
          />
        }>
        <ContentList
          applicationId={applicationId}
          folderId={folderId || ''}
          fileType={FileTypeEnum.template}
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
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
