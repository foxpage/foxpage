import React, { useEffect, useState } from 'react';

// @ts-ignore
import html2canvas from 'html2canvas';

import { BuilderData, FoxBuilderEvents } from '@/types/index';

import Container from './Container';
import { listeners, posters } from './events';

const App = () => {
  const [meta, setMeta] = useState<BuilderData>({});
  const [pageStructure, setPageStructure] = useState<BuilderData['structure']>([]);
  const [renderDSL, setRenderDSL] = useState<BuilderData['structure']>([]);
  const [selectNode, setSelectNode] = useState<BuilderData['selectNode']>(null);
  const [changed, setChanged] = useState(false);
  const [nodeChangedStatus, setNodeChangedStatus] = useState({});
  const readOnly = !!meta.config?.sys?.readOnly;

  const events: FoxBuilderEvents = {
    onSelectComponent: (component) => {
      if (typeof posters.handleSelectComponent === 'function') {
        posters.handleSelectComponent(component);
      }
    },
    onUpdateComponent: (...args) => {
      if (readOnly) {
        return;
      }
      setChanged(true);
      setTimeout(() => {
        if (typeof posters.handleUpdateComponent === 'function') {
          posters.handleUpdateComponent(...args);
        }
      }, 300);
    },
    onRemoveComponent: (...args) => {
      if (readOnly) {
        return;
      }
      setChanged(true);
      if (typeof posters.handleRemoveComponent === 'function') {
        posters.handleRemoveComponent(...args);
      }
    },
    onCopyComponent: (...args) => {
      if (readOnly) {
        return;
      }
      setChanged(true);
      if (typeof posters.handleCopyComponent === 'function') {
        posters.handleCopyComponent(...args);
      }
    },
    onDropComponent: (...args) => {
      if (readOnly) {
        return;
      }
      setChanged(true);
      if (typeof posters.handleDropComponent === 'function') {
        posters.handleDropComponent(...args);
      }
    },
    onWindowChange: posters.handleWindowChange,
    onLinkChange: posters.handleLinkChange,
    onFrameLoaded: posters.handleFrameLoaded,
    onPageCaptured: posters.handlePageCaptured,
    onFetchComponentVersions: posters.handleFetchComponentVersions,
  };

  function handlePageCapture() {
    const iframe = document.querySelector('#component-viewer') as HTMLIFrameElement;
    const dom = iframe.contentDocument?.body as HTMLElement;
    html2canvas(dom, { allowTaint: true, useCORS: true }).then((canvas) => {
      const base64img = canvas.toDataURL('image/jpeg', 0.1);
      events.onPageCaptured && events.onPageCaptured(base64img);
    });
  }

  /**
   * listener handlers
   */
  const handlers: FoxBuilderEvents = {
    onInit: (value) => {
      console.log('[ VISUAL EDITOR INIT ]:', value);
      setMeta(value);
    },
    onChange: () => {
      setChanged(true);
    },
    onRenderDSLChanged: (dsl) => {
      console.log('[ RENDER DSL CHANGED ]:', dsl);
      setRenderDSL(dsl);
      setChanged(false);
    },
    onPageStructureChanged: (structure) => {
      console.log('[ PAGE STRUCTURE CHANGED ]:', structure);
      setPageStructure(structure);
    },
    onSelectedComponentChanged: (newSelectNode) => {
      console.log('[ SELECTED COMPONENT CHANGED ]:', newSelectNode);
      setSelectNode(newSelectNode);
    },
    onPageCapture: handlePageCapture,
    onStructureChanged: (value) => {
      console.log('[ STRUCTURE CHANGED ]:', value);
      setNodeChangedStatus(value);
    },
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

  return (
    <Container
      selectNode={selectNode}
      renderDSL={renderDSL || []}
      pageStructure={pageStructure || []}
      rootNode={meta.rootNode}
      components={meta.components || []}
      config={meta.config || {}}
      events={events}
      reRendering={changed}
      nodeChangedStatus={nodeChangedStatus}
    />
  );
};

export default App;
