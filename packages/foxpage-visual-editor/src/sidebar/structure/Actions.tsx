import React, { CSSProperties } from 'react';

import styled from 'styled-components';

import { CusButton, PushFillIcon, PushIcon, RightCloseIcon } from '@/components/index';

const Container = styled.div`
  display: flex;
`;

interface IProps {
  pushpin?: boolean;
  style?: CSSProperties;
  onPushpin?: () => void;
  onClose?: () => void;
}

const Actions = (props: IProps) => {
  const { pushpin, style = {}, onClose, onPushpin } = props;
  return (
    <Container style={style}>
      <CusButton icon={!pushpin ? <PushIcon /> : <PushFillIcon />} onClick={onPushpin} />
      <CusButton icon={<RightCloseIcon />} onClick={onClose} />
    </Container>
  );
};

export default Actions;
