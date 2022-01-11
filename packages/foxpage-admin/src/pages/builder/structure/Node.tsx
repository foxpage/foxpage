import React from 'react';

import { DownOutlined, DragOutlined, RightOutlined } from '@ant-design/icons';
import styled from 'styled-components';

import { ComponentStructure } from '@/types/builder';

import { iconStyle, SYSTEM_PAGE } from '../constant';

const LayerContent = styled.div`
  display: inline-block;
  width: calc(100% - 50px);
  vertical-align: top;
`;

const Content = styled.div`
  width: 100%;
  position: relative;
`;

const TooBar = styled.div`
  display: inline-block;
  padding: 0 4px 0 0;
  text-align: right;
  width: 36px;
`;

const Name = styled.span`
  text-decoration: ${(props: any) => (props.state ? 'line-through' : 'none')};
  color: ${(props: any) => (props.state ? '#999' : '')};
  margin-right: 4px;
`;

const Component = styled.div`
  line-height: 20px;
  padding: 6px 0;
  position: relative;
  border-bottom: 1px dashed #e8e8e8;
  border-left: 2px solid ${(props: any) => (props.isedit ? '#48ad48' : 'transparent')};
  background-color: ${(props: any) => (props.isedit ? '#F7FFFB' : 'transparent')};
  :hover {
    cursor: pointer;
    background-color: #e6f7ff;
  }
`;

const Caret = styled.span`
  width: 14px;
  font-size: 12px;
  display: inline-block;
`;

const DragIcon = styled(DragOutlined)`
  margin-left: 4px;
  color: ${(props: any) => (props.cannotmove === 'true' ? '#ccc' : '')};
  :hover {
    cursor: ${(props: any) => (props.cannotmove === 'true' ? 'not-allowed' : 'move')};
  }
`;

interface Type {
  componentId: string;
  idx: number;
  childNum: number;
  expended: boolean;
  visible: boolean;
  component: ComponentStructure;
  style: any;
  componentSourceMap: any;
  handleSelectComponent: (componentId: string) => void;
  toggleExpend: (e: any) => void;
  dragStart: (e: any, node: any) => void;
  dragEnd: () => void;
}

const Node: React.FC<Type> = props => {
  const {
    componentId,
    visible,
    idx,
    childNum,
    expended,
    style,
    component,
    componentSourceMap,
    toggleExpend,
    dragStart,
    dragEnd,
    handleSelectComponent,
  } = props;

  const selectComponent = (e: any) => {
    e.stopPropagation();
    handleSelectComponent(componentId);
  };

  const canDragIn = componentId === SYSTEM_PAGE ? true : component.enableChildren;
  return visible ? (
    <Component
      key={componentId}
      id={componentId}
      onClick={selectComponent}
      data-component-id={componentId}
      data-type="component"
      data-with-children={canDragIn}
      data-close={!expended}
      data-index={idx + 1}
      data-parent-id={component.parentId}
      style={style}
    >
      {childNum > 0 ? (
        <Caret onClick={toggleExpend}>
          {!expended ? <RightOutlined style={iconStyle} /> : <DownOutlined style={iconStyle} />}
        </Caret>
      ) : (
        <Caret />
      )}
      <LayerContent>
        <Content>
          <Name>{component.label}</Name>
        </Content>
      </LayerContent>
      <TooBar>
        <span style={{ color: '#999' }} title="Children component count">
          {childNum || ''}
        </span>
        {component.id !== SYSTEM_PAGE && (
          <DragIcon
            data-node-id={componentId}
            title="Move"
            draggable
            onDragStart={e => dragStart(e, component)}
            onDragEnd={dragEnd}
          />
        )}
      </TooBar>
    </Component>
  ) : null;
};

export default Node;
