import React, { useEffect, useState } from 'react';

import { BugOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { Popconfirm } from 'antd';
import styled from 'styled-components';

import { useEditorContext, useFoxpageContext } from '../../context';
import { gridLayout } from '../../extension';

const Box = styled.div`
  position: absolute;
  outline: 3px solid #1890ff;
  font-size: 12px;
  outline-offset: -3px;
  pointer-events: none;
  /* padding: 0 8px; */
  min-height: 4px;
`;

const MountBox = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 100px;
`;

const Button = styled.button`
  font-size: 12px;
  background: rgb(24, 144, 255);
  width: 26px;
  height: 20px;
  color: rgb(255, 255, 255);
  text-align: center;
  line-height: 15px;
  border: none;
  border-radius: 0;
  outline: none;
  padding: 0;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  cursor: pointer;
  &:hover {
    background: rgb(64, 169, 255);
  }
`;

const ToolBar = styled.div`
  background-color: rgb(24, 144, 255);
  position: absolute;
  right: 0;
  pointer-events: auto;
`;

const Label = styled.div`
  background-color: rgb(24, 144, 255);
  pointer-events: auto;
  line-height: 20px;
  color: #fff;
  padding: 0 4px;
`;

const DragBox = styled.div`
  height: 100%;
  width: 10px;
  position: absolute;
  top: 0;
  border-width: 0;
  z-index: 1;
  pointer-events: auto;
  align-items: center;
  justify-content: center;
  display: flex;
  cursor: ew-resize;
  ::after {
    content: '';
    display: block;
    border: 2px solid rgb(24, 144, 255);
    background: rgb(255, 255, 255);
    border-radius: 2px;
    width: 6px;
    height: 50%;
    min-height: 20px;
    margin: 0px auto;
  }
`;

const TOOLBAR_HEIGHT = 20;
const DELAY = 260;

const SelectedLabel = () => {
  const [_updated, setUpdated] = useState(0);
  const { events, foxI18n, config, renderDSL, selectNode, componentMap } = useFoxpageContext();
  const { events: editorEvents, selectRect } = useEditorContext();
  const { onCopyComponent, onRemoveComponent } = events;
  const { handleMockerVisible } = editorEvents;
  const deprecated = selectNode && componentMap[selectNode.name]?.deprecated;

  useEffect(() => {
    const timer = setTimeout(() => {
      setUpdated(new Date().getTime());
    }, DELAY);
    return () => clearTimeout(timer);
  }, [selectNode]);

  const { right: rightDrag = false, left: leftDrag = false } =
    gridLayout.getDragStatus(renderDSL, selectNode) || {};

  const handleStartDrag = (e: any, dragLine: 'left' | 'right') => {
    var img = new Image();
    img.src = '';
    e.dataTransfer.setDragImage(img, 10, 10);
    gridLayout.setDragLine(dragLine);
  };

  const handleEndDrag = () => {
    gridLayout.setDragLine(null);
  };

  const { top = 0, height = 0, width = 0, left = 0 } = selectRect || {};

  // 0 is relative position
  let labelTop = 0;
  if (top <= 0) {
    labelTop = -top;
    if (top < -height) {
      labelTop = height;
    }
  } else if (top > TOOLBAR_HEIGHT) {
    labelTop = -TOOLBAR_HEIGHT;
  } else if (top < TOOLBAR_HEIGHT) {
    labelTop = -top;
  } else {
    labelTop = -TOOLBAR_HEIGHT;
  }

  let hideLabel = false;
  if (width < 150) {
    hideLabel = true;
  }

  return (
    <React.Fragment>
      {selectNode && selectRect && (
        <Box style={{ left, top, width, height }}>
          {leftDrag && (
            <DragBox
              style={{ left: '-6px' }}
              draggable="true"
              onDragStart={(e) => handleStartDrag(e, 'left')}
              onDragEnd={handleEndDrag}
            />
          )}
          <MountBox>
            <div className="absolute left-0" style={{ top: labelTop }}>
              {!hideLabel && (
                <Label>
                  {selectNode?.label || selectNode?.name}
                  {deprecated && <span className="ml-2 text-[#FF0000]">({foxI18n.deprecated})</span>}
                </Label>
              )}
            </div>
            <ToolBar
              style={{
                top: labelTop,
                right: hideLabel ? 'auto' : 0,
              }}>
              {selectNode && (
                <>
                  {config.sys?.mockable && (
                    <Button
                      onClick={() => {
                        handleMockerVisible?.(true);
                      }}>
                      <BugOutlined />
                    </Button>
                  )}

                  {!deprecated && (
                    <Popconfirm
                      title={foxI18n.copyComponentTip}
                      onConfirm={() => {
                        onCopyComponent && onCopyComponent(selectNode);
                      }}
                      okText={foxI18n.yes}
                      cancelText={foxI18n.no}>
                      <Button>
                        <CopyOutlined />
                      </Button>
                    </Popconfirm>
                  )}

                  <Popconfirm
                    title={foxI18n.deleteComponentTip}
                    onConfirm={() => {
                      onRemoveComponent && onRemoveComponent(selectNode);
                    }}
                    okText={foxI18n.yes}
                    cancelText={foxI18n.no}>
                    <Button>
                      <DeleteOutlined />
                    </Button>
                  </Popconfirm>
                </>
              )}
            </ToolBar>
          </MountBox>
          {rightDrag && (
            <DragBox
              style={{ right: '-6px' }}
              draggable="true"
              onDragStart={(e) => handleStartDrag(e, 'right')}
              onDragEnd={handleEndDrag}
            />
          )}
        </Box>
      )}
    </React.Fragment>
  );
};

export default SelectedLabel;
