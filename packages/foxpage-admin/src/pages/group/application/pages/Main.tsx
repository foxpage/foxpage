import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/application/pages/list';
import FileEditDrawer from '@/components/business/file/FileEditDrawer';
import FileList from '@/components/business/file/FileList';
import { FileTypeEnum } from '@/constants/global';
import GlobalContext from '@/pages/GlobalContext';
import { ApplicationUrlParams } from '@/types/application';
import { FileType } from '@/types/application/file';

import { FoxpageBreadcrumb } from '../../../common';

const mapStateToProps = (store: RootState) => ({
  loading: store.group.application.pages.list.loading,
  list: store.group.application.pages.list.list,
  pageInfo: store.group.application.pages.list.pageInfo,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchPageList: ACTIONS.fetchApplicationPages,
  deletePage: ACTIONS.deletePage,
  updatePage: ACTIONS.updatePage,
};

type PageListType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Main: React.FC<PageListType> = props => {
  const { applicationId, organizationId } = useParams<ApplicationUrlParams>();
  const { loading, list, pageInfo, fetchPageList, clearAll, deletePage, updatePage } = props;
  const [editFile, setEditFile] = useState<FileType | undefined>();
  const { locale } = useContext(GlobalContext);
  const { application, file } = locale.business;

  useEffect(() => {
    if (applicationId) {
      fetchPageList({ applicationId, page: pageInfo.page, size: pageInfo.size });
    }
    return () => {
      clearAll();
    };
  }, []);

  const handleDelete = (file: FileType) => {
    deletePage({
      applicationId,
      id: file.id,
      onSuccess: () => {
        setEditFile(undefined);
        fetchPageList({
          applicationId,
          page: list.length === 1 && pageInfo.page > 1 ? pageInfo.page - 1 : pageInfo.page,
          size: pageInfo.size,
        });
      },
    });
  };

  const handleEdit = (file: FileType) => {
    updatePage({
      applicationId,
      file,
      onSuccess: () => {
        setEditFile(undefined);
        fetchPageList({
          applicationId,
          page: pageInfo.page,
          size: pageInfo.size,
        });
      },
    });
  };

  return (
    <React.Fragment>
      <FoxpageBreadcrumb
        breadCrumb={[
          { name: application.applicationList, link: `/#/organization/${organizationId}/application/list` },
          { name: file.page },
        ]}
      />
      <div style={{ marginTop: 12 }}>
        <FileList
          loading={loading}
          pageInfo={pageInfo}
          list={list}
          applicationId={applicationId}
          organizationId={organizationId}
          fileType={FileTypeEnum.page}
          onDelete={handleDelete}
          onEdit={record => {
            setEditFile(record);
          }}
          onPageInfoChange={(page, size) => {
            fetchPageList({ applicationId, page, size });
          }}
        />
      </div>

      <FileEditDrawer
        open={!!editFile}
        file={editFile}
        onSave={handleEdit}
        onClose={() => {
          setEditFile(undefined);
        }}
      />
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
