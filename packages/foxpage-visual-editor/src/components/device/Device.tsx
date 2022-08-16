import React, { ReactNode, useContext, useState } from 'react';

import {
  CaretDownOutlined,
  CheckOutlined,
  DesktopOutlined,
  MobileOutlined,
  TabletOutlined,
} from '@ant-design/icons';
import { Popover } from 'antd';

import { FoxContext } from '../../context';
import { Area, Row } from '..';

import './index.css';

type DeviceMode = { key: string; icon: ReactNode; width: string };
const modes: DeviceMode[] = [
  {
    key: 'PC',
    icon: <DesktopOutlined />,
    width: '100%',
  },
  {
    key: 'PAD',
    icon: <TabletOutlined />,
    width: '762px',
  },
  {
    key: 'MOBILE',
    icon: <MobileOutlined />,
    width: '375px',
  },
];

interface IProps {
  onChange: (value: string) => void;
}

const Device = (props: IProps) => {
  const [mode, setMode] = useState(modes[0]);
  const { foxI18n } = useContext(FoxContext);
  const { onChange } = props;

  const handleChange = (value: DeviceMode) => {
    setMode(value);
    onChange(value.width);
  };

  return (
    <Popover
      placement="bottom"
      overlayClassName="foxpage-visual-editor_popover"
      trigger={['hover']}
      content={
        <div style={{ width: '110px' }}>
          <Area>
            {modes.map((item) => (
              <Row
                key={item.key}
                onClick={() => {
                  handleChange(item);
                }}>
                {mode.key === item.key && (
                  <CheckOutlined style={{ position: 'absolute', top: 11, left: 8, fontSize: 10 }} />
                )}
                {item.icon}
                <span style={{ paddingLeft: 4 }}>{foxI18n[item.key.toLowerCase()]}</span>
              </Row>
            ))}
          </Area>
        </div>
      }>
      <div style={{ marginRight: 8 }}>
        {mode.icon}
        <CaretDownOutlined style={{ fontSize: 8, marginLeft: 4 }} />
      </div>
    </Popover>
  );
};

export default Device;
