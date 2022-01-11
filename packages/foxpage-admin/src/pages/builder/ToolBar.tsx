import React, { useContext } from 'react';

import { ControlOutlined, FunctionOutlined, LayoutOutlined, SlidersOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import styled from 'styled-components';

import Condition from './condition/Component';
import Function from './function/Component';
import Variable from './variable/Component';
import BuilderContext from './BuilderContext';

const Container = styled.div`
  position: absolute;
  top: 32px;
  left: 14px;
  display: flex;
  flex-direction: column;
  -webkit-box-align: center;
  align-items: center;
  pointer-events: auto;
  z-index: 4;
  border-radius: 2px;
  background: rgb(255, 255, 255);
  box-shadow: rgb(39 54 78 / 8%) 0 2px 10px 0, rgb(39 54 78 / 10%) 0 12px 40px 0;
  min-height: 100px;
  padding: 4px 0;
`;

const Icon = styled.div`
  padding: 8px;
  cursor: pointer;
  &:hover {
    color: rgb(65, 80, 88);
    background-color: rgb(242, 242, 242);
  }
  &.selected {
    color: rgb(65, 80, 88);
    background-color: rgb(242, 242, 242);
  }
`;

const ToolBar = () => {
  const { currentMenu, setCurMenu } = useContext(BuilderContext);
  return (
    <React.Fragment>
      <Container>
        <Icon
          className={currentMenu === 'component' ? 'selected' : ''}
          onClick={() => {
            setCurMenu(currentMenu === 'component' ? undefined : 'component');
          }}
        >
          <Tooltip title="Components" placement="left">
            <LayoutOutlined style={{ fontSize: 16 }} />
          </Tooltip>
        </Icon>
        <Icon
          className={currentMenu === 'variable' ? 'selected' : ''}
          onClick={() => {
            setCurMenu(currentMenu === 'variable' ? undefined : 'variable');
          }}
        >
          <Tooltip title="Variables" placement="left">
            <SlidersOutlined style={{ fontSize: 16 }} />
          </Tooltip>
        </Icon>
        <Icon
          className={currentMenu === 'condition' ? 'selected' : ''}
          onClick={() => {
            setCurMenu(currentMenu === 'condition' ? undefined : 'condition');
          }}
        >
          <Tooltip title="Conditions" placement="left">
            <ControlOutlined style={{ fontSize: 16 }} />
          </Tooltip>
        </Icon>
        <Icon
          className={currentMenu === 'function' ? 'selected' : ''}
          onClick={() => {
            setCurMenu(currentMenu === 'function' ? undefined : 'function');
          }}
        >
          <Tooltip title="Functions" placement="left">
            <FunctionOutlined style={{ fontSize: 16 }} />
          </Tooltip>
        </Icon>
      </Container>
      {currentMenu === 'variable' && (
        <Variable
          visible={currentMenu === 'variable'}
          onClose={() => {
            setCurMenu(undefined);
          }}
        />
      )}
      {currentMenu === 'condition' && (
        <Condition
          onClose={() => {
            setCurMenu(undefined);
          }}
        />
      )}
      {currentMenu === 'function' && (
        <Function
          onClose={() => {
            setCurMenu(undefined);
          }}
        />
      )}
    </React.Fragment>
  );
};

export default ToolBar;
