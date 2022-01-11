import React from 'react';

// import Design from './design';
import Page from './page';

const Index = (props: any) => {
  // return <Design/>;
  return (
    <Page
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
  );
};

export default Index;
