import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { Spin } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/events';
import { selectComponent } from '@/actions/builder/main';
import { EDITOR_ENV_PATH, EDITOR_PATH, STYLE_CONTAINER } from '@/constants/index';
import { findStructureByExtendId, findStructureById } from '@/sagas/builder/utils';
import { FoxBuilderEvents, RenderStructureNode, StructureNode } from '@/types/index';
import { getGlobalLocale } from '@/utils/global';

import { listeners, posters } from './events';

const Content = styled.div`
  height: 100%;
  background: #f2f2f2;
`;

const mapStateToProps = (store: RootState) => ({
  components: store.builder.component.components,
  application: store.builder.main.application,
  selectedNode: store.builder.main.selectedNode,
  state: store.builder.main.formattedData,
  mock: store.builder.main.mock,
  pageLocale: store.builder.header.locale,
  file: store.builder.main.file,
  pageNode: store.builder.main.pageNode,
});

const mapDispatchToProps = {
  selectComponent,
  updateComponent: ACTIONS.updateComponent,
  removeComponent: ACTIONS.removeComponent,
  copyComponent: ACTIONS.copyComponent,
  dropComponent: ACTIONS.dropComponent,
};

type IProps = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {
    loading: boolean;
    changeWindow: FoxBuilderEvents['onWindowChange'];
  };

const Viewer = (props: IProps) => {
  const [frameLoaded, setFrameLoaded] = useState(false);
  const {
    loading,
    state,
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
  } = props;
  const { host = [], slug = '' } = application;
  const { formattedSchemas: structure } = state;
  const locale = getGlobalLocale() || 'en';
  const history = useHistory();
  const isPage = file.type === 'page';
  // @ts-ignore
  const previewHtmlURL = __DEV__
    ? 'http://localhost:3003'
    : host[0] && slug
    ? `${host[0]?.url}/${slug}${EDITOR_PATH}`
    : '';

  const handleLinkChange = (target: string, _opt?: {}) => {
    history.push(target);
  };

  const handleFrameLoaded = (_opt?: {}) => {
    setFrameLoaded(true);
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
  };

  const onListeners = (event: MessageEvent) => {
    listeners.listener(event, handlers);
  };

  useEffect(() => {
    window.addEventListener('message', onListeners, false);
    return () => {
      window.removeEventListener('message', onListeners);
    };
  }, []);

  useEffect(() => {
    if (posters.handleInit && application.id && structure) {
      const sysConfig = {
        locale,
        mockable: !!mock?.enable,
        // @ts-ignore
        visualFrameSrc: __DEV__ ? '/environment.html' : slug ? `/${slug}${EDITOR_ENV_PATH}` : '',
      };
      const pageConfig = {
        locale: pageLocale,
      };
      // get select node
      let selectNode: StructureNode | null = null;
      if (selectedNode) {
        selectNode = findStructureById(structure, selectedNode.id);
        if (!selectNode) {
          selectNode = findStructureByExtendId(structure, selectedNode.id);
        }
        // TODO: style logic, need to general
        if (selectNode) {
          const { children = [] } = selectNode;
          const isStyleContainer = children.length === 1 && selectNode.name === STYLE_CONTAINER;
          if (isStyleContainer) {
            selectNode = children[0];
          }
        }
      }

      // root node
      const rootNode = pageNode
        ? (({
            ...pageNode,
            __editorConfig: {
              templateBind: isPage,
              disableTemplateBind: isPage && !!pageNode.extension?.extendId,
            },
          } as unknown) as RenderStructureNode)
        : null;

      posters.handleInit({
        components,
        structure,
        selectNode: selectNode as RenderStructureNode,
        rootNode,
        config: {
          sys: sysConfig,
          app: {
            appId: application.id,
          },
          page: pageConfig,
        },
      });
    }
  }, [frameLoaded, structure, components, pageLocale, application.id]);

  return (
    <Spin spinning={loading || !frameLoaded}>
      {structure ? (
        <Content>
          <iframe
            title="main-view"
            name="main-view"
            id="main-view"
            src={previewHtmlURL}
            frameBorder="0"
            scrolling="yes"
            width="100%"
            height="100%"
            style={{ display: 'block', visibility: 'visible' }}
            onLoad={handleFrameLoaded}
          />
        </Content>
      ) : null}
    </Spin>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Viewer);
