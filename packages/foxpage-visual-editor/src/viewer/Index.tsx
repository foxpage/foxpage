import React, { useContext, useState } from 'react';

import styled from 'styled-components';

import { EditorContext } from '@/context/index';

import { MainView } from './Main';
import Tools from './Tools';

const Container = styled.div`
  background-color: #f2f2f2;
  height: 100%;
  padding: 0 12px 12px;
`;

const Viewer = styled.div`
  position: relative;
  overflow: hidden;
  margin: 0 auto;
  max-width: 1180px;
  height: 100%;
  transition: all 0.3s ease 0s;
  user-select: none;
  background-color: #ffffff;
  box-shadow: rgba(0, 0, 0, 0.05) 0 0 6px 2px;
`;

interface IProps {}

const ViewerIndex = (_props: IProps) => {
  const [placeholder, setPlaceHolder] = useState({});
  const { viewWidth } = useContext(EditorContext);

  return (
    <Container>
      <Viewer style={{ width: viewWidth }}>
        <MainView onPlaceholder={setPlaceHolder} />
        <Tools placeholder={placeholder} />
      </Viewer>
    </Container>
  );
};

export default ViewerIndex;
