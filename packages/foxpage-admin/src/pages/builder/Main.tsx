import React from 'react';

import styled from 'styled-components';

import Header from './header/Header';
import Builder from './Builder';

const StyledContent = styled.div`
  height: calc(100% - 52px);
  background: rgb(255, 255, 255);
`;

const Index = () => {
  return (
    <div style={{ height: '100%' }}>
      <Header />
      <StyledContent>
        <Builder />
      </StyledContent>
    </div>
  );
};

export default Index;
