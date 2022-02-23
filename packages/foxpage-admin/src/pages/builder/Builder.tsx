import React, { CSSProperties, useContext, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { Layout, Spin } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/template';
import { updatePageCopyModalOpen } from '@/actions/builder/template-select';
import { FileTypeEnum } from '@/constants/global';
import GlobalContext from '@/pages/GlobalContext';
import { getProjectFile } from '@/utils/project/file';

import ComponentListDrawer from './drawer/componentList';
import PageTemplateSelect from './template/PageTemplateSelect';
import VariableBind from './variable/bind/VariableBind';
import BuilderContext from './BuilderContext';
import Editor from './editor';
import PageList from './pageList';
import Structure from './structure';
import ToolBar from './ToolBar';
import Viewer from './Viewer';

const { Sider, Content } = Layout;

const SelectTemplateText = styled.div`
  color: #cac6c6;
  font-size: 24px;
  position: absolute;
  z-index: 1;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  > div {
    padding: 24px 48px;
    border-radius: 4px;
    border: 1px dashed #dddddd;
    background: #fff;
    cursor: pointer;
    margin-right: 300px;
    &:hover {
      border-color: #1890ff;
    }
  }
`;

const StyledLayout = styled(Layout)`
  display: flex;
  -webkit-box-pack: justify;
  justify-content: space-between;
  -webkit-box-align: center;
  align-items: center;
  padding: 0;
  background: rgb(255, 255, 255);
  height: 100%;
  .ant-drawer {
    box-shadow: 6px 0 16px -8px rgb(0 0 0 / 8%), 9px 0 28px 0 rgb(0 0 0 / 5%), 12px 0 48px 16px rgb(0 0 0 / 3%);
  }
  .ant-drawer > * {
    transition: none !important;
  }
`;

const StyledSlider = styled(Sider)`
  display: flex;
  border-left: 1px solid rgb(219, 219, 219);
  border-right: 1px solid rgb(219, 219, 219);
  background: rgb(255, 255, 255);
  height: 100%;
  padding: 0;
  width: 100%;
  align-items: flex-start;
  z-index: 1;
  .ant-layout-sider-children {
    width: 100%;
  }
  .ant-layout-sider-trigger {
    display: none;
  }
`;

const LeftSliderContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
  height: 100%;
  flex-direction: column;
  > div {
    width: 100%;
    flex: 1;
  }
`;

const StyledSpin = styled(Spin)`
  width: calc(100% - 300px);
  height: 100%;
  margin-top: 48px !important;
  position: absolute !important;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
`;

const mapStateToProps = (store: RootState) => ({
  versionChange: store.builder.template.versionChange,
  storeContentId: store.builder.page.contentId,
  renderStructure: store.builder.template.renderStructure,
  version: store.builder.template.version,
  templateLoading: store.builder.viewer.loading,
  componentLoading: store.builder.template.loading,
  fileType: store.builder.page.fileType,
  pageLoading: store.builder.page.loading,
  selectedComponent: store.builder.template.selectedComponent,
});

const mapDispatchToProps = {
  fetchTree: ACTIONS.fetchPageRenderTree,
  clearAll: ACTIONS.clearAll,
  updatePageCopyModalOpen: updatePageCopyModalOpen,
};

type BuilderProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Index: React.FC<BuilderProps> = props => {
  const { locale } = useContext(GlobalContext);
  const { builder } = locale.business;
  const [currentMenu, setCurMenu] = useState<'component' | undefined>(undefined);
  const [containerStyle, setContainerStyle] = useState<CSSProperties>({
    height: '100%',
    width: '100%',
  });
  const containerRef = useRef<any>(null);

  const { applicationId } = useParams<{ applicationId: string }>();

  const {
    storeContentId,
    version = { content: { schemas: [{ props: {} }] } },
    versionChange,
    fileType,
    templateLoading,
    componentLoading,
    pageLoading,
    renderStructure,
    selectedComponent,
    fetchTree,
    clearAll,
    updatePageCopyModalOpen,
  } = props;

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  useEffect(() => {
    if (storeContentId) {
      const file = getProjectFile();
      fetchTree(applicationId, storeContentId, fileType || file.type);
    }
  }, [storeContentId]);

  useEffect(() => {
    if (version && version.content && version.content.schemas && version.content.schemas.length > 0) {
      setContainerStyle({
        ...version.content.schemas[0].props,
      });
    }
  }, [versionChange]);

  return (
    <StyledLayout hasSider>
      <BuilderContext.Provider value={{ currentMenu, setCurMenu, container: containerRef.current }}>
        <StyledSlider width={250} style={{ backgroundColor: '#fff' }}>
          <LeftSliderContainer>
            <PageList />
            <Structure />
          </LeftSliderContainer>
        </StyledSlider>
        <Content style={{ height: '100%', position: 'relative', backgroundColor: 'rgb(245, 245, 245)' }}>
          {(templateLoading || componentLoading || pageLoading) && <StyledSpin spinning={true} />}

          <div ref={containerRef} style={{ height: '100%' }}>
            <Viewer containerStyle={containerStyle} />
            {fileType === FileTypeEnum.page &&
              !templateLoading &&
              !componentLoading &&
              !pageLoading &&
              renderStructure.length === 0 && (
                <SelectTemplateText>
                  <div
                    onClick={() => {
                      updatePageCopyModalOpen(true);
                    }}
                  >
                    {builder.selectPage}
                  </div>
                </SelectTemplateText>
              )}

            <ComponentListDrawer
              container={containerRef.current}
              visible={currentMenu === 'component'}
              onClose={() => {
                setCurMenu(undefined);
              }}
              showPlaceholder={(visible: boolean) => {
                if (visible) {
                  setCurMenu(undefined);
                }
                // setCalibrationLineState({ visible, dndParams, offSet });
              }}
            />
            <ToolBar />
            <PageTemplateSelect />
          </div>
        </Content>
        {!selectedComponent?.id && (
          <StyledSlider style={{ position: 'absolute', right: 0, top: 52, bottom: 0, height: 'auto' }} width={300}>
            <Editor />
          </StyledSlider>
        )}
        <VariableBind />
      </BuilderContext.Provider>
    </StyledLayout>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);
