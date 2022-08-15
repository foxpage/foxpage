import React, { ReactNode } from 'react';

import styled from 'styled-components';

const Button = styled.div`
  width: 22px;
  height: 22px;
  line-height: 22px;
  font-size: 12px;
  border-radius: 4px;
  text-align: center;
  color: #656565;
  :hover {
    cursor: pointer;
    background-color: #ddd;
  }
`;

interface IProps {
  icon?: ReactNode | (() => ReactNode);
  onClick?: () => void;
}

const CusButton = (props: IProps) => {
  const { icon, onClick } = props;
  return <Button onClick={onClick}>{typeof icon === 'function' ? icon() : icon}</Button>;
};

export default CusButton;
