import React, { CSSProperties, useContext } from 'react';

import { DownOutlined, DragOutlined, RightOutlined, BugFilled } from '@ant-design/icons';
import { Tooltip } from 'antd';
import styled from 'styled-components';

import { BLANK_NODE } from '@/constant/index';
import { FoxContext } from '@/context/index';
import { RenderStructureNode } from '@/types/index';

const LayerContent = styled.div`
  display: inline-block;
  width: calc(100% - 50px);
  vertical-align: top;
`;

const Content = styled.div`
  position: relative;
`;

const TooBar = styled.div`
  display: inline-block;
  padding: 0 4px 0 0;
  text-align: right;
  width: 36px;
`;

const Name = styled.span`
  text-decoration: ${(props: { state: boolean }) => (props.state ? 'line-through' : 'none')};
  color: ${(props: { state: boolean }) => (props.state ? '#999' : '')};
  margin-right: 4px;
  line-height: 18px;
`;

const Component = styled.div`
  line-height: 18px;
  padding: 8px 0;
  position: relative;
  border-bottom: 1px dashed #e8e8e8;
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
  color: ${(props: { cannotmove: string }) => (props.cannotmove === 'true' ? '#ccc' : '')};
  :hover {
    cursor: ${(props: { cannotmove: string }) => (props.cannotmove === 'true' ? 'not-allowed' : 'move')};
  }
`;

const StatusTagWithChars = styled.span`
  display: inline-block;
  margin: -4px;
  width: 22px;
  height: 22px;
  line-height: 20px;
  font-size: 12px;
  text-align: center;
  border: solid 1px #ffd591;
  transform: scale(0.6);
  margin-right: 2px;
  color: #d46b08;
  background: #fff7e6;
`;

const StatusTag = styled.span`
  display: inline-block;
  width: 5px;
  height: 5px;
  margin: 0 2px;
  border-radius: 50%;
  position: relative;
  top: -1px;
  background-color: ${(props: { color?: string; backgroundColor?: string }) =>
    props.backgroundColor || 'yellow'};
  :hover {
    transform: scale(1.3);
  }
`;

const TagsWrapper = styled.span`
  margin-left: 2px;
  position: relative;
  top: 1px;
`;

export const iconStyle: CSSProperties = {
  transform: 'scale(0.8)',
};

interface IProps {
  idx: number;
  childNum: number;
  expended: boolean;
  component: RenderStructureNode;
  style: any;
  toolBar?: boolean;
  toggleExpend: (e: any) => void;
  dragStart: (e: any, node: RenderStructureNode) => void;
  dragEnd: () => void;
  onSelect: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, node: RenderStructureNode) => void;
}

const Node = (props: IProps) => {
  const { componentMap, foxI18n } = useContext(FoxContext);
  const {
    idx,
    childNum,
    expended,
    style,
    component,
    toolBar,
    toggleExpend,
    dragStart,
    dragEnd,
    onSelect,
  } = props;
  const { id } = component;

  const canDragIn = componentMap[component.name]?.enableChildren;
  const { moveable = true, isExtend, isExtendAndModified, hasCondition, hasVariable, hasMock } =
    component.__editorConfig || {};

  return (
    <Component
      key={id}
      id={id}
      onClick={(e) => {
        onSelect(e, component);
      }}
      data-component-id={id}
      data-type="component"
      data-with-children={canDragIn}
      data-close={!expended}
      data-index={idx + 1}
      data-parent-id={component.extension?.parentId}
      style={style}>
      {childNum > 0 ? (
        <Caret onClick={toggleExpend}>
          {!expended ? <RightOutlined style={iconStyle} /> : <DownOutlined style={iconStyle} />}
        </Caret>
      ) : (
        <Caret />
      )}
      <LayerContent>
        <Content>
          <Name state={component.name === BLANK_NODE}>{component.label || component.name}</Name>
          {isExtend && (
            <Tooltip title={foxI18n.inheritNode}>
              <StatusTag backgroundColor="#faad14" />
            </Tooltip>
          )}
          {isExtendAndModified && (
            <Tooltip title={foxI18n.modified}>
              <StatusTag backgroundColor="#52c41a" />
            </Tooltip>
          )}
          <TagsWrapper>
            {hasCondition && (
              <Tooltip title={foxI18n.usingCondition}>
                <StatusTagWithChars>C</StatusTagWithChars>
              </Tooltip>
            )}
            {hasVariable && (
              <Tooltip title={foxI18n.usingVariable}>
                <StatusTagWithChars>V</StatusTagWithChars>
              </Tooltip>
            )}
            {hasMock && (
              <Tooltip title={foxI18n.mockEnabled}>
                <BugFilled
                  style={{
                    color: 'rgb(255, 89, 24)',
                    marginLeft: -4,
                    transform: 'scale(0.6)',
                    fontSize: '16px',
                    position: 'relative',
                    top: 1,
                  }}
                />
              </Tooltip>
            )}
          </TagsWrapper>
        </Content>
      </LayerContent>
      {toolBar && (
        <TooBar>
          <span style={{ color: '#999' }} title="Children component count">
            {childNum || ''}
          </span>
          <DragIcon
            data-node-id={id}
            cannotmove={!moveable ? 'true' : 'false'}
            draggable={moveable}
            onDragStart={(e) => dragStart(e, component)}
            onDragEnd={dragEnd}
          />
        </TooBar>
      )}
    </Component>
  );
};

export default Node;
