import React, { CSSProperties, useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { Modal, Spin } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import { updateLoadingStatus, updateRequireLoadStatus } from '@/actions/builder/component-load';
import { updateConditionBindDrawerVisible } from '@/actions/builder/condition';
import * as ACTIONS from '@/actions/builder/template';
import { setVariableBindModalVisibleStatus } from '@/actions/builder/variable';
import { FileTypeEnum } from '@/constants/global';
import { EDITOR_URL } from '@/constants/paths';
import { EditorInputEnum } from '@/constants/variable';
import { ignoreNodeByBlankNode } from '@/services/builder';
import { objectEmptyCheck } from '@/utils/object-empty-check';

import GlobalContext from '../../GlobalContext';
import {
  ADD_COMPONENT,
  BLANK_NODE,
  COPY_COMPONENT,
  DELETE_COMPONENT,
  DROP_COMPONENT,
  INIT_DATA,
  LOAD_FINISH,
  OPEN_CONDITION_BIND,
  OPEN_VARIABLE_BIND,
  REQUIRE_LOAD_COMPONENT,
  ROLL_BACK_COMPONENT,
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
  UPDATE_SELECT_COMPONENT_LABEL,
  UPDATE_WRAPPER_PROPS,
  viewModelHeight,
  viewModelWidth,
} from '../constant';
import Condition from '../editor/condition/Condition';
import { postMsg } from '../post-message';

// @ts-ignore
const StyledSpin = styled(Spin)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: calc(100% - 300px);
  height: 100%;
`;

const SelectTemplateText = styled.div`
  color: #cac6c6;
  font-size: 16px;
  position: absolute;
  z-index: 1;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  text-align: center;
  > div {
    padding: 24px 48px;
    border: 1px dashed #dddddd;
    background: #fff;
    margin-right: 300px;
    cursor: pointer;
    &:hover {
      background-color: #f2f2f2;
    }
  }
`;

interface IProps {
  containerStyle?: CSSProperties;
  loading?: boolean;
  onContentChange: (id: string) => void;
  onOpenPagesModal: (status: boolean) => void;
}
const mapStateToProps = (store: RootState) => ({
  applicationId: store.builder.page.applicationId,
  appInfo: store.group.application.settings.application,
  contentId: store.builder.page.contentId,
  locale: store.builder.page.locale,
  fileId: store.builder.page.fileId,
  folderId: store.builder.page.folderId,
  fileType: store.builder.page.fileType,
  pageStructure: store.builder.template.renderStructure || [],
  renderStructure: store.builder.template.parsedRenderStructure,
  renderStructureWithMock: store.builder.template.mockParsedRenderStructure,
  componentSource: store.builder.template.componentSourceMap,
  selectedComponent: store.builder.template.selectedComponent,
  selectedWrapperComponent: store.builder.template.selectedWrapperComponent,
  requireLoad: store.builder.viewer.requireLoad,
  relations: store.builder.template.relations,
  versionChange: store.builder.template.versionChange,
  zoom: store.builder.template.zoom,
  viewModel: store.builder.template.viewModel,
  allComponent: store.builder.componentList.allComponent,
  mockModeEnable: store.builder.more.mockModeEnable,
  baseStructure: store.builder.template.extensionData.baseStructureRecord,
});

const mapDispatchToProps = {
  updateLoadingStatus: updateLoadingStatus,
  updateRequireLoadStatus: updateRequireLoadStatus,
  setSelectedComponent: ACTIONS.setSelectedComponent,
  deleteComponent: ACTIONS.deleteComponent,
  copyComponent: ACTIONS.copyComponent,
  insertComponent: ACTIONS.insertComponent,
  appendComponent: ACTIONS.appendComponent,
  rollBackComponent: ACTIONS.rollbackComponent,
  saveComponent: ACTIONS.saveComponentEditorValue,
  dropComponent: ACTIONS.dropComponent,
  updateEditorValue: ACTIONS.updateEditorValue,
  updateWrapperValue: ACTIONS.updateWrapperProps,
  setVariableBindModalVisibleStatus,
  updateConditionBindDrawerVisible,
};

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & IProps;

const Main: React.FC<Props> = (props) => {
  const {
    zoom = 1,
    applicationId,
    appInfo,
    contentId,
    folderId,
    renderStructure,
    renderStructureWithMock,
    baseStructure,
    componentSource,
    requireLoad,
    locale,
    pageStructure,
    selectedComponent,
    selectedWrapperComponent,
    relations = [],
    containerStyle,
    versionChange,
    fileType,
    viewModel,
    loading,
    allComponent,
    mockModeEnable,
    updateLoadingStatus,
    updateRequireLoadStatus,
    setSelectedComponent,
    copyComponent,
    rollBackComponent,
    deleteComponent,
    insertComponent,
    appendComponent,
    saveComponent,
    dropComponent,
    updateEditorValue,
    updateWrapperValue,
    setVariableBindModalVisibleStatus,
    updateConditionBindDrawerVisible,
    onContentChange,
    onOpenPagesModal,
  } = props;
  const [frameWindow, setFrameWindow] = useState<Window | undefined>();
  const [visualEditorReady, setVisualEditorReady] = useState<boolean>(false);
  const { locale: i18nLocale } = useContext(GlobalContext);
  const { builder } = i18nLocale.business;
  const { host = [], slug } = appInfo || {};
  const previewHtmlURL =
    // @ts-ignore
    APP_CONFIG.env === 'dev'
      ? `http://localhost:3000${EDITOR_URL}`
      : host[0] && slug
      ? `${host[0]?.url}/${slug}${EDITOR_URL}`
      : '';

  const messageListener = (event) => {
    const { data } = event;
    const { type } = data;
    switch (type) {
      case LOAD_FINISH:
        setVisualEditorReady(true);
        const { noResourceComponentName = [] } = data as { noResourceComponentName: string[] };
        // ignore white
        const idx = noResourceComponentName.indexOf(BLANK_NODE);
        if (idx > -1) {
          noResourceComponentName.splice(idx, 1);
        }
        if (noResourceComponentName.length > 0) {
          Modal.warning({
            title: 'Please add these component to your application',
            content: noResourceComponentName.map((name) => <p>{name}</p>),
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
      case ROLL_BACK_COMPONENT:
        rollBackComponent(applicationId, data.id);
        break;
      case SELECT_CONTENT:
        onContentChange(relations[0].id);
        break;
      case ADD_COMPONENT:
        const { addType, componentId, desc, parentId, pos } = data;
        addType === 'insert'
          ? insertComponent(applicationId, componentId, pos, desc, parentId)
          : appendComponent(applicationId, componentId, { ...desc, position: pos });
        break;
      case SAVE_COMPONENT:
        const { isWrapper } = data;
        saveComponent({ applicationId, folderId, isWrapper });
        break;
      case DROP_COMPONENT:
        dropComponent(applicationId, data.dndInfo, data.desc);
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
          keys: data.keys,
          type: data.opt?.type || EditorInputEnum.Text,
          mock: !!data.opt?.isMock,
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
      // updateLoadingStatus(true);
      if (frameWindow) {
        postMsg(REQUIRE_LOAD_COMPONENT, {
          requireLoad,
          componentSource,
          renderStructure,
          fileType,
          locale,
        });
      }
    }
  }, [requireLoad, frameWindow, renderStructure, componentSource, locale]);

  useEffect(() => {
    if (allComponent && frameWindow && slug) {
      postMsg(INIT_DATA, { locale, allComponents: allComponent, slug, pageStructure });
    }
  }, [allComponent, pageStructure, frameWindow, slug]);

  useEffect(() => {
    if (renderStructure && frameWindow) {
      const finalStructure =
        !!mockModeEnable && !objectEmptyCheck(renderStructureWithMock)
          ? renderStructureWithMock
          : renderStructure;
      postMsg(SET_COMPONENT_STRUCTURE, {
        renderStructure: ignoreNodeByBlankNode(finalStructure),
        baseStructure,
      });
    }
  }, [renderStructure, frameWindow, mockModeEnable, renderStructureWithMock, baseStructure]);

  useEffect(() => {
    if (frameWindow) {
      postMsg(SET_SELECT_COMPONENT, { selectedComponent, selectedWrapperComponent });
    }
  }, [selectedComponent, frameWindow]);

  useEffect(() => {
    if (frameWindow && containerStyle) {
      postMsg(SET_CONTAINER_STYLE, { containerStyle });
    }
  }, [frameWindow, containerStyle]);

  useEffect(() => {
    if (frameWindow) {
      postMsg(SET_ZOOM, { zoom: zoom || 1 });
    }
  }, [frameWindow, zoom]);

  useEffect(() => {
    if (frameWindow && versionChange) {
      postMsg(UPDATE_SELECT_COMPONENT_LABEL, {});
    }
  }, [frameWindow, versionChange]);

  useEffect(() => {
    if (frameWindow && viewModel) {
      postMsg(SET_VIEWER_CONTAINER_STYLE, {
        style: {
          width: viewModelWidth[viewModel],
          height: viewModelHeight[viewModel],
        },
      });
    }
  }, [frameWindow, viewModel]);

  useEffect(() => {
    if (frameWindow && i18nLocale) {
      postMsg(SET_FOXPAGE_LOCALE, {
        // the portal i18n
        locale: (i18nLocale as any).locale,
      });
    }
  }, [frameWindow, i18nLocale]);

  useEffect(() => {
    postMsg(SET_MOCK_DATA, {
      enable: !!mockModeEnable,
    });
  }, [mockModeEnable]);

  const handleFrameLoad = (event) => {
    const iframeWindow = event.target.contentWindow;
    setFrameWindow(iframeWindow);
  };

  return (
    <>
      {(loading || !visualEditorReady) && <StyledSpin spinning={true} style={{ position: 'fixed' }} />}
      {fileType === FileTypeEnum.page && !loading && visualEditorReady && pageStructure.length === 0 && (
        <SelectTemplateText>
          <div
            onClick={() => {
              onOpenPagesModal(true);
            }}>
            {builder.selectPage}
          </div>
        </SelectTemplateText>
      )}

      {previewHtmlURL && contentId && (
        <iframe
          key={contentId}
          title="main-view"
          name="main-view"
          id="main-view"
          src={previewHtmlURL}
          frameBorder="0"
          scrolling="yes"
          width="100%"
          height="100%"
          style={{ display: 'block', visibility: !loading && visualEditorReady ? 'visible' : 'hidden' }}
          onLoad={handleFrameLoad}
        />
      )}

      <Condition />
    </>
  );
};
export default connect(mapStateToProps, mapDispatchToProps)(Main);
