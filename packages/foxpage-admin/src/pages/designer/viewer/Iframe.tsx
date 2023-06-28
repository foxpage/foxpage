import React, { useEffect, useRef, useState } from 'react';

import { usePrevious } from 'ahooks';
import { Spin } from 'antd';

import {
  handleOutSelectNode,
  handlePageParse,
  handlePostInitData,
  handleZoomChange,
  listener,
} from '@foxpage/foxpage-iframe-actions';

import { useDndContext, useEditorContext, useFoxpageContext } from '../context';
import { DRAG_DATA } from '../dnd';
import { gridLayout } from '../extension';
// import { findStructureById } from '../utils';

interface IProps extends React.IframeHTMLAttributes<any> {
  pageId: string;
}

let prePageId;

export const Iframe = ({ pageId }: IProps) => {
  const [loaded, setLoaded] = useState(false);
  const [initiated, setInitiated] = useState(false);
  const [frameLoading, setFrameLoading] = useState(true);
  const {
    visualFrameSrc,
    componentMap,
    selectNodeFrom,
    selectNode,
    rootNode,
    config,
    parseState,
    slug,
    events: { onDropComponent, onPageCaptured },
    extra,
  } = useFoxpageContext();
  const {
    isDragging,
    handleDragOver,
    handleDrop,
    handleDragLeave,
    handleDragEnter,
    setIsDragging,
    handlePlaceholder,
  } = useDndContext();
  const {
    events: { handleNodeRectSelect, handleSelectComponent },
  } = useEditorContext();
  const zoom = config.sys?.zoom || 1;
  // cover positions
  const coverRef = useRef<HTMLDivElement>(null);
  // grid-layout
  const isGridLayoutNode = gridLayout.isGridPanel(selectNode);
  // const parentNode = selectNode ? findStructureById(renderDSL, selectNode.extension?.parentId || '') : null;
  // const gridData = isGridLayoutNode ? gridLayout.getGridDragData(renderDSL, selectNode) : null;
  const preParseKey = usePrevious(parseState?.parseKey);
  useEffect(() => {
    if (pageId !== prePageId) {
      prePageId = pageId;
      window.addEventListener('message', messageHandlers);
    }
    return () => {
      prePageId = undefined;
      window.removeEventListener('message', messageHandlers);
    };
  }, [pageId]);

  // step 1 post init data
  useEffect(() => {
    if (
      loaded &&
      zoom &&
      !initiated &&
      componentMap &&
      Object.keys(componentMap).length > 0 &&
      rootNode !== undefined
    ) {
      handlePostInitData({
        zoom,
        componentMap,
        rootNode: rootNode || undefined,
        config,
        extra,
      });
    }
  }, [loaded, componentMap, zoom, rootNode, initiated, config]);

  // step 2 post dsl change
  // useEffect(() => {
  //   if (loaded && initiated && Array.isArray(structureList)) {
  //     handleDSLChange(structureList);
  //   }
  // }, [structureList, loaded, initiated, contentId, componentMap]);

  useEffect(() => {
    if (
      loaded &&
      initiated &&
      parseState?.parseKey !== preParseKey &&
      parseState?.page &&
      parseState.opt &&
      slug
    ) {
      handlePageParse(parseState.page, parseState.opt, slug);
    }
  }, [loaded, initiated, parseState, slug]);

  useEffect(() => {
    if (loaded && initiated && selectNodeFrom === 'sider' && selectNode && !frameLoading) {
      handleOutSelectNode(selectNode);
    }
  }, [selectNode, selectNodeFrom, loaded, initiated, frameLoading]);

  useEffect(() => {
    if (loaded && initiated && !frameLoading) {
      handleZoomChange(zoom);
    }
  }, [zoom, loaded, initiated, frameLoading]);

  return (
    <div style={{ position: 'relative', height: '100%' }} ref={coverRef}>
      <Spin spinning={frameLoading} wrapperClassName="iframe-cover">
        <div
          style={{
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
          onDragEnter={handleIframeDragEnter}
          onDragOver={handleFrameDragOver}
          onDrop={handleFrameDrop}
          onDragLeave={handleIframeDragLeave}>
          <iframe
            id="component-viewer"
            name="component-viewer"
            title="Components viewer frame"
            src={visualFrameSrc}
            width="100%"
            height="100%"
            style={{
              display: 'block',
              visibility: 'visible',
              ...(isDragging ? { pointerEvents: 'none' } : {}),
            }}></iframe>
        </div>
      </Spin>
    </div>
  );

  function handleFrameDragOver(e) {
    e.stopPropagation();
    e.preventDefault();
    const { left, top } = coverRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    const position = [e.clientX - left, e.clientY - top] as [number, number];
    if (isGridLayoutNode) {
      // const result = gridData ? gridLayout.getDragOverStatus(e, gridData) : null;
      // newDnd.gridData = result;
      // if (result && parentNode?.props.columns !== result) {
      //   if (typeof onUpdateComponent === 'function') {
      //     onUpdateComponent(
      //       Object.assign({}, parentNode, { props: { ...(parentNode?.props || {}), columns: result } }),
      //     );
      //   }
      // }
    } else {
      handleDragOver(position);
    }
  }

  function handleFrameDrop(e) {
    e.stopPropagation();
    e.preventDefault();
    const { left, top } = coverRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    const data = e.dataTransfer.getData(DRAG_DATA);
    const position = [e.clientX - left, e.clientY - top] as [number, number];

    if (isGridLayoutNode) {
    } else {
      handleDrop(data, position);
    }
  }

  function handleIframeDragEnter(e) {
    e.stopPropagation();
    e.preventDefault();
    handleDragEnter();
  }

  function handleIframeDragLeave(e) {
    e.stopPropagation();
    e.preventDefault();
    handleDragLeave(e);
  }
  function handleFrameLoaded() {
    setFrameLoading(false);
  }

  function handlePostNodeRect(rect) {
    handleNodeRectSelect(rect);
  }

  function handleDropReceived(dndInfo) {
    onDropComponent?.(dndInfo, {});
    setIsDragging(false);
  }

  function handleDragOverReceived(data) {
    handlePlaceholder(data);
  }

  function handleInitiated({ pageId: pid }) {
    if (pid === pageId) {
      setInitiated(true);
    } else {
      setInitiated(false);
    }
  }

  function handleFrameReady({ pageId: pid }) {
    if (pid === pageId) {
      setLoaded(true);
    } else {
      setLoaded(false);
    }
  }

  function handleSelectNode(node) {
    if (node) {
      handleSelectComponent?.(node, 'viewer');
    }
  }

  function handlePageCaptured(img, versionId) {
    onPageCaptured?.(img, versionId);
  }

  function messageHandlers(event) {
    return listener(event, {
      handleFrameLoaded,
      handleInitiated,
      handleFrameReady,
      handlePostNodeRect,
      handleDragOverReceived,
      handleSelectNode,
      handleDropReceived,
      handlePageCaptured,
    });
  }
};
