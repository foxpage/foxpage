import React, { CSSProperties } from 'react';

import { CusButton, PushFillIcon, PushIcon, RightCloseIcon } from '../../components';

interface IProps {
  pushpin?: boolean;
  style?: CSSProperties;
  onPushpin?: () => void;
  onClose?: () => void;
}

const Actions = (props: IProps) => {
  const { pushpin, style = {}, onClose, onPushpin } = props;
  return (
    <div style={{ alignItems: 'center', ...style }} className="flex">
      <CusButton icon={pushpin ? <PushFillIcon /> : <PushIcon />} onClick={onPushpin} />
      <CusButton icon={<RightCloseIcon />} onClick={onClose} />
    </div>
  );
};

export default Actions;
