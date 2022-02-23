import React, { CSSProperties, useEffect, useState } from 'react';

import { Layout } from 'antd';
import styled from 'styled-components';

import { FoxpageComponentType } from '@foxpage/foxpage-js-sdk';

import zhCN from './i18n/zh-cn';
import CalibrationLine from './label/CalibrationLine';
import HoveredLabel from './label/HoveredLabel';
import SelectedLabel from './label/SelectedLabel';
import { getComponentList, loadComponent } from './utils/component-load';
import {
  ADD_COMPONENT,
  COPY_COMPONENT,
  DELETE_COMPONENT,
  LOAD_FINISH,
  OPEN_CONDITION_BIND,
  OPEN_VARIABLE_BIND,
  REQUIRE_LOAD_COMPONENT,
  SAVE_COMPONENT,
  SELECT_COMPONENT,
  SELECT_CONTENT,
  SET_COMPONENT_STRUCTURE,
  SET_CONTAINER_STYLE,
  SET_FOXPAGE_LOCALE,
  SET_SELECT_COMPONENT,
  SET_VIEWER_CONTAINER_STYLE,
  SET_ZOOM,
  UPDATE_EDITOR_VALUE,
  UPDATE_WRAPPER_PROPS,
} from './constant';
import Editor from './editor';
import { FileTypeEnum } from './enum';
import i18n from './i18n';
import {
  ComponentAddParams,
  ComponentSourceMapType,
  ComponentStructure,
  Drop,
  FoxpageI18n,
  OffsetType,
} from './interface';
import Page from './page';
import ViewerContext from './viewerContext';

import './common.css';

const { Sider, Content } = Layout;

const StyledLayout = styled(Layout)`
  display: flex;
  -webkit-box-pack: justify;
  justify-content: space-between;
  -webkit-box-align: center;
  align-items: center;
  padding: 0;
  background: rgb(255, 255, 255);
  height: 100%;
  margin-right: 300px;
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
  position: absolute;
  right: 0;
  .ant-layout-sider-children {
    width: 100%;
  }
  .ant-layout-sider-trigger {
    display: none;
  }
`;

const StyledContent = styled(Content)`
  height: 100%;
  position: relative;
  background-color: rgb(245, 245, 245);
  padding: 12px 0;
`;

const Container = styled.div`
  height: 100%;
  margin: 0 auto;
  overflow-y: auto;
`;

const ScrollContainer = styled.div`
  height: 100%;
  position: relative;
  margin: 0 auto;
`;

const ViewContainer = styled.div`
  overflow: auto;
  margin: 0 auto;
  max-height: 100%;
  height: 100%;
`;

const Viewer = () => {
  const [zoom, setZoom] = useState<number>(1);
  const [foxpageI18n, setFoxpageI18n] = useState<FoxpageI18n>(zhCN);
  const [containerStyle, setContainerStyle] = useState<CSSProperties>({});
  const [viewerContainerStyle, setViewerContainerStyle] = useState<CSSProperties>({});
  const [fileType, setFileType] = useState<FileTypeEnum>(FileTypeEnum.page);
  const [componentStructure, setComponentStructure] = useState<ComponentStructure[]>([]);
  const [componentList, setComponentList] = useState<ComponentStructure[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<ComponentStructure | undefined>();
  const [selectedWrapperComponent, setSelectedWrapperComponent] = useState<ComponentStructure | undefined>();
  const [hoveredComponent, setHoveredComponent] = useState<ComponentStructure | undefined>();
  const [loadedComponent, setLoadedComponent] = useState<Record<string, FoxpageComponentType>>({});
  const [calibrationLineState, setCalibrationLineState] = useState<{
    visible: boolean;
    dndParams?: Drop;
    offSet: { scrollX: number; scrollY: number };
  }>({ visible: false, offSet: { scrollX: 0, scrollY: 0 } });

  const messageListener = (event: MessageEvent) => {
    const { data } = event;
    const { type } = data;
    switch (type) {
      case REQUIRE_LOAD_COMPONENT:
        const { requireLoad, componentSource, renderStructure, fileType } = data;
        setFileType(fileType);
        load(requireLoad, componentSource, renderStructure);
        break;
      case SET_COMPONENT_STRUCTURE:
        setComponentList(getComponentList(data.renderStructure));
        setComponentStructure(data.renderStructure);
        break;
      case SET_SELECT_COMPONENT:
        setSelectedComponent(data.selectedComponent);
        setSelectedWrapperComponent(data.selectedWrapperComponent);
        break;
      case SET_CONTAINER_STYLE:
        setContainerStyle(data.containerStyle);
        break;
      case SET_ZOOM:
        setZoom(data.zoom);
        break;
      case SET_VIEWER_CONTAINER_STYLE:
        setViewerContainerStyle(data.style);
        break;
      case SET_FOXPAGE_LOCALE:
        setFoxpageI18n(i18n[data.locale]);
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('message', messageListener, false);
    return () => {
      window.removeEventListener('message', messageListener);
    };
  }, []);

  const load = async (
    requireLoad: boolean,
    componentSource: ComponentSourceMapType,
    structure: ComponentStructure[],
  ) => {
    if (requireLoad && structure.length > 0 && Object.keys(componentSource).length > 0) {
      const { loadedComponent, noResourceComponentName, componentList } = await loadComponent(
        structure,
        componentSource,
      );
      setLoadedComponent(loadedComponent);
      setComponentList(componentList);
      postMessage(LOAD_FINISH, { noResourceComponentName });
    }
  };

  const postMessage = (type: string, data: Record<string, unknown>) => {
    window.parent.postMessage({
      ...data,
      type,
    });
  };

  return (
    <ViewerContext.Provider value={{ loadedComponent, componentList, zoom, containerStyle, foxpageI18n }}>
      <StyledLayout>
        <StyledContent>
          <ViewContainer style={viewerContainerStyle}>
            <Container style={containerStyle}>
              <ScrollContainer style={{ transform: `scale(${zoom})`, transformOrigin: zoom > 1 ? '0 0' : '50% 50%' }}>
                <Page
                  loadedComponents={loadedComponent}
                  renderStructure={componentStructure}
                  onClick={(id: string) => {
                    postMessage(SELECT_COMPONENT, { id });
                  }}
                  showPlaceholder={(visible: boolean, dndParams: Drop, offSet: OffsetType) => {
                    setCalibrationLineState({ visible, dndParams, offSet });
                  }}
                  addComponent={(params: ComponentAddParams) => {
                    postMessage(ADD_COMPONENT, { ...params, addType: params.type });
                  }}
                  onMouseOverComponentChange={(component?: ComponentStructure) => {
                    setHoveredComponent(component);
                  }}
                  onDoubleClick={() => {
                    postMessage(SELECT_CONTENT, {});
                  }}
                />
                <SelectedLabel
                  selectedComponent={selectedComponent}
                  copyComponent={(id: string) => {
                    postMessage(COPY_COMPONENT, { id });
                  }}
                  deleteComponent={(id: string) => {
                    postMessage(DELETE_COMPONENT, { id });
                  }}
                  openConditionBind={() => {
                    console.log('OPEN_CONDITION_BIND');
                    postMessage(OPEN_CONDITION_BIND, {});
                  }}
                />
                <CalibrationLine {...calibrationLineState} />
                <HoveredLabel hoveredComponent={hoveredComponent} />
              </ScrollContainer>
            </Container>
          </ViewContainer>
        </StyledContent>

        <StyledSlider width={300}>
          <Editor
            fileType={fileType}
            selectedComponent={selectedComponent}
            selectedWrapperComponent={selectedWrapperComponent}
            loadedComponent={loadedComponent}
            setVariableBindModalVisibleStatus={(keys, opt) => {
              postMessage(OPEN_VARIABLE_BIND, { keys, opt });
            }}
            saveComponent={(isWrapper: boolean) => {
              postMessage(SAVE_COMPONENT, { isWrapper });
            }}
            updateEditorValue={(key, value) => {
              postMessage(UPDATE_EDITOR_VALUE, { key, value });
            }}
            updateWrapperProps={(key, value) => {
              postMessage(UPDATE_WRAPPER_PROPS, { key, value });
            }}
          />
        </StyledSlider>
      </StyledLayout>
    </ViewerContext.Provider>
  );
};

export default Viewer;
