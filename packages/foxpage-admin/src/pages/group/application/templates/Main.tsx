import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/application/templates/list';
import FileEditDrawer from '@/components/business/file/FileEditDrawer';
import FileList from '@/components/business/file/FileList';
import { FileTypeEnum } from '@/constants/global';
import GlobalContext from '@/pages/GlobalContext';
import { ApplicationUrlParams } from '@/types/application';
import { FileType } from '@/types/application/file';

import { FoxpageBreadcrumb, FoxpageDetailContent } from '../../../common';

const mapStateToProps = (store: RootState) => ({
  organizationId: store.system.organizationId,
  loading: store.group.application.templates.list.loading,
  list: store.group.application.templates.list.list,
  pageInfo: store.group.application.templates.list.pageInfo,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchTemplateList: ACTIONS.fetchApplicationTemplates,
  deleteTemplate: ACTIONS.deleteTemplate,
  updateTemplate: ACTIONS.updateTemplate,
};

type TemplateListType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Main: React.FC<TemplateListType> = (props) => {
  const { applicationId } = useParams<ApplicationUrlParams>();
  const {
    organizationId,
    loading,
    list,
    pageInfo,
    fetchTemplateList,
    clearAll,
    deleteTemplate,
    updateTemplate,
  } = props;
  const [editFile, setEditFile] = useState<FileType | undefined>();
  const { locale } = useContext(GlobalContext);
  const { application, file } = locale.business;

  useEffect(() => {
    if (applicationId) {
      fetchTemplateList({ applicationId, page: pageInfo.page, size: pageInfo.size });
    }
    return () => {
      clearAll();
    };
  }, []);

  const handleDelete = (file: FileType) => {
    deleteTemplate({
      applicationId,
      id: file.id,
      onSuccess: () => {
        setEditFile(undefined);
        fetchTemplateList({
          applicationId,
          page: list.length === 1 && pageInfo.page > 1 ? pageInfo.page - 1 : pageInfo.page,
          size: pageInfo.size,
        });
      },
    });
  };

  const handleEdit = (file: FileType) => {
    updateTemplate({
      applicationId,
      file,
      onSuccess: () => {
        setEditFile(undefined);
        fetchTemplateList({
          applicationId,
          page: pageInfo.page,
          size: pageInfo.size,
        });
      },
    });
  };

  return (
    <React.Fragment>
      <FoxpageDetailContent
        breadcrumb={
          <FoxpageBreadcrumb
            breadCrumb={[
              { name: application.applicationList, link: '/#/workspace/application' },
              { name: file.template },
            ]}
          />
        }>
        <FileList
          loading={loading}
          pageInfo={pageInfo}
          list={list}
          applicationId={applicationId}
          organizationId={organizationId}
          fileType={FileTypeEnum.template}
          onDelete={handleDelete}
          onEdit={(record) => {
            setEditFile(record);
          }}
          onPageInfoChange={(page, size) => {
            fetchTemplateList({ applicationId, page, size });
          }}
        />
      </FoxpageDetailContent>
      {editFile && (
        <FileEditDrawer
          open={!!editFile}
          file={editFile}
          onSave={handleEdit}
          onClose={() => {
            setEditFile(undefined);
          }}
        />
      )}
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
