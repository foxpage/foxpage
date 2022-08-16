import React from 'react';

import { CloseOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const Container = styled.span`
  color: #939393;
  :hover {
    cursor: pointer;
    color: #000000bf;
  }
`;

export const RightCloseIcon: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  return (
    <Container
      onClick={() => {
        if (typeof onClose === 'function') {
          onClose();
        }
      }}>
      <CloseOutlined />
    </Container>
  );
};

export default RightCloseIcon;
