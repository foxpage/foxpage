import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import Moveable from 'react-moveable';

import { getComponentStyle, hasChildren, saveChildren, saveComonent, setGroupStyle } from '../../utils/common';

interface EditorProps {
  zoom?: number;
  draggable?: boolean;
  resizable?: boolean;
  rotatable?: boolean;
  targets: Array<HTMLElement>;
  selectTargets: Array<HTMLElement>;
  horizontalGuidelines: Array<number>;
  verticalGuidelines: Array<number>;
  parentPosition: any;
  onClickGroup: (e: any) => void;
  onMoveAction: any;
}
type EditorHandle = {
  getMoveable: () => void;
  resize: () => void;
};

const Editor: React.ForwardRefRenderFunction<EditorHandle, EditorProps> = (props, ref) => {
  const frameMap = useRef(new Map());
  const [elementGuidelines, setElementGuidelines] = useState<Array<HTMLElement>>([]);
  const label = useRef<HTMLDivElement>(null);
  const moveableRef = useRef<any>();
  const {
    draggable = true,
    resizable = true,
    rotatable = true,
    targets,
    selectTargets,
    parentPosition = { left: 0, top: 0 },
    horizontalGuidelines,
    verticalGuidelines,
    onClickGroup,
    onMoveAction,
    zoom = 1,
  } = props;

  const onWindowReisze = () => {
    moveableRef.current.updateRect();
  };

  useEffect(() => {
    window.addEventListener('resize', onWindowReisze);
    return () => {
      window.removeEventListener('resize', onWindowReisze);
    };
  }, []);

  useEffect(() => {
    setElementGuidelines(targets.filter(el => selectTargets.indexOf(el) === -1));
  }, [targets, selectTargets]);

  useImperativeHandle(ref, () => ({
    getMoveable: () => moveableRef.current,
    resize: onWindowReisze,
  }));

  const initframeMap = (event: any) => {
    const { left = '', top = '', transform = '' } = event.target.style;
    frameMap.current.set(event.target.id, {
      translate: [Number(left.replace('px', '')) || 0, Number(top.replace('px', '')) || 0],
      rotate: Number(transform.replace('rotate(', '').replace('deg)', '')) || 0,
    });
  };

  // const setLabel = (clientX: number, clientY: number, text: string) => {
  //   if (label.current && label.current.style) {
  //     label.current.style.cssText = `
  //     display: block;
  //     transform: translate(${clientX - parentPosition.left}px, ${
  //       clientY - 10 - parentPosition.top
  //     }px) translate(-100%, -100%) translateZ(-100px);`;
  //     label.current.innerHTML = text;
  //   }
  // };

  const cancelLabel = () => {
    if (label.current && label.current.style) {
      label.current.style.display = 'none';
    }
  };

  const onDragStart = (event: any) => {
    onMoveAction('start-drag');
    initframeMap(event);
    const frame = frameMap.current.get(event.target.id);
    event.set(frame.translate);
  };

  const onDragGroupStart = ({ events }: any) => {
    if (events) {
      events.forEach((ev: any) => {
        onDragStart(ev);
      });
    }
  };

  const dragIt = (event: any) => {
    const { target, beforeTranslate } = event;
    const frame = frameMap.current.get(event.target.id);
    target.style.left = `${beforeTranslate[0]}px`;
    target.style.top = `${beforeTranslate[1]}px`;
    frame.translate = [beforeTranslate[0], beforeTranslate[1]];
  };

  const onDrag = (event: any) => {
    const { isPinch } = event;
    dragIt(event);
    if (!isPinch) {
      // setLabel(clientX, clientY, `X: ${left.toFixed(1)}px<br/>Y: ${top.toFixed(1)}px`);
    }
  };

  const onDragGroup = (params: any) => {
    const { events, isPinch } = params;
    if (events) {
      events.forEach((item: any) => {
        if (!item.target.getAttribute('data-parent-id')) {
          dragIt(item);
        }
      });

      if (!isPinch) {
        // setLabel(clientX, clientY, `X: ${groupLeft.toFixed(1)}px<br/>Y: ${groupTop.toFixed(1)}px`);
      }
    }
  };

  const onDragEnd = (event: any) => {
    cancelLabel();
    const parentId = event.target.getAttribute('data-parent-id');
    if (parentId) {
      setGroupStyle(parentId, event.target, parentPosition, (element, translate) => {
        initframeMap({ target: element });
        frameMap.current.get(element.id).translate = translate;
      });
    } else {
      saveComonent(event.target, selectTargets);
    }
  };

  const onResizeStart = (event: any) => {
    onMoveAction('start-resize');
    initframeMap(event);
    const frame = frameMap.current.get(event.target.id);

    // Set origin if transform-orgin use %.
    event.setOrigin(['%', '%']);

    // If cssSize and offsetSize are different, set cssSize.
    const style = window.getComputedStyle(event.target);
    const cssWidth = parseFloat(style.width);
    const cssHeight = parseFloat(style.height);
    event.set([cssWidth, cssHeight]);

    if (event.dragStart) {
      event.dragStart.set(frame.translate);
    }
  };

  const onResizeGroupStart = ({ events }: any) => {
    events.forEach((ev: any) => {
      onResizeStart(ev);
    });
  };

  const resizeIt = (event: any) => {
    initframeMap(event);
    const frame = frameMap.current.get(event.target.id);
    const { target, width, height, drag } = event;

    frame.rotate = drag.beforeRotate;

    target.style.width = `${width}px`;
    target.style.height = `${height}px`;
    target.style.left = `${drag.beforeTranslate[0]}px`;
    target.style.top = `${drag.beforeTranslate[1]}px`;
  };

  const onResize = (event: any) => {
    const { isPinch, width, height, target } = event;
    if (hasChildren(target)) {
      const beforeStyle: any = getComponentStyle(target);
      const widthRatio = width / beforeStyle.width;
      const heightRatio = height / beforeStyle.height;
      for (let i = 0; i < target.children.length; i++) {
        const childrenStyle: any = getComponentStyle(target.children[i]);
        target.children[i].style.left = `${childrenStyle.left * widthRatio}px`;
        target.children[i].style.top = `${childrenStyle.top * heightRatio}px`;
        target.children[i].style.width = `${childrenStyle.width * widthRatio}px`;
        target.children[i].style.height = `${childrenStyle.height * heightRatio}px`;
        initframeMap({ target: target.children[i] });
        frameMap.current.get(target.children[i].id).translate = [
          childrenStyle.left * widthRatio,
          childrenStyle.top * heightRatio,
        ];
      }
    }
    resizeIt(event);
    if (!isPinch) {
      // setLabel(clientX, clientY, `W: ${width.toFixed(1)}px<br/>H: ${height.toFixed(1)}px`);
    }
  };

  const onResizeGroup = (params: any) => {
    const { events, isPinch } = params;
    events.forEach((item: any) => {
      if (!item.target.getAttribute('data-parent-id')) {
        resizeIt(item);
      }
    });

    if (!isPinch) {
      // setLabel(clientX, clientY, `W: ${groupWidth.toFixed(1)}px<br/>H: ${groupHeight.toFixed(1)}px`);
    }
  };

  const onResizeEnd = (event: any) => {
    // cancelLabel();
    const { target } = event;
    const parentId = event.target.getAttribute('data-parent-id');
    if (parentId) {
      setGroupStyle(parentId, event.target, parentPosition, (element, translate) => {
        initframeMap({ target: element });
        frameMap.current.get(element.id).translate = translate;
      });
    } else if (hasChildren(target)) {
      saveChildren(target);
    } else {
      saveComonent(event.target, selectTargets);
    }
  };

  const onRotateStart = (event: any) => {
    onMoveAction('start-rotate');
    initframeMap(event);
    const frame = frameMap.current.get(event.target.id);
    event.set(frame.rotate);
    if (event.dragStart) {
      event.dragStart.set(frame.translate);
    }
  };

  const onRotateGroupStart = (params: any) => {
    const { events } = params;
    events.forEach((item: any) => {
      onRotateStart(item);
    });
  };

  const rotateIt = (event: any) => {
    const { target, drag, beforeRotate } = event;
    initframeMap(event);
    const frame = frameMap.current.get(event.target.id);
    let finalTranslate = [0, 0];
    if (drag) {
      frame.translate = drag.beforeTranslate;
      finalTranslate = drag.beforeTranslate;
    } else {
      finalTranslate = frame.translate;
    }

    frame.rotate = beforeRotate;

    target.style.left = `${finalTranslate[0]}px`;
    target.style.top = `${finalTranslate[1]}px`;
    target.style.transform = `rotate(${beforeRotate}deg)`;
  };

  const onRotate = (event: any) => {
    const { isPinch } = event;
    rotateIt(event);
    if (!isPinch) {
      // setLabel(clientX, clientY, `R: ${rotate.toFixed(1)}`);
    }
  };

  const onRotateGroup = (params: any) => {
    const { events, isPinch } = params;
    events.forEach((item: any) => {
      if (!item.target.getAttribute('data-parent-id')) {
        rotateIt(item);
      }
    });

    if (!isPinch) {
      // setLabel(clientX, clientY, `R: ${groupRotate.toFixed(1)}`);
    }
  };

  const onRotateEnd = (event: any) => {
    cancelLabel();
    const parentId = event.target.getAttribute('data-parent-id');
    if (parentId) {
      setGroupStyle(parentId, event.target, parentPosition, (element, translate) => {
        initframeMap({ target: element });
        frameMap.current.get(element.id).translate = translate;
      });
    } else {
      saveComonent(event.target, selectTargets);
    }
  };

  return (
    <React.Fragment>
      <Moveable
        ref={moveableRef}
        target={selectTargets}
        scalable={false}
        warpable={false}
        pinchable={['rotatable']}
        keepRatio={false}
        origin={false}
        originDraggable
        originRelative
        defaultGroupOrigin="50% 50%"
        throttleDrag={1}
        throttleRotate={1}
        throttleResize={1}
        zoom={zoom}
        rotationPosition="top"
        snappable
        snapCenter
        snapGap={false}
        roundable
        isDisplaySnapDigit
        verticalGuidelines={verticalGuidelines}
        horizontalGuidelines={horizontalGuidelines}
        elementGuidelines={elementGuidelines}
        snapDistFormat={v => `${v}px`}
        snapThreshold={5}
        onClick={onClickGroup}
        onClickGroup={onClickGroup}
        draggable={draggable}
        onDragStart={onDragStart}
        onDrag={onDrag}
        onDragEnd={onDragEnd}
        onDragGroupStart={onDragGroupStart}
        onDragGroup={onDragGroup}
        onDragGroupEnd={onDragEnd}
        resizable={resizable}
        onResizeStart={onResizeStart}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        onResizeGroupStart={onResizeGroupStart}
        onResizeGroup={onResizeGroup}
        onResizeGroupEnd={onResizeEnd}
        rotatable={rotatable}
        onRotateStart={onRotateStart}
        onRotate={onRotate}
        onRotateEnd={onRotateEnd}
        onRotateGroupStart={onRotateGroupStart}
        onRotateGroup={onRotateGroup}
        onRotateGroupEnd={onRotateEnd}
      />
      {/* <div className="label" ref={label} /> */}
    </React.Fragment>
  );
};

export default forwardRef(Editor);
