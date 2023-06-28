import React, { useCallback, useContext } from 'react';
import { connect } from 'react-redux';

import { BugFilled } from '@ant-design/icons';
import { RootState } from 'typesafe-actions';

import { handlePageCapture } from '@foxpage/foxpage-iframe-actions';

import * as ACTIONS from '@/actions/builder/header';
import { IconMsg, StyledIcon } from '@/pages/builder/header/Main';
import { GlobalContext } from '@/pages/system';
import * as PAGE_ACTIONS from '@/store/actions/builder/main';

import { DSL, HTML, Mock, More, Preview, Publish, Save } from './components';

const mapStateToProps = (store: RootState) => ({
  applicationId: store.builder.header.applicationId,
  folderId: store.builder.header.folderId,
  contentId: store.builder.header.contentId,
  versionId: store.builder.main.pageContent.id,
  mock: store.builder.main.mock,
  editStatus: store.builder.main.editStatus && !!store.record.main.localRecords.length,
  saveLoading: store.builder.main.saveLoading,
  publishLoading: store.builder.main.publishLoading,
});

const mapDispatchToProps = {
  saveMock: ACTIONS.saveMock,
  savePageContent: PAGE_ACTIONS.saveContent,
  publishPageContent: PAGE_ACTIONS.publishContent,
};

type Type = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Catalog: React.FC<Type> = (props) => {
  const {
    applicationId,
    folderId,
    contentId,
    versionId,
    mock,
    editStatus,
    saveLoading,
    publishLoading,
    saveMock,
    savePageContent,
    publishPageContent,
  } = props;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { mock: mockI18n } = locale.business;

  const generateMockSaveParams = useCallback(() => {
    return {
      applicationId,
      folderId: folderId || '',
      contentId: contentId || '',
      name: `mock_${contentId}`,
      content: mock,
    };
  }, [applicationId, folderId, contentId, mock]);

  const handleSave = () => {
    const mockDataValid = mock.schemas && mock.schemas.length > 0;

    if (mockDataValid) {
      const params: any = generateMockSaveParams();

      saveMock(params, () => {
        savePageContent();
      });
    } else {
      savePageContent();
    }
  };

  const handlePublish = () => {
    const mockDataValid = mock && mock.schemas && mock.schemas.length > 0;

    if (mockDataValid) {
      const params: any = generateMockSaveParams();

      saveMock(params, () => {
        publishPageContent();
      });
    } else {
      publishPageContent();
    }

    handlePageCapture(versionId);
  };

  return (
    <>
      {mock?.enable && (
        <StyledIcon style={{ backgroundColor: '#ffffff', color: '#ff5918', cursor: 'default' }}>
          <BugFilled />
          <IconMsg>{mockI18n.mockMode}</IconMsg>
        </StyledIcon>
      )}
      <DSL />
      <HTML />
      <Mock />
      <More />
      <Preview />
      <Save loading={saveLoading} editStatus={editStatus} onSave={handleSave} />
      <Publish loading={publishLoading} onPublish={handlePublish} />
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Catalog);
