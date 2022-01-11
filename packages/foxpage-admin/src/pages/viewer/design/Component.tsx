import React, { PropsWithRef, useEffect, useRef, useState } from 'react';
import InfiniteViewer from 'react-infinite-viewer';
import Selecto from 'react-selecto';

import Guides from './Guides';
import ViewContext from './ViewContext';
import ViewContainer from './ViewerStyled';
import Viewport from './viewport';

interface Props {
  zoom?: number;
  viewPortHeight?: number;
  viewPortWidth?: number;
}

const Index: React.FC<Props> = (props: Props) => {
  const guideRef = useRef<any>();
  const infiniteViewerRef = useRef<any>();
  const selectoRef = useRef<any>(null);
  const viewportRef = useRef<any>();
  // const viewportRef1 = useRef<any>();
  const zoomPinchEnd = useRef<boolean>(true);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const guideData = guideRef.current ? guideRef.current.getGuides() : {};
  const [moveableGuidelines, setMoveableGuidelines] = useState({
    horizontalGuidelines: guideData.vlGuides || [],
    verticalGuidelines: guideData.hrGuides || [],
  });
  const [zoom, setZoom] = useState<number>(props.zoom || 1);
  const [position, setPosition] = useState({ left: 70, top: 70 });
  const [selectTargets, setSelectTargets] = useState<Array<HTMLElement>>([]);

  const { viewPortHeight = 600, viewPortWidth = 375 } = props;

  const setGuidelines = (hrGuides: any = [], vlGuides: any = []) => {
    const root = document.getElementById('fox-banner-design');
    const { left: rootLeft = 0, top: rootTop = 0 } = root ? root.getBoundingClientRect() : {};
    console.log(rootLeft, rootTop);
    if (viewportRef.current) {
      const horizontalGuidelines = (vlGuides || guideData.vlGuides)
        .map((item: number) => Number(item) + rootLeft)
        .concat([rootLeft, viewPortWidth + rootLeft, viewPortWidth / 2 + rootLeft]);
      setMoveableGuidelines({
        horizontalGuidelines: (hrGuides || guideData.hrGuides).map((item: number) => Number(item) + rootTop),
        verticalGuidelines: horizontalGuidelines,
      });
    }
  };

  const handleInfiniteViewerReset = () => {
    if (infiniteViewerRef.current) {
      infiniteViewerRef.current.scrollCenter();
    }
    setZoom(1);
    // window.parent.postMessage({
    //   type: 'iframe_update_zoom',
    //   zoom: 1,
    // });
  };

  useEffect(() => {
    setGuidelines();
  }, [position]);

  useEffect(() => {
    // setTargets([].slice.call(document.querySelectorAll(TARGET)));
    const initGuide = guideRef.current;
    function resizeFunc() {
      if (initGuide) {
        initGuide.resize();
      }
      const initView = infiniteViewerRef.current;
      if (initView) {
        initView.scrollCenter();
      }
      if (viewportRef.current) {
        setTimeout(() => {
          setPosition(viewportRef.current.getPosition());
        }, 200);
      }
    }
    window.addEventListener('resize', resizeFunc, false);
    handleInfiniteViewerReset();
    resizeFunc();
    setTimeout(() => {
      handleInfiniteViewerReset();
    });
    return () => {
      window.removeEventListener('resize', resizeFunc);
    };
  }, []);

  const handleInfiniteViewerScroll = (scrollLeft = 0, scrollTop = 0) => {
    if (guideRef.current) {
      guideRef.current.scroll(scrollLeft, scrollTop);
    }
    setGuidelines();
    if (viewportRef.current) {
      setPosition(viewportRef.current.getPosition());
    }
    const editor = viewportRef.current.getEditor();
    if (editor) {
      editor.resize();
    }
  };

  const handleInfiniteViewerAbortPinch = (e: any) => {
    const selecto = selectoRef.current;
    if (selecto) {
      selecto.triggerDragStart(e.inputEvent);
    }
  };

  const handlePinch = (e: any) => {
    if (viewportRef.current.getEditor().isDragging()) {
      return;
    }
    setZoom(e.zoom);
    // window.parent.postMessage({
    //   type: 'iframe_update_zoom',
    //   zoom: e.zoom,
    // });
    if (!zoomPinchEnd.current && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    zoomPinchEnd.current = false;
    timeoutRef.current = setTimeout(() => {
      zoomPinchEnd.current = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }, 1000);
  };

  const handleSelectStart = (e: any) => {
    const { target } = e.inputEvent;
    const containIt = selectTargets.some(t => t && (t === target || t.contains(target)));
    // group selected need to refresh parent position
    // one selected, only drag need to refresh
    if (
      (viewportRef.current && viewportRef.current.getPosition && selectTargets.length > 1) ||
      ((viewportRef.current.getCurAction() === 'start-drag' || viewportRef.current.getCurAction() === 'start-resize') &&
        !containIt)
    ) {
      setPosition(viewportRef.current.getPosition());
    }
    if (viewportRef.current.getEditor().getMoveable().isMoveableElement(target) || containIt) {
      e.stop();
    }
  };

  const handleSelectEnd = (e: any) => {
    const { isDragStart, selected, inputEvent } = e;
    if (isDragStart) {
      inputEvent.preventDefault();
    }
    setSelectTargets(selected);
    // window.parent.postMessage({
    //   type: 'iframe_select_component',
    //   componentId: (selected.length === 0 || selected.length > 1) ? undefined : selected[0].getAttribute('id'),
    // });
    // iframe_select_component
    setTimeout(() => {
      if (!isDragStart) {
        return;
      }
      if (viewportRef.current.getEditor()) {
        viewportRef.current.getEditor().getMoveable().dragStart(inputEvent);
      }
    }, 100);
  };

  const handleSelectoScroll = (e: any) => {
    const { direction } = e;
    if (infiniteViewerRef.current) {
      infiniteViewerRef.current.scrollBy(direction[0] * 10, direction[1] * 10);
    }
  };

  return (
    <ViewContext.Provider value={{ guideRef, infiniteViewerRef, selectoRef, parentPosition: position }}>
      <ViewContainer id="fox-banner-design">
        <Guides
          ref={guideRef}
          zoom={zoom}
          horizontalSnapGuides={[0, viewPortHeight, viewPortHeight / 2]}
          verticalSnapGuides={[0, viewPortWidth, viewPortWidth / 2]}
          onReset={handleInfiniteViewerReset}
          onChangeGuides={setGuidelines}
        />
        <InfiniteViewer
          ref={infiniteViewerRef}
          className="fox-design-viewer"
          usePinch
          useForceWheel
          pinchThreshold={50}
          zoom={zoom}
          onScroll={(e: { scrollLeft: number; scrollTop: number }) =>
            handleInfiniteViewerScroll(e.scrollLeft, e.scrollTop)
          }
          onAbortPinch={handleInfiniteViewerAbortPinch}
          onPinch={handlePinch}
        >
          {/* <Viewport
            targetsSelector="target"
            components={[]}
            width={viewPortWidth}
            height={viewPortHeight}
            ref={viewportRef}
            selectTargets={selectTargets}
            guidelines={moveableGuidelines}
          /> */}
          <div>
            <Viewport
              targetsSelector="target"
              components={[]}
              width={viewPortWidth}
              height={viewPortHeight}
              ref={viewportRef}
              // selectTargets={selectTargets}
              guidelines={moveableGuidelines}
            />
            <Viewport
              targetsSelector="target1"
              components={[]}
              width={viewPortWidth}
              height={viewPortHeight}
              ref={viewportRef}
              selectTargets={selectTargets}
              guidelines={moveableGuidelines}
            />
          </div>
          <Selecto
            ref={selectoRef}
            // container={window}
            dragContainer=".fox-design-viewer"
            selectableTargets={['.target1']}
            selectByClick
            selectFromInside={false}
            // continueSelect={false}
            toggleContinueSelect={['shift']}
            keyContainer={window}
            hitRate={0}
            ratio={0}
            preventDefault
            scrollOptions={
              infiniteViewerRef.current
                ? {
                    container: infiniteViewerRef.current.getContainer(),
                    threshold: 30,
                    throttleTime: 30,
                    getScrollPosition: () => [
                      infiniteViewerRef.current.getScrollLeft(),
                      infiniteViewerRef.current.getScrollTop(),
                    ],
                  }
                : undefined
            }
            onDragStart={handleSelectStart}
            // onSelect={handleSelect}
            onSelectEnd={handleSelectEnd}
            onScroll={handleSelectoScroll}
          />
        </InfiniteViewer>
      </ViewContainer>
    </ViewContext.Provider>
  );
};

export default Index;
