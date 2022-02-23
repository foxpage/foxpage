import React, { CSSProperties, useContext } from 'react';
import { connect } from 'react-redux';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
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

import { updateDslModalOpen } from '@/actions/builder/more';
import * as ACTIONS from '@/actions/builder/template';
import { updatePageCopyModalOpen } from '@/actions/builder/template-select';
import { FileTypeEnum } from '@/constants/global';
import { PageParam } from '@/types/builder/page';
import { getLoginUser } from '@/utils/login-user';

import { PublishIcon } from '../common/CustomIcon';
import GlobalContext from '../GlobalContext';

import ViewModel from './headerButtons/ViewModel';
import Zoom from './headerButtons/Zoom';
import PreviewModal from './modal/Preview';
import PageCopy from './template/PageCopy';
import More from './more';

const { Header } = Layout;

const StyledHeader = styled(Header)`
  background: rgb(255, 255, 255) !important;
  box-shadow: rgb(100 100 100 / 20%) 0px 2px 3px 0px;
  border-bottom: 0px solid transparent;
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
  padding: 0px 8px;
  display: flex;
  flex-direction: column;
  height: 100%;
  color: rgb(91, 107, 115);
  border-top: 2px solid transparent;
  background-color: transparent;
  padding-top: 5px;
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
  margin: 0px;
  line-height: 28px;
  user-select: none;
`;

const Part = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const MoreItem = styled.div`
  line-height: 32px;
  cursor: pointer;
  padding: 0 24px;
  font-size: 12px;
  margin: -12px -16px;
  width: 100px;
  &:hover {
    color: rgb(24, 144, 255);
    background-color: rgb(242, 242, 242);
  }
`;

const activeIconStyle: CSSProperties = {
  color: '#1890ff',
};

const mapStateToProps = (store: RootState) => ({
  versionType: store.builder.template.versionType,
  editStatus: store.builder.template.editStatus,
  lastStepStatus: store.builder.template.lastStepStatus,
  nextStepStatus: store.builder.template.nextStepStatus,
  applicationId: store.builder.page.applicationId,
  saveLoading: store.builder.template.saveLoading,
  publishLoading: store.builder.template.publishLoading,
});

const mapDispatchToProps = {
  publish: ACTIONS.publish,
  updatePageCopyModalOpen: updatePageCopyModalOpen,
  saveToServer: ACTIONS.saveToServer,
  goLastStep: ACTIONS.goLastStep,
  goNextStep: ACTIONS.goNextStep,
  updateDslModalOpen: updateDslModalOpen,
  updatePreviewModalVisible: ACTIONS.updatePreviewModalVisible,
};

type HeaderType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Index: React.FC<HeaderType> = props => {
  const {
    applicationId,
    versionType,
    editStatus,
    lastStepStatus = false,
    nextStepStatus = false,
    saveLoading,
    publishLoading,
    publish,
    updatePageCopyModalOpen,
    saveToServer,
    goLastStep,
    goNextStep,
    updateDslModalOpen,
    updatePreviewModalVisible,
  } = props;
  const history = useHistory();
  const { organizationId } = getLoginUser();
  const { folderId, fileId, contentId } = useParams<PageParam>();
  const { locale } = useContext(GlobalContext);
  const { global, builder, version } = locale.business;

  const { state } = useLocation();

  const handleBack = () => {
    let pathname = '';
    let search = '';
    if (state?.backPathname) {
      search = state?.backSearch;
      pathname = state.backPathname;
    } else if (contentId) {
      pathname = `/organization/${organizationId}/project/${applicationId}/folder/${folderId}/file/${fileId}/content/`;
    } else if (fileId) {
      pathname = `/organization/${organizationId}/project/${applicationId}/folder/${folderId}/`;
    } else {
      pathname = `/organization/${organizationId}/project/`;
    }
    history.push({ pathname, search });
  };

  return (
    <React.Fragment>
      <StyledHeader>
        <span
          style={{ position: 'absolute', color: '#5E6B73', padding: '0 8px', marginLeft: 18, cursor: 'pointer' }}
          onClick={handleBack}
        >
          <LeftOutlined />
        </span>

        <Part style={{ flex: 2 }}>
          {versionType === FileTypeEnum.page && (
            <IconContainer
              onClick={() => {
                updatePageCopyModalOpen(true);
              }}
            >
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
            }}
          >
            <ArrowLeftOutlined />
            <IconMsg>{builder.lastStep}</IconMsg>
          </IconContainer>
          <IconContainer
            className={nextStepStatus ? '' : 'disabled'}
            onClick={() => {
              if (nextStepStatus) {
                goNextStep(applicationId);
              }
            }}
          >
            <ArrowRightOutlined />
            <IconMsg>{builder.nextStep}</IconMsg>
          </IconContainer>
        </Part>
        <Part style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Popover
            placement="bottom"
            content={
              <>
                <MoreItem
                  onClick={() => {
                    updateDslModalOpen(true);
                  }}
                >
                  <CodeOutlined style={{ marginRight: 4 }} />
                  DSL
                </MoreItem>
              </>
            }
            trigger={['click']}
          >
            <IconContainer>
              <MoreOutlined rotate={90} />
              <IconMsg>{builder.more}</IconMsg>
            </IconContainer>
          </Popover>
          {versionType === 'page' && (
            <IconContainer
              onClick={() => {
                updatePreviewModalVisible(true);
              }}
            >
              <EyeOutlined />
              <IconMsg>{builder.preview}</IconMsg>
            </IconContainer>
          )}
          <IconContainer
            className={editStatus ? '' : 'disabled'}
            onClick={() => {
              if (editStatus) {
                saveToServer(applicationId);
              }
            }}
          >
            {saveLoading ? <SyncOutlined spin={true} style={activeIconStyle} /> : <CloudUploadOutlined />}
            <IconMsg>{global.save}</IconMsg>
          </IconContainer>
          <IconContainer
            onClick={() => {
              publish(applicationId);
            }}
          >
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
