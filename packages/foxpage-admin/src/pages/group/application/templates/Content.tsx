import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';

import { RootState } from 'typesafe-actions';

import { fetchApplicationInfo } from '@/actions/group/application/settings';
import * as ACTIONS from '@/actions/group/application/templates/content';
import ContentEditDrawer from '@/components/business/content/ContentEditDrawer';
import ContentList from '@/components/business/content/ContentList';
import { FileTypeEnum } from '@/constants/index';
import { ContentType, ContentUrlParams } from '@/types/application/content';

import { FoxpageBreadcrumb } from '../../../common';

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

const Main: React.FC<PageListType> = props => {
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
      <FoxpageBreadcrumb
        breadCrumb={[
          { name: 'Application List', link: `/#/organization/${organizationId}/application/list` },
          { name: 'Templates', link: `/#/organization/${organizationId}/application/${applicationId}/detail/template` },
          { name: 'Contents' },
        ]}
      />
      <div style={{ marginTop: 12 }}>
        <ContentList
          applicationId={applicationId}
          folderId={folderId || ''}
          fileType={FileTypeEnum.template}
          loading={loading}
          contents={list}
          onDelete={handleDelete}
          onEdit={handleOpenEditDrawer}
        />
      </div>

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
