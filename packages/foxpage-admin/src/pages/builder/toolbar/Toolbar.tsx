import React, { useCallback, useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import {
  ApartmentOutlined,
  ControlOutlined,
  FunctionOutlined,
  LayoutOutlined,
  SlidersOutlined,
} from '@ant-design/icons';
import { Tooltip } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/component-list';
import GlobalContext from '@/pages/GlobalContext';

import BuilderContext from '../BuilderContext';
import { CHANGE_DRAWER_MENU } from '../constant';
import { postMsg } from '../post-message';

import { Condition, Function, Variable } from './tools';

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  -webkit-box-align: center;
  pointer-events: auto;
  background: rgb(255, 255, 255);
`;

const Icon = styled.div`
  width: 100%;
  padding: 16px 0;
  text-align: center;
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

const mapStateToProps = (store: RootState) => ({
  allComponent: store.builder.componentList.allComponent,
});

const mapDispatchToProps = {
  fetchComponentList: ACTIONS.fetchComponentList,
};

interface IProps {}

type ToolbarProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & IProps;

const Toolbar = (props: ToolbarProps) => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { currentMenu, setCurMenu } = useContext(BuilderContext);
  const {
    locale: {
      business: { global, package: packageI18n },
    },
  } = useContext(GlobalContext);
  const { allComponent, fetchComponentList } = props;

  useEffect(() => {
    if (allComponent.length === 0) {
      fetchComponentList(applicationId);
    }
  }, []);

  const handleMenuClick = useCallback(
    (menu: string) => {
      postMsg(CHANGE_DRAWER_MENU, {
        menu: menu === currentMenu ? '' : menu,
      });

      const newMenu = menu === currentMenu ? undefined : menu;
      setCurMenu(newMenu);
    },
    [currentMenu],
  );

  const messageListener = (event) => {
    const { data } = event;
    const { type } = data;
    switch (type) {
      case CHANGE_DRAWER_MENU: {
        handleMenuClick(data.menu);
        break;
      }
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('message', messageListener, false);
    return () => {
      window.removeEventListener('message', messageListener);
    };
  }, []);

  return (
    <React.Fragment>
      <Container>
        <Icon
          className={currentMenu === 'component' ? 'selected' : ''}
          onClick={() => handleMenuClick('component')}>
          <Tooltip title={packageI18n.component} placement="left">
            <LayoutOutlined style={{ fontSize: 14 }} />
          </Tooltip>
        </Icon>
        <Icon
          className={currentMenu === 'variable' ? 'selected' : ''}
          onClick={() => handleMenuClick('variable')}>
          <Tooltip title={global.variables} placement="left">
            <SlidersOutlined style={{ fontSize: 14 }} />
          </Tooltip>
        </Icon>
        <Icon
          className={currentMenu === 'condition' ? 'selected' : ''}
          onClick={() => handleMenuClick('condition')}>
          <Tooltip title={global.conditions} placement="left">
            <ControlOutlined style={{ fontSize: 14 }} />
          </Tooltip>
        </Icon>
        <Icon
          className={currentMenu === 'function' ? 'selected' : ''}
          onClick={() => handleMenuClick('function')}>
          <Tooltip title={global.functions} placement="left">
            <FunctionOutlined style={{ fontSize: 14 }} />
          </Tooltip>
        </Icon>
        <Icon
          className={currentMenu === 'structure' ? 'selected' : ''}
          onClick={() => handleMenuClick('structure')}>
          <Tooltip title={global.structure} placement="left">
            <ApartmentOutlined style={{ fontSize: 14 }} />
          </Tooltip>
        </Icon>
      </Container>
      {currentMenu === 'variable' && <Variable onClose={() => handleMenuClick('')} />}
      {currentMenu === 'condition' && <Condition onClose={() => handleMenuClick('')} />}
      {currentMenu === 'function' && <Function onClose={() => handleMenuClick('')} />}
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);
