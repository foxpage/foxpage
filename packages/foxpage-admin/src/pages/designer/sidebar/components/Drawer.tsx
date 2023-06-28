import React from 'react';

import { Drawer } from 'antd';

import { CusButton, RightCloseIcon } from '../../components';
import { drawerStyle } from '../../constant/styleConfig';
import { useFoxpageContext } from '../../context';

import Main from './Main';

type IProps = {
  visible?: boolean;
  onVisible: (visible: boolean) => void;
};

const ComponentDrawer = (props: IProps) => {
  const { foxI18n } = useFoxpageContext();
  const { visible, onVisible } = props;

  const dragLeave = () => {
    onVisible(false);
  };

  const title = <span className="text-sm">{foxI18n.componentListTitle}</span>;
  const extra = (
    <CusButton
      icon={<RightCloseIcon />}
      onClick={() => {
        onVisible(false);
      }}
    />
  );

  return (
    <Drawer
      title={title}
      placement="left"
      open={visible}
      mask={false}
      closable={false}
      extra={extra}
      width={300}
      onClose={() => {
        onVisible(false);
      }}
      headerStyle={drawerStyle.title}
      bodyStyle={drawerStyle.body as any}
      style={drawerStyle.drawer as any}>
      <div onDragLeave={dragLeave} className="flex flex-col flex-1 min-h-0">
        <Main />
      </div>
    </Drawer>
  );
};

export default ComponentDrawer;
