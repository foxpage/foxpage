import React from 'react';

import { DeleteOutlined } from '@ant-design/icons';
import { Button, ButtonProps } from 'antd';
import styled from 'styled-components';

const StyledButton = styled(Button)`
  margin-right: 8px;
  :hover {
    color: red;
    border-color: red;
  }
`;

const DeleteButton: React.FC<ButtonProps> = (props) => {
  return (
    <StyledButton {...props}>
      <DeleteOutlined />
    </StyledButton>
  );
};
export default DeleteButton;
