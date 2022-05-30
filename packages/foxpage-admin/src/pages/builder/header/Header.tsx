import React, { CSSProperties, useCallback, useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  BugOutlined,
  CloudUploadOutlined,
  CodeOutlined,
  EyeOutlined,
  FileSearchOutlined,
  LeftOutlined,
  MoreOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Layout, Popover } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import { updateDslModalOpen, updateMockModalVisible } from '@/actions/builder/more';
import * as MOCK_ACTIONS from '@/actions/builder/more';
import * as ACTIONS from '@/actions/builder/template';
import { updatePageCopyModalOpen } from '@/actions/builder/template-select';
import { FileTypeEnum } from '@/constants/global';
import { PageParam } from '@/types/builder/page';

import { PublishIcon } from '../../common/CustomIcon';
import GlobalContext from '../../GlobalContext';
import PreviewModal from '../modal/Preview';
import More from '../more';
import PageCopy from '../template/PageCopy';

import { PagePreview, TemplateSwitch, ViewModel, Zoom } from './tools';

const { Header } = Layout;

const StyledHeader = styled(Header)`
  background: rgb(255, 255, 255) !important;
  border-bottom: 1px solid rgb(242, 242, 242);
  display: flex;
  -webkit-box-pack: justify;
  justify-content: space-between;
  -webkit-box-align: center;
  align-items: center;
  z-index: 100;
  line-height: 52px;
  height: 52px;
  padding: 0;
`;

export const IconContainer = styled.div`
  min-width: 44px;
  font-size: 16px;
  text-align: center;
  position: relative;
  padding: 5px 8px 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  color: rgb(91, 107, 115);
  border-top: 2px solid transparent;
  background-color: transparent;
  cursor: pointer;
  justify-content: center;
  align-items: center;
  &:hover {
    color: rgb(65, 80, 88);
    background-color: rgb(242, 242, 242);
  }
  &.disabled {
    cursor: not-allowed;
    color: rgb(195, 193, 193);
    background-color: inherit;
  }
  &.selected {
    background-color: rgb(242, 242, 242);
  }
`;

export const IconMsg = styled.p`
  font-size: 12px;
  font-weight: 500;
  margin: 0;
  line-height: 28px;
  user-select: none;
`;

const Part = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  .ant-popover-inner-content {
    padding: 0;
  }
`;

const MoreItem = styled.div`
  line-height: 32px;
  cursor: pointer;
  padding: 0 24px;
  font-size: 12px;
  width: 100px;
  border-bottom: 1px solid #e8e8e8;
  &:hover {
    color: rgb(24, 144, 255);
    background-color: rgb(242, 242, 242);
  }
  &:last-of-type {
    border-bottom: none;
  }
`;

const activeIconStyle: CSSProperties = {
  color: '#1890ff',
};

const mapStateToProps = (store: RootState) => ({
  appInfo: store.group.application.settings.application,
  versionType: store.builder.template.versionType,
  editStatus: store.builder.template.editStatus,
  lastStepStatus: store.builder.template.lastStepStatus,
  nextStepStatus: store.builder.template.nextStepStatus,
  saveLoading: store.builder.template.saveLoading,
  publishLoading: store.builder.template.publishLoading,
  applicationId: store.builder.page.applicationId,
  contentId: store.builder.page.contentId,
  mockModeEnable: store.builder.more.mockModeEnable,
  mockData: store.builder.more.mock,
  pageLocale: store.builder.page.locale,
});

const mapDispatchToProps = {
  publish: ACTIONS.publish,
  updatePageCopyModalOpen: updatePageCopyModalOpen,
  saveToServer: ACTIONS.saveToServer,
  goLastStep: ACTIONS.goLastStep,
  goNextStep: ACTIONS.goNextStep,
  updateDslModalOpen: updateDslModalOpen,
  updateMockModalVisible: updateMockModalVisible,
  saveMockToServer: MOCK_ACTIONS.addMock,
};

interface UrlParams extends PageParam {
  from: string;
}

type HeaderType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Index: React.FC<HeaderType> = (props) => {
  const {
    applicationId,
    appInfo,
    pageLocale,
    contentId,
    versionType,
    editStatus,
    lastStepStatus = false,
    nextStepStatus = false,
    saveLoading,
    publishLoading,
    mockModeEnable,
    mockData,
    publish,
    updatePageCopyModalOpen,
    saveToServer,
    goLastStep,
    goNextStep,
    updateDslModalOpen,
    updateMockModalVisible,
    saveMockToServer,
  } = props;

  const history = useHistory();
  const { folderId, fileId, contentId: _contentId } = useParams<UrlParams>();
  const { locale } = useContext(GlobalContext);
  const { global, builder, version } = locale.business;

  const { state } = useLocation<any>();

  const handleBack = () => {
    let pathname: string;
    let search = '';
    if (state?.backPathname) {
      pathname = state.backPathname;
      search = state?.backSearch || '';
    } else {
      if (_contentId) {
        pathname = '/workspace/project/content';
        search = `?applicationId=${applicationId}&folderId=${folderId}&fileId=${fileId}`;
      } else if (fileId) {
        pathname = '/workspace/project/detail';
        search = `?applicationId=${applicationId}&folderId=${folderId}`;
      } else {
        pathname = '/workspace/project/list';
      }
    }
    history.push({ pathname, search });
  };

  const generateMockSaveParams = useCallback(() => {
    return {
      applicationId,
      folderId: folderId || '',
      contentId: contentId || '',
      name: `mock_${contentId}`,
      content: {
        ...mockData,
        enable: mockModeEnable,
      },
    };
  }, [applicationId, folderId, contentId, mockData, mockModeEnable]);

  const handleSave = useCallback(() => {
    if (editStatus) {
      const mockDataValid = mockData.schemas && mockData.schemas.length > 0;

      if (mockDataValid) {
        const params = generateMockSaveParams();
        saveMockToServer(params, () => {
          // save whole page
          saveToServer(applicationId);
        });
      } else {
        // save whole page
        saveToServer(applicationId);
      }
    }
  }, [editStatus, mockData, generateMockSaveParams, saveMockToServer, saveToServer, applicationId]);

  const handlePublish = useCallback(() => {
    const mockDataValid = mockData.schemas && mockData.schemas.length > 0;
    if (mockDataValid) {
      const params = generateMockSaveParams();
      saveMockToServer(params, () => {
        publish(applicationId);
      });
    } else {
      publish(applicationId);
    }
  }, [mockData, generateMockSaveParams, saveMockToServer, publish, applicationId]);

  return (
    <React.Fragment>
      <StyledHeader>
        <Part>
          <span
            style={{
              color: '#5E6B73',
              padding: '0 16px',
              cursor: 'pointer',
            }}
            onClick={handleBack}>
            <LeftOutlined />
          </span>
          <TemplateSwitch />
        </Part>

        <Part style={{ flex: 1 }}>
          {versionType === FileTypeEnum.page && (
            <IconContainer
              onClick={() => {
                updatePageCopyModalOpen(true);
              }}>
              <FileSearchOutlined />
              <IconMsg>{builder.pageStore}</IconMsg>
            </IconContainer>
          )}
        </Part>
        <Part style={{ flex: 1 }}>
          <ViewModel />
          <Zoom />
        </Part>
        <Part style={{ flex: 1 }}>
          <IconContainer
            className={lastStepStatus ? '' : 'disabled'}
            onClick={() => {
              if (lastStepStatus) {
                goLastStep(applicationId);
              }
            }}>
            <ArrowLeftOutlined />
            <IconMsg>{builder.lastStep}</IconMsg>
          </IconContainer>
          <IconContainer
            className={nextStepStatus ? '' : 'disabled'}
            onClick={() => {
              if (nextStepStatus) {
                goNextStep(applicationId);
              }
            }}>
            <ArrowRightOutlined />
            <IconMsg>{builder.nextStep}</IconMsg>
          </IconContainer>
        </Part>
        <Part style={{ flex: 1, justifyContent: 'flex-end', paddingRight: 12 }}>
          <Popover
            placement="bottom"
            overlayClassName="foxpage-builder-header_popover"
            trigger={['hover']}
            content={
              <>
                <MoreItem
                  onClick={() => {
                    updateDslModalOpen(true);
                  }}>
                  <CodeOutlined style={{ marginRight: 4 }} />
                  DSL
                </MoreItem>
                <MoreItem
                  onClick={() => {
                    updateMockModalVisible(true);
                  }}>
                  <BugOutlined style={{ marginRight: 4 }} />
                  Mock
                </MoreItem>
              </>
            }>
            <IconContainer>
              <MoreOutlined rotate={90} />
              <IconMsg>{builder.more}</IconMsg>
            </IconContainer>
          </Popover>
          {versionType === 'page' && (
            <Popover
              placement="bottomLeft"
              overlayClassName="foxpage-builder-header_popover foxpage-builder-header_preview_popover"
              trigger={['hover']}
              style={{ width: 300 }}
              content={
                <PagePreview
                  appInfo={appInfo}
                  mockModeEnable={mockModeEnable}
                  contentId={contentId}
                  pageLocale={pageLocale}
                />
              }>
              <IconContainer>
                <EyeOutlined />
                <IconMsg>{builder.preview}</IconMsg>
              </IconContainer>
            </Popover>
          )}
          <IconContainer className={editStatus ? '' : 'disabled'} onClick={handleSave}>
            {saveLoading ? <SyncOutlined spin={true} style={activeIconStyle} /> : <CloudUploadOutlined />}
            <IconMsg>{global.save}</IconMsg>
          </IconContainer>
          <IconContainer onClick={handlePublish}>
            {publishLoading ? <SyncOutlined spin={true} style={activeIconStyle} /> : <PublishIcon />}
            <IconMsg>{version.publish}</IconMsg>
          </IconContainer>
        </Part>
      </StyledHeader>

      {versionType === FileTypeEnum.page && <PreviewModal />}
      <PageCopy />
      <More />
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);
