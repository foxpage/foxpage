import React, { useContext, useMemo } from 'react';

import { EditorContext, FoxContext } from '@/context/index';
import { DropContext } from '@/dnd/index';
import { DropInfo } from '@/types/index';
import { findHeadAndBody } from '@/utils/index';

import { Iframe } from './Iframe';
import { Body, Head } from './page';

interface IProps {
  onPlaceholder: (value: { visible: boolean; dndParams: DropInfo }) => void;
}

export const MainView = (props: IProps) => {
  const { config, renderDSL: structure, components, events } = useContext(FoxContext);
  const { zoom, events: EditorEvents } = useContext(EditorContext);
  const { onPlaceholder } = props;
  const { onDropComponent, onFrameLoaded } = events;
  const { head, body } = findHeadAndBody(structure, components);
  const bodyStructure = config.page?.fileType === 'block' ? structure : body?.children;

  // @ts-ignore
  const { visualFrameSrc } = config.sys || {};

  if (!visualFrameSrc) {
    return null;
  }

  const render = useMemo(() => {
    return (
      <Iframe
        src={visualFrameSrc}
        frameBorder="0"
        scrolling="yes"
        width="100%"
        height="100%"
        mountTarget="#mount-point"
        zoom={zoom}
        transformOrigin={zoom > 1 ? '0 0' : '50% 50%'}
        onLoaded={onFrameLoaded}
        head={<Head renderStructure={head?.children || []} />}
        body={
          <DropContext onPlaceholder={onPlaceholder} onDropComponent={onDropComponent}>
            <Body renderStructure={bodyStructure || []} onSelectNode={EditorEvents.selectComponent} />
          </DropContext>
        }
      />
    );
  }, [head, body, zoom, onFrameLoaded]);

  return render;
};
