import React, { ReactNode, useContext, useMemo } from 'react';

import { DesktopOutlined, MobileOutlined, TabletOutlined } from '@ant-design/icons';

import { StyledIcon } from '@/pages/preview/Header';
import { GlobalContext } from '@/pages/system';

import { IconMsg } from '../../Main';

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
  viewWidth: string;
  onChange: (value: string) => void;
}

const Device = (props: IProps) => {
  const { viewWidth, onChange } = props;

  const { locale } = useContext(GlobalContext);
  const { builder } = locale.business;

  const handleChange = (value: DeviceMode) => {
    onChange(value.width);
  };

  const currentMode = useMemo(() => {
    return modes.find((item) => item.width === viewWidth) || modes[0];
  }, [viewWidth]);

  return (
    <>
      {modes.map((item) => {
        return (
          <StyledIcon
            key={item.key}
            className={currentMode.key === item.key ? 'selected' : ''}
            onClick={() => handleChange(item)}>
            <>
              {item.icon}
              <IconMsg>{builder[item.key.toLowerCase()]}</IconMsg>
            </>
          </StyledIcon>
        );
      })}
    </>
  );
};

export default Device;
