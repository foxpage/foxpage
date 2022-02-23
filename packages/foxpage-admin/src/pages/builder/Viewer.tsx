import React, { CSSProperties, useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { Modal } from 'antd';
import { RootState } from 'typesafe-actions';

import { updateLoadingStatus, updateRequireLoadStatus } from '@/actions/builder/component-load';
import { updateConditionBindDrawerVisible } from '@/actions/builder/condition';
import { selectContent } from '@/actions/builder/page';
import * as ACTIONS from '@/actions/builder/template';
import { setVariableBindModalVisibleStatus } from '@/actions/builder/variable';
import { EditorInputEnum } from '@/constants/variable';

import GlobalContext from '../GlobalContext';

import Condition from './editor/condition/Condition';
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
  UPDATE_SELECT_COMPONENT_LABEL,
  UPDATE_WRAPPER_PROPS,
 viewModelHeight, viewModelWidth } from './constant';

interface IProps {
  containerStyle?: CSSProperties;
}
const mapStateToProps = (store: RootState) => ({
  applicationId: store.builder.page.applicationId,
  contentId: store.builder.page.contentId,
  fileId: store.builder.page.fileId,
  folderId: store.builder.page.folderId,
  fileType: store.builder.page.fileType,
  renderStructure: store.builder.template.parsedRenderStructure,
  componentSource: store.builder.template.componentSourceMap,
  selectedComponent: store.builder.template.selectedComponent,
  selectedWrapperComponent: store.builder.template.selectedWrapperComponent,
  requireLoad: store.builder.viewer.requireLoad,
  relations: store.builder.template.relations,
  versionChange: store.builder.template.versionChange,
  zoom: store.builder.template.zoom,
  viewModel: store.builder.template.viewModel,
});

const mapDispatchToProps = {
  updateLoadingStatus: updateLoadingStatus,
  updateRequireLoadStatus: updateRequireLoadStatus,
  setSelectedComponent: ACTIONS.setSelectedComponent,
  deleteComponent: ACTIONS.deleteComponent,
  copyComponent: ACTIONS.copyComponent,
  selectContent: selectContent,
  insertComponent: ACTIONS.insertComponent,
  appendComponent: ACTIONS.appendComponent,
  saveComponent: ACTIONS.saveComponentEditorValue,
  updateEditorValue: ACTIONS.updateEditorValue,
  updateWrapperValue: ACTIONS.updateWrapperProps,
  setVariableBindModalVisibleStatus,
  updateConditionBindDrawerVisible,
};

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & IProps;

const Main: React.FC<Props> = props => {
  const {
    zoom = 1,
    applicationId,
    contentId,
    folderId,
    renderStructure,
    componentSource,
    requireLoad,
    selectedComponent,
    selectedWrapperComponent,
    relations = [],
    containerStyle,
    versionChange,
    fileType,
    viewModel,
    updateLoadingStatus,
    updateRequireLoadStatus,
    setSelectedComponent,
    selectContent,
    copyComponent,
    deleteComponent,
    insertComponent,
    appendComponent,
    saveComponent,
    updateEditorValue,
    updateWrapperValue,
    setVariableBindModalVisibleStatus,
    updateConditionBindDrawerVisible,
  } = props;
  const [frameWindow, setFrameWindow] = useState<Window | undefined>();
  const { locale } = useContext(GlobalContext);
  const messageListener = event => {
    const { data } = event;
    const { type } = data;
    switch (type) {
      case LOAD_FINISH:
        const { noResourceComponentName } = data;
        if (noResourceComponentName.length > 0) {
          Modal.warning({
            title: 'Please add these component to your application',
            content: noResourceComponentName.map(name => <p>{name}</p>),
          });
        }
        updateLoadingStatus(false);
        updateRequireLoadStatus(false);
        break;
      case SELECT_COMPONENT:
        setSelectedComponent(data.id);
        break;
      case DELETE_COMPONENT:
        deleteComponent(applicationId, data.id);
        break;
      case COPY_COMPONENT:
        copyComponent(applicationId, data.id);
        break;
      case SELECT_CONTENT:
        selectContent({ applicationId, contentId: relations[0].id, locale: '', fileType: 'template' });
        break;
      case ADD_COMPONENT:
        const { addType, componentId, desc, parentId, pos } = data;
        addType === 'insert'
          ? insertComponent(applicationId, componentId, pos, desc, parentId)
          : appendComponent(applicationId, componentId, desc);
        break;
      case SAVE_COMPONENT:
        const { isWrapper } = data;
        saveComponent({ applicationId, folderId, isWrapper });
        break;
      case UPDATE_EDITOR_VALUE:
        updateEditorValue(data.key, data.value);
        break;
      case UPDATE_WRAPPER_PROPS:
        updateWrapperValue(data.key, data.value);
        break;
      case OPEN_VARIABLE_BIND:
        setVariableBindModalVisibleStatus({
          open: true,
          type: data.opt?.type || EditorInputEnum.Text,
          keys: data.keys,
        });
        break;
      case OPEN_CONDITION_BIND:
        updateConditionBindDrawerVisible(true);
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
  }, [applicationId, relations]);

  useEffect(() => {
    if (requireLoad) {
      updateLoadingStatus(true);
      if (frameWindow) {
        postMessage(REQUIRE_LOAD_COMPONENT, {
          requireLoad,
          componentSource,
          renderStructure,
          fileType,
        });
      }
    }
  }, [requireLoad, frameWindow, renderStructure, componentSource]);

  useEffect(() => {
    if (renderStructure && frameWindow) {
      postMessage(SET_COMPONENT_STRUCTURE, { renderStructure });
    }
  }, [renderStructure, frameWindow]);

  useEffect(() => {
    if (frameWindow) {
      postMessage(SET_SELECT_COMPONENT, { selectedComponent, selectedWrapperComponent });
    }
  }, [selectedComponent, frameWindow]);

  useEffect(() => {
    if (frameWindow && containerStyle) {
      postMessage(SET_CONTAINER_STYLE, { containerStyle });
    }
  }, [frameWindow, containerStyle]);

  useEffect(() => {
    if (frameWindow) {
      postMessage(SET_ZOOM, { zoom: zoom || 1 });
    }
  }, [frameWindow, zoom]);

  useEffect(() => {
    if (frameWindow && versionChange) {
      postMessage(UPDATE_SELECT_COMPONENT_LABEL, {});
    }
  }, [frameWindow, versionChange]);

  useEffect(() => {
    if (frameWindow && viewModel) {
      postMessage(SET_VIEWER_CONTAINER_STYLE, {
        style: {
          width: viewModelWidth[viewModel],
          height: viewModelHeight[viewModel],
        },
      });
    }
  }, [frameWindow, viewModel]);

  useEffect(() => {
    if (frameWindow && locale) {
      postMessage(SET_FOXPAGE_LOCALE, {
        locale: locale.locale,
      });
    }
  }, [frameWindow, locale]);

  const handleFrameLoad = event => {
    const iframeWindow = event.target.contentWindow;
    setFrameWindow(iframeWindow);
  };

  const postMessage = (type: string, data: Record<string, unknown>) => {
    if (frameWindow) {
      frameWindow.postMessage({
        type,
        ...data,
      });
    }
  };

  return (
    <>
      <iframe
        key={contentId}
        title="main-view"
        name="main-view"
        id="main-view"
        src="/environment.html"
        frameBorder="0"
        scrolling="yes"
        width="100%"
        height="100%"
        onLoad={handleFrameLoad}
      />
      <Condition />
    </>
  );
};
export default connect(mapStateToProps, mapDispatchToProps)(Main);
