import React from 'react';

import { SelectOutlined } from '@ant-design/icons';
import styled from 'styled-components';

import { ComponentType } from '@/types/builder';

import { handleStartDrag } from './drop-handler';

const Container = styled.div`
  display: flex;
  width: 100%;
  > div[data-drag='drag'] {
    display: none;
  }
  :hover {
    > div[data-drag='drag'] {
      display: block;
    }
  }
`;

interface DragContentProps {
  showPlaceholder: (visible: boolean, dndParams: any, offSet: { scrollX: number; scrollY: number }) => void;
  item: ComponentType;
}
const DragContent: React.FC<DragContentProps> = (props) => {
  const { children } = props;
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
    // ev?.dataTransfer?.setData('data-dsl', JSON.stringify(dsl));
    handleStartDrag(ev, { dsl });
  };

  // const dragEnd = () => {
  //   showPlaceholder(false, {}, { scrollX: 0, scrollY: 0 });
  //   handleDragEnd();
  // };

  return (
    // <Container draggable="true" onDragEnd={dragEnd} onDragStart={drag} onClick={drag}>
    <Container onClick={drag}>
      {children}
      <div data-drag="drag" style={{ lineHeight: '38px', cursor: 'pointer' }} onClick={drag}>
        <SelectOutlined />
      </div>
    </Container>
  );
};

export default DragContent;
