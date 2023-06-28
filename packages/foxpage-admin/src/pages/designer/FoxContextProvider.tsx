import React, { useEffect, useState } from 'react';

import { Modal } from 'antd';
import styled from 'styled-components';

import {
  Component,
  ComponentSourceMap,
  DesignerI18n,
  DndData,
  FoxBuilderEvents,
  InitStateParams,
  LoadedComponents,
  PageContent,
  RenderStructure,
  RenderStructureNode,
  VisualEditorConfig,
} from '@/types/index';

import { FoxPageContext } from './context';
import { gridLayout } from './extension';
import foxI18n from './i18n';
import { getStructureList, loadComponents, mapComponent } from './utils';

const ContainerStyle = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  .ant-spin-nested-loading {
    height: 100%;
  }
  .ant-spin-container {
    height: 100%;
  }
`;

export interface FoxContextProviderProps {
  selectNode?: RenderStructureNode;
  selectNodeFrom?: 'sider' | 'viewer';
  renderDSL: RenderStructure;
  pageStructure: RenderStructure;
  components: Component[];
  config: VisualEditorConfig;
  selectComponent?: RenderStructureNode;
  rootNode?: RenderStructureNode | null;
  events: FoxBuilderEvents;
  nodeChangedStatus: {};
  children: React.ReactNode;
  visualFrameSrc: string;
  pageNode?: RenderStructureNode;
  contentId?: string;
  slug: string;
  parseState?: {
    parseKey: string;
    page: PageContent | null;
    opt: InitStateParams | null;
  };
  extra: Record<string, any>;
}

const FoxContextProvider = (props: FoxContextProviderProps) => {
  const [meta, setMeta] = useState<{
    loadedComponents: LoadedComponents;
    structureList: RenderStructureNode[];
    componentMap: ComponentSourceMap;
    structureMap: { [key in string]: RenderStructureNode };
  }>({ loadedComponents: {}, structureList: [], componentMap: {}, structureMap: {} });
  const [dataLoaded, setDataLoaded] = useState(false);
  const [components, setComponents] = useState<Component[]>([]);
  const {
    renderDSL,
    pageStructure,
    components: _components,
    events,
    config,
    rootNode,
    selectNode,
    selectNodeFrom,
    children,
    visualFrameSrc,
    extra,
    ...rest
  } = props;
  const _foxI18n = foxI18n[props.config.sys?.locale || 'en'] as DesignerI18n;
  const { locale = '' } = config.page || {};
  const selectNodeVersions = selectNode?.__versions;

  useEffect(() => {
    (async () => {
      setDataLoaded(false);
      await init(renderDSL || []);
      if (rootNode !== undefined) {
        setDataLoaded(true);
      }
    })();
  }, [renderDSL, components, rootNode, config]);

  useEffect(() => {
    if (selectNodeVersions) {
      setComponents(_components.concat(selectNodeVersions));
    } else {
      setComponents(_components);
    }
  }, [selectNodeVersions, _components]);

  const handleUpdateComponent = (data: RenderStructureNode) => {
    if (typeof events.onUpdateComponent === 'function') {
      if (gridLayout.isGridContainer(data) && selectNode) {
        const result = gridLayout.gridContainerUpdateHandler(data, selectNode, {
          structure: pageStructure,
          components: _components,
        });
        const removeCount = result.removes.length || 0;
        if (removeCount > 0) {
          Modal.confirm({
            title: _foxI18n.gridLayoutUpdateTips,
            content: _foxI18n.gridLayoutUpdateTipContent.replace('$1', String(removeCount)),
            onOk: () => {
              events.onUpdateComponent && events.onUpdateComponent(data, result);
            },
          });
        } else {
          events.onUpdateComponent && events.onUpdateComponent(data, result);
        }
      } else {
        events.onUpdateComponent(data);
      }
    }
  };

  const handleRemoveComponent = (data: RenderStructureNode) => {
    if (typeof events.onRemoveComponent === 'function') {
      if (gridLayout.isGridPanel(data)) {
        const result = gridLayout.gridPanelRemoveHandler(data, {
          structure: renderDSL,
          components: _components,
        });
        events.onRemoveComponent(data, result);
      } else {
        events.onRemoveComponent(data);
      }
    }
  };

  const handleCopyComponent = (data: RenderStructureNode) => {
    if (typeof events.onCopyComponent === 'function') {
      if (gridLayout.isGridPanel(data)) {
        const result = gridLayout.gridPanelAddHandler(data, {
          structure: renderDSL,
          components: _components,
        });
        events.onCopyComponent(data, result);
      } else {
        events.onCopyComponent(data);
      }
    }
  };

  const handleDropComponent = (dndInfo: DndData, opt?: {}) => {
    if (typeof events.onDropComponent === 'function') {
      // const isAdd = dndInfo.dragInfo?.type === 'add';
      // if (isAdd && gridLayout.isGridContainer(dndInfo.dragInfo?.detail)) {
      //   const result = gridLayout.gridPanelAddHandler(data, {
      //     structure: renderDSL,
      //     components: _components,
      //   });
      //   events.onDropComponent(dndInfo, { ...opt, ...result });
      // } else {
      events.onDropComponent(dndInfo, opt);
      // }
    }
  };

  const foxContextValue: FoxPageContext = {
    ...rest,
    config,
    renderDSL,
    pageStructure,
    components,
    structureList: meta.structureList,
    componentMap: meta.componentMap,
    loadedComponents: meta.loadedComponents,
    structureMap: meta.structureMap,
    dataLoaded: dataLoaded,
    foxI18n: _foxI18n,
    rootNode,
    selectNode,
    selectNodeFrom,
    visualFrameSrc,
    events: {
      ...events,
      onUpdateComponent: handleUpdateComponent,
      onRemoveComponent: handleRemoveComponent,
      onCopyComponent: handleCopyComponent,
      onDropComponent: handleDropComponent,
    },
    extra,
  };

  return (
    <ContainerStyle>
      <FoxPageContext.Provider value={foxContextValue}>{children}</FoxPageContext.Provider>
    </ContainerStyle>
  );

  async function init(structureList: RenderStructureNode[]) {
    try {
      // console.info('structureList', rootNode);
      const _structureList = getStructureList(structureList);
      const structureMap = _structureList.reduce((acc, item) => {
        return { ...acc, [item.id]: item };
      }, {});
      const componentMap = mapComponent(components);

      let _loadedComponents: LoadedComponents = {};

      if (_structureList.length > 0) {
        // TODO: editor only?
        _loadedComponents = await loadComponents(_structureList, componentMap, {
          locale,
        });
      }
      setMeta({
        structureList: _structureList,
        loadedComponents: _loadedComponents,
        componentMap,
        structureMap,
      });
    } catch (err) {
      console.error(err);
    }
  }
};

export default FoxContextProvider;
