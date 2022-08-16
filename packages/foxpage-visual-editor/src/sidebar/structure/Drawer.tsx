import React, { useContext, useEffect, useState } from 'react';

import { Drawer } from 'antd';

import { FoxContext } from '@/context/index';

import Actions from './Actions';
import Main from './Main';

type IProps = {
  visible?: boolean;
  pushpin?: boolean;
  onVisible: (visible: boolean) => void;
  onPushpin?: (visible) => void;
};

const StructureDrawer = (props: IProps) => {
  const [delayVisible, setDelayVisible] = useState(false);
  const { foxI18n } = useContext(FoxContext);
  const { visible, pushpin = false, onVisible, onPushpin } = props;

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        setDelayVisible(visible);
      }, 250);
    } else {
      setDelayVisible(visible || false);
    }
  }, [visible]);

  const handlePushpin = () => {
    if (typeof onPushpin === 'function') {
      onPushpin(!pushpin);
    }
  };

  return (
    <Drawer
      title={<span style={{ fontSize: '14px' }}>{foxI18n.structureTitle}</span>}
      placement="left"
      visible={visible}
      destroyOnClose
      mask={false}
      closable={false}
      extra={
        <Actions
          pushpin={pushpin}
          onClose={() => {
            onVisible(false);
          }}
          onPushpin={handlePushpin}
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
      {delayVisible && <Main />}
    </Drawer>
  );
};

export default StructureDrawer;
