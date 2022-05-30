import React, { CSSProperties, useEffect, useState } from 'react';

import styled from 'styled-components';

import { FoxpageComponentType } from '@foxpage/foxpage-js-sdk';

import {
  ComponentAddParams,
  ComponentSourceMapType,
  ComponentStructure,
  Drop,
  FoxpageI18n,
} from '@/types/component';

import DropContext from './dnd/DropContext';
import zhCN from './i18n/language/zh-cn.json';
import CalibrationLine from './label/CalibrationLine';
// import HoveredLabel from './label/HoveredLabel';
import SelectedLabel from './label/SelectedLabel';
import ComponentDrawer from './toolbar/components/Drawer';
import { ComponentFocus } from './ComponentFocus';
import {
  ADD_COMPONENT,
  CHANGE_COMPONENT_LIST_DRAWER,
  COPY_COMPONENT,
  DELETE_COMPONENT,
  INIT_DATA,
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
  SET_MOCK_DATA,
  SET_SELECT_COMPONENT,
  SET_VIEWER_CONTAINER_STYLE,
  SET_ZOOM,
  UPDATE_EDITOR_VALUE,
  UPDATE_WRAPPER_PROPS,
} from './constant';
import Editor from './editor';
import { FileTypeEnum } from './enum';
import i18n from './i18n';
import Page from './page';
import { postMsg } from './post-message';
import { getComponentList, loadComponent } from './utils';
import ViewerContext from './viewerContext';

import './common.css';

const StyledLayout = styled.div`
  display: flex;
  height: 100%;
`;

const StyledSlider = styled.div`
  flex: 0 0 300px;
  background: rgb(255, 255, 255);
`;

const Container = styled.div`
  position: relative;
  overflow: auto;
  flex-grow: 1;
  padding: 20px;
`;

const ViewContainer = styled.div`
  margin: 0 auto;
  max-width: 1160px;
  transition: all 0.3s ease 0s;
  user-select: none;
  background-color: #ffffff;
  box-shadow: rgba(0, 0, 0, 0.05) 0 0 6px 2px;
`;

const Viewer = () => {
  const [updateTime, setUpdateTime] = useState(0);
  const [zoom, setZoom] = useState<number>(1);
  const [foxpageI18n, setFoxpageI18n] = useState<FoxpageI18n>(zhCN);
  const [containerStyle, setContainerStyle] = useState<CSSProperties>({});
  const [viewerContainerStyle, setViewerContainerStyle] = useState<CSSProperties>({});
  const [fileType, setFileType] = useState<FileTypeEnum>(FileTypeEnum.page);
  const [componentStructure, setComponentStructure] = useState<ComponentStructure[]>([]);
  const [componentList, setComponentList] = useState<ComponentStructure[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<ComponentStructure | undefined>();
  const [selectedWrapperComponent, setSelectedWrapperComponent] = useState<ComponentStructure | undefined>();
  // const [hoveredComponent, setHoveredComponent] = useState<ComponentStructure | undefined>();
  const [loadedComponent, setLoadedComponent] = useState<Record<string, FoxpageComponentType>>({});
  const [calibrationLineState, setCalibrationLineState] = useState<{
    visible: boolean;
    dndParams?: Drop;
  }>({ visible: false });
  const [componentDrawerStatus, setComponentDrawerStatus] = useState(false);
  const [allComponents, setAllComponents] = useState();
  const [locale, setLocale] = useState('');
  const [mockModeEnable, setMockModeEnable] = useState(false);
  const defaultHeight = document.getElementById('foxpage-visual-main')?.getBoundingClientRect()?.height || 0;
  // disable a link jump timeinterval
  let disableALinkInterval: any = null;

  const handleUpdateTime = () => {
    setTimeout(() => {
      setUpdateTime(new Date().getTime());
    }, 300);
  };

  useEffect(() => {
    if (!disableALinkInterval) {
      const node = document.getElementById('foxpage-visual-main')?.ownerDocument;
      if (!node) {
        return;
      }
      disableALinkInterval = setInterval(() => {
        const aList = [...Array.from(node?.getElementsByTagName('a'))];
        aList.forEach((item) => {
          item.onclick = function stop() {
            return false;
          };
        });
      }, 1000);
    }
    return function() {
      clearInterval(disableALinkInterval);
    };
  }, []);

  useEffect(() => {
    document.cookie = `foxpage_builder_locale=${locale}; expires=${new Date(
      new Date().getTime() + 24 * 60 * 60 * 1000,
    )}`;
  }, [locale]);

  const messageListener = (event: MessageEvent) => {
    const { data } = event;
    const { type } = data;
    switch (type) {
      case INIT_DATA: {
        setLocale(data.locale);
        setAllComponents(data.allComponents);
        break;
      }
      case REQUIRE_LOAD_COMPONENT:
        const { requireLoad, componentSource, renderStructure, fileType } = data;
        setLocale(data.locale);
        setFileType(fileType);
        load(renderStructure, {
          requireLoad,
          componentSource,
          locale: data.locale,
        });
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
        handleUpdateTime();
        setZoom(data.zoom);
        break;
      case SET_VIEWER_CONTAINER_STYLE:
        handleUpdateTime();
        setViewerContainerStyle(data.style);
        break;
      case SET_FOXPAGE_LOCALE:
        // portal i18n
        handleUpdateTime();
        setFoxpageI18n(i18n[data.locale]);
        break;
      case CHANGE_COMPONENT_LIST_DRAWER: {
        setComponentDrawerStatus(data.status);
        break;
      }
      case SET_MOCK_DATA: {
        setMockModeEnable(data.enable);
        break;
      }
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('message', messageListener, false);
    window.addEventListener('resize', handleUpdateTime);
    return () => {
      window.removeEventListener('message', messageListener);
      window.removeEventListener('resize', handleUpdateTime);
    };
  }, []);

  const load = async (
    structure: ComponentStructure[],
    opt: {
      requireLoad: boolean;
      componentSource: ComponentSourceMapType;
      locale?: string;
    },
  ) => {
    if (opt.requireLoad && structure.length > 0) {
      const { loadedComponent, noResourceComponentName, componentList } = await loadComponent(
        structure,
        opt.componentSource,
      );
      setLoadedComponent(loadedComponent);
      setComponentList(componentList);
      postMessage(LOAD_FINISH, { noResourceComponentName });
      return;
    }
    postMessage(LOAD_FINISH, { noResourceComponentName: [] });
  };

  const postMessage = (type: string, data: Record<string, unknown>) => {
    postMsg(type, data);
  };

  const handleComponentDrawerClose = () => {
    postMessage(CHANGE_COMPONENT_LIST_DRAWER, { status: false });
  };

  return (
    <ViewerContext.Provider value={{ loadedComponent, componentList, zoom, containerStyle, foxpageI18n }}>
      <StyledLayout>
        {componentDrawerStatus && (
          <ComponentDrawer allComponent={allComponents} onClose={handleComponentDrawerClose} />
        )}

        <Container id="foxpage-visual-main">
          <ViewContainer
            style={{
              ...viewerContainerStyle,
              height: 'auto',
              transform: `scale(${zoom})`,
              transformOrigin: zoom > 1 ? '0 0' : '50% 50%',
            }}>
            <DropContext
              showPlaceholder={(visible: boolean, dndParams: Drop) => {
                setCalibrationLineState({ visible, dndParams });
              }}
              addComponent={(params: ComponentAddParams) => {
                postMessage(ADD_COMPONENT, { ...params, addType: params.type });
              }}>
              <div
                style={{
                  ...containerStyle,
                  minHeight: defaultHeight > 0 ? defaultHeight - 50 : 'auto',
                }}
                id="foxpage-scroll-container">
                <ComponentFocus selectId={selectedComponent?.id || ''} />
                <Page
                  loadedComponents={loadedComponent}
                  renderStructure={componentStructure}
                  onClick={(id: string) => {
                    postMessage(SELECT_COMPONENT, { id });
                  }}
                  // onMouseOverComponentChange={(component?: ComponentStructure) => {
                  //   setHoveredComponent(component);
                  // }}
                />
              </div>
            </DropContext>
          </ViewContainer>
          <SelectedLabel
            key={updateTime}
            zoom={zoom}
            selectedComponent={selectedComponent}
            copyComponent={(id: string) => {
              postMessage(COPY_COMPONENT, { id });
            }}
            deleteComponent={(id: string) => {
              postMessage(DELETE_COMPONENT, { id });
            }}
            openConditionBind={() => {
              postMessage(OPEN_CONDITION_BIND, {});
            }}
            jumpToTemplate={() => {
              postMessage(SELECT_CONTENT, {});
            }}
          />
          <CalibrationLine {...calibrationLineState} zoom={zoom} />
          {/* <HoveredLabel hoveredComponent={hoveredComponent} /> */}
        </Container>

        <StyledSlider>
          <Editor
            fileType={fileType}
            selectedComponent={selectedComponent}
            selectedWrapperComponent={selectedWrapperComponent}
            loadedComponent={loadedComponent}
            mockModeEnable={mockModeEnable}
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
