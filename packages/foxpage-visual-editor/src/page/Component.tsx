import React from 'react';

import styled from 'styled-components';

import ViewPort from './viewport';

const Container = styled.div`
  height: 100%;
  margin: 0 auto;
  position: relative;
`;
const Index = props => {
  return (
    <Container>
      <ViewPort {...props} />
    </Container>
  );
};

export default Index;
