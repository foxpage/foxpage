import React, { useContext, useEffect, useState } from 'react';

import {
  ApartmentOutlined,
  AppstoreAddOutlined,
  ControlOutlined,
  FunctionOutlined,
  SlidersOutlined,
} from '@ant-design/icons';
import { Tooltip } from 'antd';
import styled from 'styled-components';

import { BuilderWindow } from '@/types/index';

import { FoxContext } from '../context';

import ComponentDrawer from './components/Drawer';
import StructureDrawer from './structure/Drawer';

const Container = styled.div``;

const Button = styled.div`
  width: 100%;
  padding: 16px 0px;
  text-align: center;
  cursor: pointer;
  background-color: ${(props: { select: boolean }) => (props.select ? 'rgb(242, 242, 242)' : 'inherit')};
  :hover {
    color: rgb(65, 80, 88);
    background-color: rgb(242, 242, 242);
  }
`;

interface IProps {
  menu?: string;
  structurePushpin?: boolean;
  onStructurePushpin?: (status: boolean) => void;
}

const MENUS = [
  {
    name: 'components',
    icon: <AppstoreAddOutlined />,
    i18n: 'componentListTitle',
  },
  {
    name: 'structure',
    icon: <ApartmentOutlined />,
    i18n: 'structureTitle',
  },
  {
    name: 'variable',
    icon: <SlidersOutlined />,
    i18n: 'variableListTitle',
  },
  {
    name: 'condition',
    icon: <ControlOutlined />,
    i18n: 'conditionListTitle',
  },
  {
    name: 'function',
    icon: <FunctionOutlined />,
    i18n: 'functionListTitle',
  },
];

const SimpleEntry = (props: IProps) => {
  const [menu, setMenu] = useState('');
  const { events, foxI18n } = useContext(FoxContext);
  const { structurePushpin, onStructurePushpin } = props;
  const { onWindowChange } = events;
  const menus = [...MENUS];

  useEffect(() => {
    setMenu(props.menu || '');
  }, [props.menu]);

  useEffect(() => {
    if (!menu && structurePushpin) {
      setMenu(menus[1].name); // only structure
    }
  }, [structurePushpin, menu]);

  const handleChangeMenu = (value: string) => {
    setMenu(value);
    if (typeof onWindowChange === 'function') {
      if (value) {
        onWindowChange(value as BuilderWindow, { status: true });
      } else {
        onWindowChange(menu as BuilderWindow, { status: false });
      }
    }
  };

  return (
    <>
      <Container>
        {menus.map((item) => (
          <Tooltip key={item.name} title={foxI18n[item.i18n]} placement="right">
            <Button
              select={false}
              onClick={() => {
                handleChangeMenu(item.name);
              }}>
              {item.icon}
            </Button>
          </Tooltip>
        ))}
      </Container>

      {menu === 'components' && (
        <ComponentDrawer
          visible={true}
          onVisible={() => {
            handleChangeMenu('');
          }}
        />
      )}
      {menu === 'structure' && !structurePushpin && (
        <StructureDrawer
          visible={true || !structurePushpin}
          pushpin={structurePushpin}
          onVisible={() => {
            handleChangeMenu('');
          }}
          onPushpin={onStructurePushpin}
        />
      )}
    </>
  );
};

export default SimpleEntry;
