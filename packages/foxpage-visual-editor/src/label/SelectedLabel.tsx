import React, { useContext, useEffect, useState } from 'react';

import { ControlOutlined, CopyOutlined, DeleteOutlined, SelectOutlined } from '@ant-design/icons';
import { Popconfirm } from 'antd';
import styled from 'styled-components';

import { ComponentStructure, RectType } from '@/types/component';

import { UPDATE_SELECT_COMPONENT_LABEL } from '../constant';
import viewerContext from '../viewerContext';

const Box = styled.div`
  position: absolute;
  outline: 3px solid #1890ff;
  font-size: 12px;
  outline-offset: -3px;
  pointer-events: none;
  padding: 0 8px;
  min-height: 4px;
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

interface SelectedLabelProps {
  zoom?: number;
  selectedComponent?: ComponentStructure;
  copyComponent: (id: string) => void;
  deleteComponent: (id: string) => void;
  openConditionBind: () => void;
  jumpToTemplate: () => void;
}

const getMainEl = () => document.getElementById('foxpage-visual-main');

const SelectedLabel: React.FC<SelectedLabelProps> = (props) => {
  const {
    zoom = 1,
    selectedComponent,
    deleteComponent,
    copyComponent,
    openConditionBind,
    jumpToTemplate,
  } = props;
  const [labelStyle, setLabelStyle] = useState<RectType | null>(null);
  const { foxpageI18n } = useContext(viewerContext);
  const [scrollXY, setScrollXY] = useState({ scrollTop: 0, scrollLeft: 0 });

  const messageListener = (event: MessageEvent) => {
    const { data } = event;
    const { type } = data;
    switch (type) {
      case UPDATE_SELECT_COMPONENT_LABEL:
        const selectedEle = selectedComponent?.id
          ? window.document.getElementById(selectedComponent.id)
          : null;
        setTimeout(() => {
          setRect(selectedEle);
        }, 300);
        break;
      default:
        break;
    }
  };

  const handleScroll = () => {
    const mainEl = getMainEl();
    setScrollXY({ scrollTop: mainEl?.scrollTop || 0, scrollLeft: mainEl?.scrollLeft || 0 });
  };

  useEffect(() => {
    const selectedEle = selectedComponent?.id ? window.document.getElementById(selectedComponent.id) : null;
    if (selectedEle) {
      setTimeout(() => {
        setRect(selectedEle);
      });
    } else {
      setLabelStyle(null);
    }
    window.addEventListener('message', messageListener, false);
    getMainEl()?.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('message', messageListener);
      getMainEl()?.removeEventListener('scroll', handleScroll);
    };
  }, [selectedComponent]);

  const setRect = (ele: HTMLElement | null, callBack?: () => void) => {
    if (!ele) {
      return;
    }
    const wrapper = ele.getAttribute('data-node-wrapper');
    const wrapperELe = wrapper ? window.document.getElementById(wrapper) : null;

    // get select element && position info
    const selectEleRect = wrapperELe ? wrapperELe.getBoundingClientRect() : ele.getBoundingClientRect();
    const finalEle = wrapperELe || ele;

    // get root element && position info
    const rootEle = window.document.getElementById('foxpage-visual-main');
    // get top & left value
    const top = selectEleRect.top + (rootEle?.scrollTop || 0);
    const left = selectEleRect.left + (rootEle?.scrollLeft || 0);

    setLabelStyle({
      top: top,
      left: left,
      height: finalEle.offsetHeight * zoom,
      width: finalEle.offsetWidth * zoom,
    });

    if (selectEleRect.top < 0 || (selectEleRect.bottom && selectEleRect.bottom > window.innerHeight)) {
      callBack && callBack();
    }
  };

  const { scrollTop } = scrollXY;
  const { top = 0, height = 0 } = labelStyle || {};

  // 0 is relative position
  let smartTop = 0 - TOOLBAR_HEIGHT;
  if (scrollTop + TOOLBAR_HEIGHT > top) {
    smartTop = scrollTop - top;
  }
  if (scrollTop > top + height) {
    smartTop = height;
  }

  return (
    <React.Fragment>
      {labelStyle && labelStyle.width > 0 && (
        <Box style={{ ...labelStyle, height: (labelStyle.height || 0) + 1 }}>
          <Label style={{ top: smartTop }}>{selectedComponent?.label || selectedComponent?.name}</Label>
          {selectedComponent && !selectedComponent.belongTemplate ? (
            <ToolBar
              style={{
                top: smartTop,
              }}>
              <Button onClick={openConditionBind}>
                <ControlOutlined />
              </Button>
              <Popconfirm
                title={foxpageI18n.copyComponentTip}
                onConfirm={() => {
                  copyComponent(selectedComponent.wrapper || selectedComponent.id);
                }}
                okText={foxpageI18n.yes}
                cancelText={foxpageI18n.no}>
                <Button>
                  <CopyOutlined />
                </Button>
              </Popconfirm>

              <Popconfirm
                title={foxpageI18n.deleteComponentTip}
                onConfirm={() => {
                  deleteComponent(selectedComponent.wrapper || selectedComponent.id);
                }}
                okText={foxpageI18n.yes}
                cancelText={foxpageI18n.no}>
                <Button>
                  <DeleteOutlined />
                </Button>
              </Popconfirm>
            </ToolBar>
          ) : (
            <ToolBar
              style={{
                top: smartTop,
              }}>
              <Popconfirm
                title={foxpageI18n.editTemplateComponentTip}
                onConfirm={() => {
                  jumpToTemplate();
                }}
                okText={foxpageI18n.yes}
                cancelText={foxpageI18n.no}>
                <Button>
                  <SelectOutlined />
                </Button>
              </Popconfirm>
            </ToolBar>
          )}
        </Box>
      )}
    </React.Fragment>
  );
};

export default SelectedLabel;
