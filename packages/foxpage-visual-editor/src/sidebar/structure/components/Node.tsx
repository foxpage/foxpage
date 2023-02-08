import React, { useContext } from 'react';

import { BugFilled, DownOutlined, DragOutlined, RightOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

import { BLANK_NODE } from '@/constant/index';
import { FoxContext, StructureTreeContext } from '@/context/index';
import { RenderStructureNode } from '@/types/index';

import NodeOperations from './NodeOperations';

const StatusTagWithChars = ({ children, onMouseEnter, onMouseLeave, onFocus, onClick }: any) => (
  <span
    {...{ onMouseEnter, onMouseLeave, onFocus, onClick }}
    className="inline-block -m-1 text-xs h-5 w-5 text-center border border-solid border-[#ffd591] scale-50 mr-0.5 text-[#d46b08] bg-[#fff7e6]">
    {children}
  </span>
);

const StatusTag = ({ backgroundColor, onMouseEnter, onMouseLeave, onFocus, onClick }: any) => (
  <span
    className={'w-1.5 h-1.5 my-0 mx-0.5 rounded-full'}
    style={{ backgroundColor }}
    {...{ onMouseEnter, onMouseLeave, onFocus, onClick }}></span>
);

interface IProps {
  idx: number;
  childNum: number;
  expended: boolean;
  selected: boolean;
  component: RenderStructureNode;
  style: any;
  toolBar?: boolean;
  toggleExpend: (e: any) => void;
  onSelect: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, node: RenderStructureNode) => void;
}

const Node = (props: IProps) => {
  const { componentMap, foxI18n, config } = useContext(FoxContext);
  const { idx, childNum, expended, style, component, toolBar, selected, toggleExpend, onSelect } = props;
  const { onDragEnd, onDragStart } = useContext(StructureTreeContext);
  const { id } = component;

  const canDragIn = componentMap[component.name]?.enableChildren;
  const {
    moveable = true,
    isExtend,
    isExtendAndModified,
    hasCondition,
    hasVariable,
    hasMock,
  } = component.__editorConfig || {};

  const expandIcon =
    childNum > 0 ? (
      <div className="text-xs w-2 mr-2 text-center" onClick={toggleExpend}>
        {!expended ? <RightOutlined className="scale-75" /> : <DownOutlined className="scale-75" />}
      </div>
    ) : (
      <div className="text-xs w-3.5 text-center" />
    );

  const title = (
    <div className="inline-flex min-w-0 items-center align-top">
      <div className="relative flex items-center min-w-0">
        <Tooltip title={component.label || component.name}>
          <span
            className={`${
              component.name === BLANK_NODE ? 'line-through text-[#999]' : 'none'
            } mr-1 text-xs truncate flex-1 min-w-0`}>
            {component.label || component.name}
          </span>
        </Tooltip>
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
        <div className="ml-0.5 relative flex items-center">
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
                  fontSize: '12px',
                  position: 'relative',
                  top: 1,
                }}
              />
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );

  const extra = toolBar && (
    <div className="inline-flex items-center py-0 pr w-9 justify-end">
      <span style={{ color: '#999' }} title="Children component count">
        {childNum || ''}
      </span>
      {!config.sys?.readOnly && (
        <DragOutlined
          className={`ml-1 ${!moveable ? 'text-[#ccc] hover:cursor-not-allowed' : 'hover:cursor-move'}`}
          data-node-id={id}
          draggable={moveable}
          onDragStart={(e) => onDragStart(e, component)}
          onDragEnd={() => onDragEnd()}
        />
      )}
    </div>
  );

  return (
    <div
      className={'flex items-center min-w-0 justify-between py-3 px-1 relative flex-1 hover:cursor-pointer'}
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
      {selected && <NodeOperations />}
      <div className="flex items-center min-w-0">
        {expandIcon}
        {title}
      </div>
      {extra}
    </div>
  );
};

export default Node;
