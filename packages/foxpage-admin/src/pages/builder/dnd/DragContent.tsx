import React from 'react';

import { ComponentType } from '@/types/builder';

interface DragContentProps {
  showPlaceholder: (visible: boolean, dndParams: any, offSet: { scrollX: number; scrollY: number }) => void;
  item: ComponentType;
}
const DragContent: React.FC<DragContentProps> = props => {
  const { children, showPlaceholder } = props;
  const drag = (ev: any) => {
    const {
      item: { name, version, id },
    } = props;
    const dsl = {
      name,
      label: name,
      version,
      id,
      type: 'add',
    };
    ev.dataTransfer.setData('data-dsl', JSON.stringify(dsl));
  };

  const dragEnd = () => {
    showPlaceholder(false, {}, { scrollX: 0, scrollY: 0 });
    // // this.props.hidePlaceholder();
    // store.dispatch({
    //   type: ACTIONS.DRAG_COMPONENT_STATE,
    //   state: false,
    // });
    // this.props.onDragEnd();
  };

  return (
    <div draggable="true" onDragStart={drag} onDragEnd={dragEnd}>
      {children}
    </div>
  );
};

export default DragContent;
