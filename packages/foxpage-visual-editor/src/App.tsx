import React, { useEffect, useState } from 'react';

// @ts-ignore
import html2canvas from 'html2canvas';

import { BuilderData, FoxBuilderEvents } from '@/types/index';

import Container from './Container';
import { listeners, posters } from './events';

const App = () => {
  const [meta, setMeta] = useState<BuilderData>({});

  const events: FoxBuilderEvents = {
    onSelectComponent: posters.handleSelectComponent,
    onUpdateComponent: posters.handleUpdateComponent,
    onRemoveComponent: posters.handleRemoveComponent,
    onCopyComponent: posters.handleCopyComponent,
    onDropComponent: posters.handleDropComponent,
    onWindowChange: posters.handleWindowChange,
    onLinkChange: posters.handleLinkChange,
    onFrameLoaded: posters.handleFrameLoaded,
    onPageCaptured: posters.handlePageCaptured,
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
      // console.log('[ VISUAL EDITOR INIT ]:', value);
      setMeta(value);
    },
    onPageCapture: handlePageCapture,
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
      rootNode={meta.rootNode}
      selectNode={meta.selectNode}
      structure={meta.structure || []}
      components={meta.components || []}
      config={meta.config || {}}
      events={events}
    />
  );
};

export default App;
