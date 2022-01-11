import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';

import Guides from '@scena/react-guides';
import { Tooltip } from 'antd';
import styled from 'styled-components';

const RestBox = styled.div`
  position: absolute !important;
  background-color: #f0958e;
  width: 20px;
  height: 20px;
  z-index: 10;
  box-sizing: border-box;
  left: 0;
  top: 0;
  :hover {
    cursor: pointer;
    background-color: #f18178;
  }
`;

const HrGuide = styled.div`
  left: 30px;
  height: 30px;
  width: calc(100% - 30px);
  position: absolute;
  z-index: 10;
`;

const VlGuide = styled.div`
  left: 0;
  top: 30px;
  height: calc(100% - 30px);
  width: 30px;
  position: absolute;
  z-index: 10;
`;

const guideOptions = {
  lineColor: '#dbdbdb',
  textColor: '#a3b1b8',
  backgroundColor: '#fbfbfb',
  snapThreshold: 5,
  direction: 'start',
  displayDragPos: true,
  dragPosFormat: (v: number) => `${v}px`,
};

interface GuideProps {
  container?: HTMLElement;
  zoom: number;
  horizontalSnapGuides: Array<number>;
  verticalSnapGuides: Array<number>;
  onReset: React.MouseEventHandler<HTMLDivElement>;
  onChangeGuides: any;
}

type GuideHandle = {
  resize: () => void;
  scroll: () => void;
  getGuides: () => void;
};

const Guide: React.ForwardRefRenderFunction<GuideHandle, GuideProps> = (props, ref) => {
  const [hrGuides, setHrGuides] = useState<Array<number>>([]);
  const [vlGuides, setVlGuides] = useState<Array<number>>([]);
  const hrGuide = useRef<any>(null);
  const vlGuide = useRef<any>();
  const {
    zoom = 1,
    horizontalSnapGuides = [],
    verticalSnapGuides = [],
    onReset = () => {},
    onChangeGuides = () => {},
  } = props;

  let unit = 50;

  if (zoom < 0.8) {
    unit = Math.floor(1 / zoom) * 50;
  }

  const resize = () => {
    if (hrGuide && hrGuide.current && hrGuide.current.resize) {
      hrGuide.current.resize();
    }
    if (vlGuide && vlGuide.current && vlGuide.current.resize) {
      vlGuide.current.resize();
    }
  };

  const scroll = (scrollLeft = 0, scrollTop = 0) => {
    if (hrGuide && hrGuide.current) {
      hrGuide.current.scroll(scrollLeft);
      hrGuide.current.scrollGuides(scrollTop);
    }
    if (vlGuide && vlGuide.current) {
      vlGuide.current.scroll(scrollTop);
      vlGuide.current.scrollGuides(scrollLeft);
    }
  };

  useImperativeHandle(ref, () => ({
    resize,
    scroll,
    getGuides: () => ({
      hrGuide: hrGuide.current,
      vlGuide: vlGuide.current,
      hrGuides,
      vlGuides,
    }),
  }));

  return (
    <React.Fragment>
      <Tooltip title="Back to the origin">
        <RestBox className="rest-box" onClick={onReset} />
      </Tooltip>
      <HrGuide>
        <Guides
          ref={hrGuide}
          {...guideOptions}
          // container={container || window}
          type="horizontal"
          direction="start"
          snapThreshold={5}
          snaps={[...horizontalSnapGuides, ...hrGuides]}
          zoom={zoom}
          unit={unit}
          onChangeGuides={({ guides }) => {
            setHrGuides(guides);
            onChangeGuides(guides, vlGuides);
          }}
        />
      </HrGuide>
      <VlGuide>
        <Guides
          ref={vlGuide}
          {...guideOptions}
          // container={container || window}
          direction="start"
          type="vertical"
          snaps={[...verticalSnapGuides, ...vlGuides]}
          zoom={zoom}
          unit={unit}
          onChangeGuides={({ guides }) => {
            setVlGuides(guides);
            onChangeGuides(hrGuides, guides);
          }}
        />
      </VlGuide>
    </React.Fragment>
  );
};

export default forwardRef(Guide);
