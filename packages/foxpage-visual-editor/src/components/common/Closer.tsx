import React from 'react';

import { CloseOutlined } from '@ant-design/icons';

export const RightCloseIcon: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  return (
    <div
      className="text-inherit hover:cursor-pointer"
      onClick={() => {
        if (typeof onClose === 'function') {
          onClose();
        }
      }}>
      <CloseOutlined />
    </div>
  );
};

export default RightCloseIcon;
