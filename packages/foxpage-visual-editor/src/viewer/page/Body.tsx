import React from 'react';

import styled from 'styled-components';

import { IProps, ViewEntry } from '../viewport';

const Container = styled.div`
  height: 100%;
  margin: 0 auto;
  position: relative;
`;

const Index = (props: IProps) => {
  return (
    <Container>
      <ViewEntry {...props} />
    </Container>
  );
};

export default Index;
