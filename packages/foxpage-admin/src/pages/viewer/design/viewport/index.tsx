import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react';

import styled from 'styled-components';

import ViewContext from '../ViewContext';

import Editor from './Editor';

const ViewPortContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #fff;
  box-shadow: #dbdbdb 0px 0px 2px;
  z-index: 1;
`;

interface ComponentProps {}

interface ViewPortProps {
  zoom?: number;
  components: Array<any>;
  height: number;
  width: number;
  draggable?: boolean;
  resizable?: boolean;
  rotatable?: boolean;
  keyboard?: boolean;
  targetsSelector: string;
  embedding?: boolean;
  selectTargets?: Array<HTMLElement>;
  onSaveComponent?: (components: Array<ComponentProps>) => void;
  onDeleteComponent?: (componentIds: Array<string>) => void;
  onDownloadImage?: (imageUrl: string) => void;
  guidelines?: any;
}

type ViewPortHandle = {
  getViewPort: () => void;
  getPosition: () => void;
  getEditor: () => void;
};

const ViewPort: React.ForwardRefRenderFunction<ViewPortHandle, ViewPortProps> = (props, ref) => {
  const {
    zoom = 1,
    // components = [],
    height = 600,
    width = 360,
    draggable = true,
    resizable = true,
    rotatable = true,
    // keyboard = true,
    // embedding = true,
    targetsSelector,
    guidelines = {},
    selectTargets = [],
    // onDeleteComponent = () => {},
    // onSaveComponent = () => {},
    // onDownloadImage = () => {},
  } = props;

  const { selecto }: any = useContext(ViewContext);

  let curAction = '';
  const root = document.getElementById('fox-banner-design');
  const { left: rootLeft = 0, top: rootTop = 0 } = root ? root.getBoundingClientRect() : {};

  const [targets, setTargets] = useState<Array<HTMLElement>>([]);
  const [position] = useState<any>({ left: 70, top: 70 });

  const viewPortRef = useRef<any>(null);
  const editorRef = useRef<any>();

  useEffect(() => {
    setTargets([].slice.call(viewPortRef.current.querySelectorAll(`.${targetsSelector}`)));
  }, []);

  const handleGetCurPosition = () => {
    const viewPort = viewPortRef.current;
    if (viewPort && viewPort.style && viewPort.style.transform) {
      const reg = /translate\((.*?)\)/g;
      const match = viewPort.style.transform.match(reg);
      if (match && match[0]) {
        const [leftStr, topStr] = match[0].replace('translate(', '').replace(')', '').split(',');
        const left = Number(leftStr.replace('px', ''));
        const top = Number(topStr.replace('px', ''));
        return { left: left - 470, top: top - 470 }; // 500  - 30
      }
    }
    return { left: 0, top: 0 };
  };

  useImperativeHandle(ref, () => ({
    getViewPort: () => viewPortRef.current,
    getPosition: handleGetCurPosition,
    getEditor: () => editorRef.current,
    getCurAction: () => curAction,
  }));

  const handleClickGroup = (e: any) => {
    if (selecto) {
      selecto.clickTarget(e.inputEvent, e.inputTarget);
    }
  };

  const handleMoveAction = (actionType: any) => {
    curAction = actionType;
    setTargets([].slice.call(document.querySelectorAll(`.${targetsSelector}`)));
  };

  return (
    <React.Fragment>
      <div
        ref={viewPortRef}
        className="scena-viewport-container"
        style={{ position: 'relative', display: 'inline-block', height, width }}
      >
        <Editor
          draggable={draggable}
          resizable={resizable}
          rotatable={rotatable}
          ref={editorRef}
          targets={targets}
          selectTargets={selectTargets}
          verticalGuidelines={guidelines.verticalGuidelines || []}
          horizontalGuidelines={guidelines.horizontalGuidelines || []}
          zoom={zoom}
          parentPosition={{ left: position.left + rootLeft, top: position.top + rootTop }}
          onClickGroup={handleClickGroup}
          onMoveAction={handleMoveAction}
        />
        <ViewPortContainer className="scena-viewport">
          <div className={targetsSelector} style={{ height: 100, width: 100, background: 'red' }}></div>
          {/* <BodyView
            components={bodyComponents}
            allComponents={components}
            mockInfo={mockInfo}
            loadedComponents={window.designPageLoadedComponents}
            document={window.parent.document}
            window={window.parent}
            composeData={composeData}
          />*/}
        </ViewPortContainer>
      </div>
    </React.Fragment>
  );
};

export default forwardRef(ViewPort);
