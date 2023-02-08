import React, { useEffect, useState } from 'react';

import { Spin } from 'antd';
import styled from 'styled-components';

import {
  Component,
  ComponentMap,
  FoxBuilderEvents,
  FoxI18n,
  LoadedComponents,
  RenderStructure,
  RenderStructureNode,
  VisualEditorConfig,
} from '@/types/index';

import { FoxPageContext } from './context/main';
import { FoxContext } from './context';
import foxI18n from './i18n';
import Main from './Main';
import { getStructureList, loadComponents, mapComponent } from './utils';

const ContainerStyle = styled.div`
  height: 100%;
  .ant-spin-nested-loading {
    height: 100%;
  }
  .ant-spin-container {
    height: 100%;
  }
`;

interface IProps {
  selectNode: RenderStructureNode | null;
  renderDSL: RenderStructure;
  pageStructure: RenderStructure;
  components: Component[];
  config: VisualEditorConfig;
  selectComponent?: RenderStructureNode;
  rootNode?: RenderStructureNode;
  events: FoxBuilderEvents;
  reRendering?: boolean;
  nodeChangedStatus: {};
}

const Container = (props: IProps) => {
  const [meta, setMeta] = useState<{
    loadedComponents: LoadedComponents;
    structureList: RenderStructureNode[];
    componentMap: ComponentMap;
    loaded: boolean;
  }>({ loadedComponents: {}, structureList: [], componentMap: {}, loaded: false });
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [components, setComponents] = useState<Component[]>([]);
  const {
    renderDSL,
    pageStructure,
    components: _components,
    events,
    config,
    rootNode,
    selectNode,
    ...rest
  } = props;
  const { locale = '' } = config.page || {};
  const selectNodeVersions = selectNode?.__versions;

  useEffect(() => {
    if (renderDSL && components && frameLoaded) {
      init(renderDSL);
    }
  }, [renderDSL, components, frameLoaded, locale]);

  useEffect(() => {
    if (selectNodeVersions) {
      setComponents(_components.concat(selectNodeVersions));
    } else {
      setComponents(_components);
    }
  }, [selectNodeVersions, _components]);

  const init = async (structureList: RenderStructureNode[]) => {
    const _structureList = getStructureList(structureList);
    const mapped = mapComponent(components);
    let _loadedComponents: LoadedComponents = {};

    if (rootNode) {
      _structureList.push(rootNode);
    }
    if (_structureList.length > 0) {
      _loadedComponents = await loadComponents(_structureList, mapped, {
        locale,
      });
    }

    setMeta({
      structureList: _structureList,
      loadedComponents: _loadedComponents,
      componentMap: mapped,
      loaded: true,
    });
  };

  const handleUpdateComponent = (data: RenderStructureNode) => {
    if (typeof events.onUpdateComponent === 'function') {
      events.onUpdateComponent(data);
    }
  };

  const handleFrameLoaded = () => {
    setFrameLoaded(true);
    if (typeof events.onFrameLoaded === 'function') {
      events.onFrameLoaded();
    }
  };

  const _foxI18n = foxI18n[props.config.sys?.locale || 'en'] as FoxI18n;
  const foxContextValue: FoxPageContext = {
    ...rest,
    config,
    renderDSL,
    pageStructure,
    components,
    structureList: meta.structureList,
    componentMap: meta.componentMap,
    loadedComponents: meta.loadedComponents,
    foxI18n: _foxI18n,
    rootNode,
    selectNode,
    events: {
      ...events,
      onUpdateComponent: handleUpdateComponent,
      onFrameLoaded: handleFrameLoaded,
    },
  };

  return (
    <ContainerStyle>
      <Spin spinning={!meta.loaded}>
        <FoxContext.Provider value={foxContextValue}>
          <Main />
        </FoxContext.Provider>
      </Spin>
    </ContainerStyle>
  );
};

export default Container;
