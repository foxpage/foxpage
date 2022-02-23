import React, { useContext, useEffect, useState } from 'react';

import { ControlOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { Popconfirm } from 'antd';
import styled from 'styled-components';

import { UPDATE_SELECT_COMPONENT_LABEL } from '../constant';
import { ComponentStructure, RectType } from '../interface';
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
  border-radius: 0px;
  padding: 0px;
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

const BUTTON_WIDTH = 52;

interface SelectedLabelProps {
  selectedComponent?: ComponentStructure;
  copyComponent: (id: string) => void;
  deleteComponent: (id: string) => void;
  openConditionBind: () => void;
}

const SelectedLabel: React.FC<SelectedLabelProps> = props => {
  const { selectedComponent, deleteComponent, copyComponent, openConditionBind } = props;
  const [labelStyle, setLabelStyle] = useState<RectType | null>(null);
  const { foxpageI18n } = useContext(viewerContext);

  const messageListener = (event: MessageEvent) => {
    const { data } = event;
    const { type } = data;
    switch (type) {
      case UPDATE_SELECT_COMPONENT_LABEL:
        const selectedEle = selectedComponent?.id ? window.document.getElementById(selectedComponent.id) : null;
        setTimeout(() => {
          setRect(selectedEle);
        });
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const selectedEle = selectedComponent?.id ? window.document.getElementById(selectedComponent.id) : null;
    if (selectedEle) {
      setTimeout(() => {
        setRect(selectedEle, () => {
          selectedEle.scrollIntoView();
        });
      });
    } else {
      setLabelStyle(null);
    }
    window.addEventListener('message', messageListener, false);
    return () => {
      window.removeEventListener('message', messageListener);
    };
  }, [selectedComponent]);

  const setRect = (ele: HTMLElement | null, callBack?: () => void) => {
    if (!ele) {
      return;
    }
    const wrapper = ele.getAttribute('data-node-wrapper');
    const wrapperELe = wrapper ? window.document.getElementById(wrapper) : null;
    const selectEleRect = wrapperELe ? wrapperELe.getBoundingClientRect() : ele.getBoundingClientRect();
    const finalEle = wrapperELe || ele;
    setLabelStyle({
      top: finalEle.offsetTop,
      height: finalEle.offsetHeight,
      left: finalEle.offsetLeft,
      width: finalEle.offsetWidth,
    });
    if (selectEleRect.top < 0 || (selectEleRect.bottom && selectEleRect.bottom > window.innerHeight)) {
      callBack && callBack();
    }
  };

  return (
    <React.Fragment>
      {labelStyle && labelStyle.width > 0 && (
        <Box style={{ ...labelStyle }}>
          {selectedComponent && !selectedComponent.belongTemplate && (
            <ToolBar
              style={{
                top: labelStyle.top > 20 ? -20 : 'auto',
                bottom: labelStyle.top > 20 ? 'auto' : -20,
                right: labelStyle.width < BUTTON_WIDTH ? labelStyle.width - BUTTON_WIDTH - 3 : 0,
              }}
            >
              <Button onClick={openConditionBind}>
                <ControlOutlined />
              </Button>
              <Popconfirm
                title={foxpageI18n.copyComponentTip}
                onConfirm={() => {
                  copyComponent(selectedComponent.wrapper || selectedComponent.id);
                }}
                okText={foxpageI18n.yes}
                cancelText={foxpageI18n.no}
              >
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
                cancelText={foxpageI18n.no}
              >
                <Button>
                  <DeleteOutlined />
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
