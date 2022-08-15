import React from 'react';

import styled from 'styled-components';

import Device from './Device';
import Zoom from './Zoom';

const Container = styled.div`
  padding: 4px 8px;
  line-height: 22px;
  font-size: 12px;
  text-align: center;
  /* border-bottom: 1px solid #ddd; */
  background-color: #f2f2f2;
  > div {
    display: inline-block;
  }
`;

interface IProps {
  onZoomChange: (zoom: number) => void;
  onDeviceChange: (width: string) => void;
}

const Toolbar = (props: IProps) => {
  const { onZoomChange, onDeviceChange } = props;

  return (
    <Container>
      <Device onChange={onDeviceChange} />
      <Zoom onChange={onZoomChange} />
    </Container>
  );
};

export default Toolbar;
