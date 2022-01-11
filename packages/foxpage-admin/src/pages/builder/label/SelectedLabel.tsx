import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { Popconfirm } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/template';
import { RectType } from '@/types/builder';
import { IWindow } from '@/types/index';

import { SYSTEM_PAGE } from '../constant';

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

const mapStateToProps = (store: RootState) => ({
  selectedComponentId: store.builder.template.selectedComponentId,
  selectedComponent: store.builder.template.selectedComponent,
  versionChange: store.builder.template.versionChange,
});

const mapDispatchToProps = {
  deleteComponent: ACTIONS.deleteComponent,
  copyComponent: ACTIONS.copyComponent,
};

interface IProps {
  win: IWindow;
}
type SelectedLabelProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & IProps;

const SelectedLabel: React.FC<SelectedLabelProps> = props => {
  const { selectedComponentId, selectedComponent, versionChange, win, deleteComponent, copyComponent } = props;
  const { applicationId } = useParams<{ applicationId: string }>();
  const [labelStyle, setLabelStyle] = useState<RectType | null>(null);

  useEffect(() => {
    if (selectedComponentId) {
      if (selectedComponentId === SYSTEM_PAGE) {
        setLabelStyle(null);
        return;
      }
      const selectedEle = win.document.getElementById(selectedComponentId);
      // const root = win.document.querySelector('.frame-content');

      // selectedWrapperComponent
      if (selectedEle) {
        setTimeout(() => {
          setRect(selectedEle, () => {
            selectedEle.scrollIntoView();
          });
        });
      }
    } else {
      setLabelStyle(null);
    }
  }, [selectedComponentId, versionChange]);

  const setRect = (ele: HTMLElement | null, callBack?: () => void) => {
    if (!ele) {
      return;
    }
    let selectEleRect: RectType = {
      top: 0,
      left: 0,
      width: 0,
      height: 0,
      bottom: 0,
    };
    const wrapper = ele.getAttribute('data-node-wrapper');
    const wrapperELe = wrapper ? win.document.getElementById(wrapper) : null;
    selectEleRect = wrapperELe ? wrapperELe.getBoundingClientRect() : ele.getBoundingClientRect();
    setLabelStyle({
      top: selectEleRect.top,
      height: selectEleRect.height,
      left: selectEleRect.left,
      width: selectEleRect.width,
    });
    if (selectEleRect.top < 0 || (selectEleRect.bottom && selectEleRect.bottom > win.innerHeight)) {
      callBack && callBack();
    }
  };

  useEffect(() => {
    if (selectedComponentId) {
      const selectedEle = win.document.getElementById(selectedComponentId);

      const listener = () => {
        setRect(selectedEle);
      };

      // win.removeEventListener('scroll', listener);
      win.addEventListener('scroll', listener);
    }
  }, [selectedComponentId]);

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
              <Popconfirm
                title="Are you sure to copy this component?"
                onConfirm={() => {
                  copyComponent(applicationId, selectedComponent.wrapper || selectedComponent.id);
                }}
                okText="Yes"
                cancelText="No"
              >
                <Button>
                  <CopyOutlined />
                </Button>
              </Popconfirm>

              <Popconfirm
                title="Are you sure to delete this component?"
                onConfirm={() => {
                  deleteComponent(applicationId, selectedComponent.wrapper || selectedComponent.id);
                }}
                okText="Yes"
                cancelText="No"
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

export default connect(mapStateToProps, mapDispatchToProps)(SelectedLabel);
