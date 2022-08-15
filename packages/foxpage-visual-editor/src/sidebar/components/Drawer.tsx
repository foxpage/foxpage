import React, { useContext } from 'react';

import { Drawer } from 'antd';

import { CusButton, RightCloseIcon } from '@/components/index';
import { FoxContext } from '@/context/index';

import Main from './Main';

type IProps = {
  visible?: boolean;
  onVisible: (visible: boolean) => void;
};

const ComponentDrawer = (props: IProps) => {
  const { foxI18n } = useContext(FoxContext);
  const { visible, onVisible } = props;

  const dragLeave = () => {
    onVisible(false);
  };

  return (
    <Drawer
      title={<span style={{ fontSize: '14px' }}>{foxI18n.componentListTitle}</span>}
      placement="left"
      visible={visible}
      destroyOnClose
      mask={false}
      closable={false}
      extra={
        <CusButton
          icon={<RightCloseIcon />}
          onClick={() => {
            onVisible(false);
          }}
        />
      }
      width={300}
      onClose={() => {
        onVisible(false);
      }}
      headerStyle={{ padding: '4px 8px' }}
      bodyStyle={{ padding: 0 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 38,
        zIndex: 50,
        boxShadow: 'rgba(0, 0, 0, 0.1) 4px 4px 4px 2px',
        overflowY: 'auto',
      }}>
      {visible && (
        <div onDragLeave={dragLeave}>
          <Main />
        </div>
      )}
    </Drawer>
  );
};

export default ComponentDrawer;
