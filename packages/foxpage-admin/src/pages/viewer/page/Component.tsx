import React from 'react';

import styled from 'styled-components';

import ViewPort from './viewport';

const Container = styled.div`
  height: 100%;
  margin: 0 auto;
  position: relative;
`;
const Index = (props: any) => {
  return (
    <Container>
      <ViewPort
        zoom={props.zoom}
        frameLoaded={props.frameLoaded}
        loadedComponents={props.loadedComponents}
        renderStructure={props.renderStructure}
        win={props.win}
        onClick={props.onClick}
        showPlaceholder={props.showPlaceholder}
        addComponent={props.addComponent}
        onMouseOverComponentChange={props.onMouseOverComponentChange}
        onDoubleClick={props.onDoubleClick}
      />
    </Container>
  );
};

export default Index;
