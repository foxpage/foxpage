import React from 'react';

import { CloseOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const Container = styled.span`
  position: absolute;
  cursor: pointer;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  color: #00000073;
  display: inline-block;
  &:hover {
    color: #000000bf;
    text-decoration: none;
  }
`;

const RightCloseIcon: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  return (
    <Container
      onClick={() => {
        if (typeof onClose === 'function') {
          onClose();
        }
      }}
    >
      <CloseOutlined />
    </Container>
  );
};

export default RightCloseIcon;
