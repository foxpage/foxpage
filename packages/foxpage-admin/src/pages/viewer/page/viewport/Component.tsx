import React from 'react';

import { IWindow } from '@/types/index';

import Frame from '../components/frame';

import BodyView from './BodyView';

interface ViewPortProps {
  zoom: string | number;
  frameLoaded: (win: Window) => void;
  loadedComponents: any;
  renderStructure: any;
  win: IWindow;
  onClick: (id: string) => void;
  showPlaceholder: (visible: boolean, dndParams: any, offSet: { scrollX: number; scrollY: number }) => void;
  addComponent: (
    type: 'insert' | 'append',
    componentId: string,
    pos: string,
    desc: any,
    parentId: string,
  ) => void;
  onMouseOverComponentChange: (component?: any) => void;
  onDoubleClick: (component?: any) => void;
}

const Index: React.FC<ViewPortProps> = (props: any) => {
  const {
    zoom,
    loadedComponents,
    renderStructure,
    frameLoaded,
    showPlaceholder,
    addComponent,
    onMouseOverComponentChange,
    onDoubleClick,
  } = props;
  return (
    <Frame
      src={__DEV__ ? 'environment.html' : '/page/dist/environment.html'}
      mountTarget="#mount-point"
      frameBorder="0"
      scrolling="yes"
      width="100%"
      height="100%"
      frameLoaded={frameLoaded}
      zoom={zoom}
      childrens={[
        <style />,
        <BodyView
          onMouseOverComponentChange={onMouseOverComponentChange}
          onDoubleClick={onDoubleClick}
          showPlaceholder={showPlaceholder}
          loadedComponents={loadedComponents}
          renderStructure={renderStructure}
          win={props.win}
          onClick={props.onClick}
          addComponent={addComponent}
        />,
      ]}
    />
  );
};

export default Index;
