import React, { useContext } from 'react';

import {
  ApartmentOutlined,
  AppstoreAddOutlined,
  ControlOutlined,
  // FunctionOutlined,
  SlidersOutlined,
} from '@ant-design/icons';
import { Tooltip } from 'antd';

import { BuilderWindow } from '@/types/index';

import { FoxContext } from '../context';

import ComponentDrawer from './components/Drawer';

interface IProps {
  menu: { [key in 'structure' | 'components']?: boolean };
  onMenuChange: (menu: { [key in 'structure' | 'components']?: boolean }) => void;
  structurePinned: boolean;
  onStructurePushpin: (status: boolean) => void;
}

const MENUS = [
  {
    name: 'components',
    icon: AppstoreAddOutlined,
    i18n: 'componentListTitle',
  },
  {
    name: 'structure',
    icon: ApartmentOutlined,
    i18n: 'structureTitle',
  },
  {
    name: 'variable',
    icon: SlidersOutlined,
    i18n: 'variableListTitle',
  },
  {
    name: 'condition',
    icon: ControlOutlined,
    i18n: 'conditionListTitle',
  },
  // {
  //   name: 'function',
  //   icon: FunctionOutlined,
  //   i18n: 'functionListTitle',
  // },
];

const SimpleEntry = (props: IProps) => {
  const { events, foxI18n, config } = useContext(FoxContext);
  const { onMenuChange, onStructurePushpin, menu, structurePinned } = props;
  const { onWindowChange } = events;
  let menus = [...MENUS];
  if (config.sys?.readOnly) {
    menus = [MENUS[1]];
  }

  const handleChangeMenu = (value: string) => {
    if (['components', 'structure'].includes(value)) {
      onMenuChange({ [value]: !menu[value] });
      if (value === 'structure' && structurePinned && menu.structure) {
        onStructurePushpin(false);
      }
    } else {
      if (typeof onWindowChange === 'function') {
        if (value) {
          onWindowChange(value as BuilderWindow, { status: true });
        }
      }
    }
  };

  return (
    <>
      <div className="container">
        {menus.map((item) => {
          const { icon: Icon } = item;
          return (
            <Tooltip key={item.name} title={foxI18n[item.i18n]} placement="right">
              <div
                className={`entry w-full p-3 cursor-pointer text-center hover:text-fox hover:bg-gray-100 ${
                  menu[item.name] || (structurePinned && item.name === 'structure' && !menu.components)
                    ? 'text-fox border-r border-r-fox border-r-solid bg-gray-100'
                    : ''
                }`}
                onClick={() => {
                  handleChangeMenu(item.name);
                }}>
                <Icon className="font-medium" />
              </div>
            </Tooltip>
          );
        })}
      </div>

      {menu?.components && (
        <ComponentDrawer visible={true} onVisible={() => onMenuChange({ ...menu, components: false })} />
      )}
    </>
  );
};

export default SimpleEntry;
