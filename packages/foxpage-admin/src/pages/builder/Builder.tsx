import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { Layout, Modal, Spin } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import { loadComponent } from '@/actions/builder/component-load';
import { selectContent } from '@/actions/builder/page';
import * as ACTIONS from '@/actions/builder/template';
import { updatePageCopyModalOpen } from '@/actions/builder/template-select';
import { FileTypeEnum } from '@/constants/global';
import { ComponentStructure } from '@/types/builder';
import { OffsetType } from '@/types/builder/page';
import { IWindow } from '@/types/index';
import { getProjectFile } from '@/utils/project/file';

import Viewer from '../viewer';

import ComponentListDrawer from './drawer/componentList';
import CalibrationLine from './label/CalibrationLine';
import HoveredLabel from './label/HoveredLabel';
import SelectedLabel from './label/SelectedLabel';
import PageTemplateSelect from './template/PageTemplateSelect';
import BuilderContext from './BuilderContext';
import { viewModelHeight, viewModelWidth } from './constant';
import Editor from './editor';
import PageList from './pageList';
import Structure from './structure';
import ToolBar from './ToolBar';

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
  width: 100%;
  height: 100%;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
`;

const mapStateToProps = (store: RootState) => ({
  versionChange: store.builder.template.versionChange,
  storeContentId: store.builder.page.contentId,
  viewModel: store.builder.template.viewModel,
  zoom: store.builder.template.zoom,
  componentList: store.builder.template.parsedComponentList,
  loadedComponent: store.builder.viewer.loadedComponent,
  renderStructure: store.builder.template.renderStructure,
  parsedRenderStructure: store.builder.template.parsedRenderStructure,
  version: store.builder.template.version,
  templateLoading: store.builder.viewer.loading,
  componentLoading: store.builder.template.loading,
  relations: store.builder.template.relations,
  fileType: store.builder.page.fileType,
  noResourceComponentNames: store.builder.viewer.noResourceComponentNames,
  pageLoading: store.builder.page.loading,
  requireLoad: store.builder.viewer.requireLoad,
});

const mapDispatchToProps = {
  fetchTree: ACTIONS.fetchPageRenderTree,
  loadComponent: loadComponent,
  setSelectedId: ACTIONS.setSelectedComponent,
  setHoveredComponent: ACTIONS.setHoveredComponent,
  insertComponent: ACTIONS.insertComponent,
  appendComponent: ACTIONS.appendComponent,
  closeComponentEditor: ACTIONS.setComponentEditor,
  selectContent: selectContent,
  clearAll: ACTIONS.clearAll,
  updatePageCopyModalOpen: updatePageCopyModalOpen,
  clearResource: ACTIONS.clearResource,
};

type BuilderProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Index: React.FC<BuilderProps> = props => {
  const [frameWindow, setWin] = useState<IWindow | undefined>(undefined);
  const [currentMenu, setCurMenu] = useState<'component' | undefined>(undefined);
  const [containerStyle, setContainerStyle] = useState<CSSProperties>({
    height: '100%',
    width: '100%',
  });
  const [calibrationLineState, setCalibrationLineState] = useState<{
    visible: boolean;
    dndParams: any;
    offSet: { scrollX: number; scrollY: number };
  }>({ visible: false, offSet: { scrollX: 0, scrollY: 0 }, dndParams: {} });
  const containerRef = useRef<any>(null);

  const { applicationId } = useParams<{ applicationId: string }>();

  const {
    zoom,
    viewModel = 'PC',
    componentList = [],
    loadedComponent = {},
    renderStructure = [],
    parsedRenderStructure = [],
    storeContentId,
    version = { content: { schemas: [{ props: {} }] } },
    versionChange,
    relations = [],
    fileType,
    templateLoading,
    componentLoading,
    noResourceComponentNames,
    pageLoading,
    requireLoad,
    fetchTree,
    loadComponent,
    setSelectedId,
    insertComponent,
    appendComponent,
    closeComponentEditor,
    setHoveredComponent,
    selectContent,
    clearAll,
    updatePageCopyModalOpen,
    clearResource,
  } = props;

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  useEffect(() => {
    if (noResourceComponentNames.length > 0) {
      Modal.warning({
        title: 'Please add these component to your application',
        content: noResourceComponentNames.map(name => <p>{name}</p>),
      });
    }
  }, [noResourceComponentNames]);

  useEffect(() => {
    if (storeContentId) {
      const file = getProjectFile();
      fetchTree(applicationId, storeContentId, fileType || file.type);
    }
  }, [storeContentId]);

  useEffect(() => {
    if (frameWindow && requireLoad) {
      loadComponent(frameWindow);
    }
  }, [frameWindow, requireLoad]);

  useEffect(() => {
    if (frameWindow && containerStyle) {
      Object.entries(containerStyle).forEach((item: any) => {
        frameWindow.document.body.style[item[0]] = Number.isNaN(Number(item[1])) ? item[1] : `${item[1]}px`;
      });
      frameWindow.document.body.style.margin = '0 auto';
    }
  }, [frameWindow, containerStyle]);

  useEffect(() => {
    if (version && version.content && version.content.schemas && version.content.schemas.length > 0) {
      setContainerStyle({
        ...version.content.schemas[0].props,
      });
    }
  }, [versionChange]);

  const handleFrameLoaded = (win: IWindow) => {
    setWin(win);
  };

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

          <div ref={containerRef} style={{ height: '100%', padding: '12px 0' }}>
            <div
              style={{
                position: 'relative',
                overflow: 'hidden',
                margin: '0 auto',
                width: viewModelWidth[viewModel],
                height: viewModelHeight[viewModel],
                maxHeight: '100%',
              }}
            >
              <Viewer
                key={storeContentId}
                frameLoaded={handleFrameLoaded}
                loadedComponents={loadedComponent}
                renderStructure={parsedRenderStructure}
                win={frameWindow}
                containerProps={{ style: containerStyle }}
                zoom={zoom}
                onClick={(id: string) => {
                  setSelectedId(id);
                }}
                showPlaceholder={(visible: boolean, dndParams: any, offSet: OffsetType) => {
                  if (visible) {
                    setCurMenu(undefined);
                  }
                  closeComponentEditor();
                  setCalibrationLineState({ visible, dndParams, offSet });
                }}
                addComponent={(
                  type: 'insert' | 'append',
                  componentId: string,
                  position: number,
                  desc: any,
                  parentId: string,
                ) => {
                  type === 'insert'
                    ? insertComponent(applicationId, componentId, position, desc, parentId)
                    : appendComponent(applicationId, componentId, desc);
                }}
                onMouseOverComponentChange={setHoveredComponent}
                onDoubleClick={(component: ComponentStructure) => {
                  if (component.belongTemplate) {
                    setHoveredComponent(undefined);
                    clearResource({
                      onSuccess: () => {
                        selectContent({ applicationId, contentId: relations[0].id, locale: '', fileType: 'template' });
                      },
                    });
                  }
                }}
              />
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
                      Click to select page
                    </div>
                  </SelectTemplateText>
                )}

              {calibrationLineState && <CalibrationLine {...calibrationLineState} />}
              <ComponentListDrawer
                container={containerRef.current}
                visible={currentMenu === 'component'}
                onClose={() => {
                  setCurMenu(undefined);
                }}
                showPlaceholder={(visible: boolean, dndParams: any, offSet: OffsetType) => {
                  if (visible) {
                    setCurMenu(undefined);
                  }
                  setCalibrationLineState({ visible, dndParams, offSet });
                }}
              />
              {frameWindow && <SelectedLabel win={frameWindow} />}
              <HoveredLabel win={frameWindow as IWindow} />
            </div>
            <ToolBar />
            <PageTemplateSelect />
          </div>
        </Content>
        <StyledSlider width={300}>
          <Editor />
        </StyledSlider>
      </BuilderContext.Provider>
    </StyledLayout>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);
