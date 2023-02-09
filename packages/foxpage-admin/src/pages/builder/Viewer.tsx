import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import { Spin } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import { fetchComponentVersions } from '@/actions/builder/components';
import * as ACTIONS from '@/actions/builder/events';
import { selectComponent } from '@/actions/builder/main';
import {
  EDITOR_ENV_PATH,
  EDITOR_PATH,
  FileType,
  PAGE_COMPONENT_NAME,
  STYLE_CONTAINER,
} from '@/constants/index';
import { findStructureByExtendId, findStructureById } from '@/sagas/builder/utils';
import { updateStructureStatus } from '@/store/actions/record';
import { FoxBuilderEvents, RenderStructureNode, StructureNode } from '@/types/index';
import { getGlobalLocale, getLocaleHost, getLocationIfo } from '@/utils/index';

import { listeners, posters } from './events';

const Content = styled.div`
  height: 100%;
  background: #f2f2f2;
`;

const mapStateToProps = (store: RootState) => ({
  components: store.builder.component.components,
  componentVersions: store.builder.component.versions,
  nameVersionDetails: store.builder.component.nameVersionDetails,
  application: store.builder.main.application,
  selectedNode: store.builder.main.selectedNode,
  state: store.builder.main.formattedData,
  renderDSL: store.builder.main.renderDSL,
  readOnly: store.builder.main.readOnly,
  mock: store.builder.main.mock,
  pageLocale: store.builder.header.locale,
  file: store.builder.main.file,
  pageNode: store.builder.main.pageNode,
  lastModified: store.builder.main.lastModified,
  recordStatus: store.record.main.recordStatus,
});

const mapDispatchToProps = {
  selectComponent,
  updateComponent: ACTIONS.updateComponent,
  removeComponent: ACTIONS.removeComponent,
  copyComponent: ACTIONS.copyComponent,
  dropComponent: ACTIONS.dropComponent,
  updateStructureStatus,
  fetchComponentVersions,
};

type IProps = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {
    loading: boolean;
    changeWindow: FoxBuilderEvents['onWindowChange'];
  };

const Viewer = (props: IProps) => {
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [editorLoaded, setEditorLoaded] = useState(false);
  const {
    loading,
    state,
    renderDSL,
    components = [],
    application,
    mock,
    file,
    pageNode,
    pageLocale,
    selectedNode,
    selectComponent,
    updateComponent,
    removeComponent,
    copyComponent,
    dropComponent,
    changeWindow,
    recordStatus,
    lastModified,
    readOnly,
    componentVersions,
    nameVersionDetails,
    fetchComponentVersions,
    // updateStructureStatus,
  } = props;
  const { host = [], slug = '' } = application;
  const { formattedSchemas: pageStructure } = state;
  const locale = getGlobalLocale() || 'en';
  const history = useHistory();
  const { applicationId } = getLocationIfo(useLocation());
  const isPage = file?.type === FileType.page;
  const localeHost = getLocaleHost(host, pageLocale);
  // @ts-ignore
  const { editorUrl = '', environmentPath = '' } = APP_CONFIG;
  // @ts-ignore
  const previewHtmlURL = __DEV__
    ? editorUrl || `http://localhost:3000/${slug}${EDITOR_PATH}`
    : localeHost[0] && slug
    ? `${localeHost[0]?.url}/${slug}${EDITOR_PATH}`
    : '';
  // root node
  const rootNode = pageNode
    ? ({
        ...pageNode,
        childIds: (pageNode.children || []).map((item) => item.id),
        __editorConfig: {
          templateBind: isPage,
          disableTemplateBind: isPage && !!pageNode.extension?.extendId,
        },
      } as unknown as RenderStructureNode)
    : null;
  const selectNodeLastModified = selectedNode?.__lastModified || 0;

  const handleLinkChange = (_target: string, _opt?: {}) => {
    // TODO: generate different link by target, opt
    const appSettingComponentLink = `/applications/${applicationId}/settings/builder/component`;
    history.push(appSettingComponentLink);
  };

  const handleFrameLoaded = (_opt?: {}) => {
    setEditorLoaded(true);
  };

  // listeners handlers
  const handlers: FoxBuilderEvents = {
    onSelectComponent: selectComponent,
    onUpdateComponent: updateComponent,
    onRemoveComponent: removeComponent,
    onCopyComponent: copyComponent,
    onDropComponent: dropComponent,
    onWindowChange: changeWindow,
    onLinkChange: handleLinkChange,
    onFrameLoaded: handleFrameLoaded,
    onPageCaptured: handlePageCaptured,
    onFetchComponentVersions: (node?: RenderStructureNode | null) => {
      if (node) {
        fetchComponentVersions({ applicationId, name: node.name });
      }
    },
  };

  const onListeners = (event: MessageEvent) => {
    listeners.listener(event, handlers);
  };

  // upload page snapshot
  function handlePageCaptured(img) {
    // TODO: do upload here
    return img;
  }

  useEffect(() => {
    window.addEventListener('message', onListeners, false);
    return () => {
      window.removeEventListener('message', onListeners);
    };
  }, []);

  useEffect(() => {
    if (typeof posters.handleChange === 'function') {
      posters.handleChange({});
    }
  }, [lastModified]);

  useEffect(() => {
    if (frameLoaded && typeof posters.handleStructureChanged === 'function') {
      posters.handleStructureChanged(recordStatus.structure);
    }
  }, [frameLoaded, editorLoaded, recordStatus]);

  useEffect(() => {
    if (frameLoaded && typeof posters.handleRenderDSLChanged === 'function') {
      posters.handleRenderDSLChanged(renderDSL);
    }
  }, [frameLoaded, editorLoaded, renderDSL]);

  useEffect(() => {
    if (frameLoaded && typeof posters.handlePageStructureChanged === 'function') {
      posters.handlePageStructureChanged(pageStructure);
    }
  }, [frameLoaded, editorLoaded, pageStructure]);

  useEffect(() => {
    if (frameLoaded && typeof posters.handleSelectComponentChanged === 'function') {
      // get select node
      let _selectNode: StructureNode | null = null;
      if (selectedNode) {
        _selectNode = findStructureById(pageStructure, selectedNode.id);
        if (!_selectNode) {
          _selectNode = findStructureByExtendId(pageStructure, selectedNode.id);
        }
        // TODO: style logic, need to general
        if (_selectNode) {
          const { children = [] } = _selectNode;
          const isStyleContainer = children.length === 1 && _selectNode.name === STYLE_CONTAINER;
          if (isStyleContainer) {
            _selectNode = children[0];
          }
        }
      }
      if (selectedNode?.name === PAGE_COMPONENT_NAME) {
        _selectNode = rootNode ? { ...rootNode, children: [], childIds: [] } : null;
      }
      // for cover editor value or be covered
      if (_selectNode) {
        _selectNode = {
          ..._selectNode,
          __lastModified: selectedNode?.__lastModified || 0,
          __versions: componentVersions || [],
        } as unknown as unknown as RenderStructureNode;
      }
      // for new node mark
      // if (selectNode?.id) {
      //   updateStructureStatus(selectNode?.id);
      // }
      posters.handleSelectComponentChanged(_selectNode as RenderStructureNode);
    }
  }, [frameLoaded, editorLoaded, selectNodeLastModified, pageNode, pageStructure, componentVersions]);

  useEffect(() => {
    if (frameLoaded && posters.handleInit && application.id) {
      const sysConfig = {
        locale,
        mockable: !!mock?.enable,
        // @ts-ignore
        visualFrameSrc: __DEV__
          ? environmentPath || `/${slug}${EDITOR_ENV_PATH}`
          : `/${slug}${EDITOR_ENV_PATH}`,
        readOnly,
      };
      const pageConfig = {
        locale: pageLocale,
        fileType: file.type,
      };
      const initVal = {
        components: components.concat(nameVersionDetails),
        structure: [],
        selectNode: null,
        rootNode,
        config: {
          sys: sysConfig,
          app: {
            appId: application.id,
          },
          page: pageConfig,
        },
      };
      posters.handleInit(initVal);
    }
  }, [frameLoaded, editorLoaded, components, nameVersionDetails, pageLocale, application.id, mock?.enable]);

  return (
    <Spin spinning={loading || !frameLoaded || !editorLoaded}>
      {pageStructure ? (
        <Content>
          <iframe
            key={pageLocale}
            title="main-view"
            name="main-view"
            id="main-view"
            src={previewHtmlURL}
            frameBorder="0"
            scrolling="yes"
            width="100%"
            height="100%"
            style={{ display: 'block', visibility: 'visible' }}
            onLoad={() => {
              setFrameLoaded(true);
            }}
          />
        </Content>
      ) : null}
    </Spin>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Viewer);
