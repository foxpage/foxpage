import React, { useContext, useEffect, useState } from 'react';

import { BugOutlined, ControlOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { Popconfirm } from 'antd';
import styled from 'styled-components';

import { EditorContext, FoxContext } from '@/context/index';
import { getFrameDoc, getFrameWin } from '@/utils/index';

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

const Label = styled.span`
  background-color: rgb(24, 144, 255);
  position: absolute;
  pointer-events: auto;
  left: 0;
  line-height: 20px;
  color: #fff;
  padding: 0 4px;
`;

const TOOLBAR_HEIGHT = 20;

const SelectedLabel = () => {
  const [curZoom, setCurZoom] = useState(1);
  const [updated, setUpdated] = useState(0);
  const { events, foxI18n, config } = useContext(FoxContext);
  const { selectNode, zoom, events: editorEvents } = useContext(EditorContext);
  const [_scrollXY, setScrollXY] = useState({ scrollX: 0, scrollY: 0 });
  const { onCopyComponent, onRemoveComponent, onWindowChange } = events;
  const { openMock } = editorEvents;
  const doc = getFrameDoc();
  const win = getFrameWin();

  const handleScroll = () => {
    const { scrollX, scrollY } = win;
    setScrollXY({ scrollX, scrollY });
  };

  useEffect(() => {
    setTimeout(() => {
      setCurZoom(zoom);
    }, 100);
  }, [zoom]);

  useEffect(() => {
    setTimeout(() => {
      setUpdated(new Date().getTime());
    }, 100);
    win?.addEventListener('scroll', handleScroll);
    return () => {
      win?.removeEventListener('scroll', handleScroll);
    };
  }, [selectNode]);

  const getRect = (ele: HTMLElement | null) => {
    if (!ele) {
      return;
    }
    const wrapper = ele.getAttribute('data-node-wrapper');
    const wrapperELe = wrapper ? getFrameDoc().getElementById(wrapper) : null;

    // get select element && position info
    const selectEleRect = wrapperELe ? wrapperELe.getBoundingClientRect() : ele.getBoundingClientRect();
    const finalEle = wrapperELe || ele;

    return {
      top: selectEleRect.top,
      left: selectEleRect.left,
      height: finalEle.offsetHeight * curZoom,
      width: finalEle.offsetWidth * curZoom,
    };
  };

  const handleConditionBind = () => {
    if (typeof onWindowChange === 'function' && selectNode) {
      onWindowChange('conditionBind', {
        status: true,
        component: selectNode,
      });
    }
  };

  if (!selectNode?.__editorConfig?.editable) return null;

  const selectEle = selectNode?.id ? doc?.getElementById(selectNode.id) : null;
  const { top = 0, height = 0, width = 0, left = 0 } = getRect(selectEle) || {};

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
      {selectEle && (
        <Box style={{ left, top, width, height }}>
          <MountBox>
            {!hideLabel && <Label style={{ top: labelTop }}>{selectNode?.label || selectNode?.name}</Label>}
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
                        openMock && openMock(true);
                      }}>
                      <BugOutlined />
                    </Button>
                  )}

                  <Button onClick={handleConditionBind}>
                    <ControlOutlined />
                  </Button>

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
        </Box>
      )}
    </React.Fragment>
  );
};

export default SelectedLabel;
