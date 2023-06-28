import React, { useContext } from 'react';

import {
  BugFilled,
  DownOutlined,
  DragOutlined,
  ExclamationCircleTwoTone,
  RightOutlined,
} from '@ant-design/icons';
import { Tooltip } from 'antd';

import { RenderStructureNode } from '@/types/index';

import { BLANK_NODE } from '../../../constant';
import { StructureTreeContext, useFoxpageContext } from '../../../context';
import { RightClick } from '../right-click';

import NodeOperations from './NodeOperations';

const StatusTagWithChars = ({
  children,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onClick,
  borderColor = '#ffd591',
  textColor = '#d46b08',
  bgColor = '#fff7e6',
}: {
  children: React.ReactNode;
  onMouseEnter?: () => {};
  onMouseLeave?: () => {};
  onFocus?: () => {};
  onClick?: () => {};
  borderColor?: string;
  textColor?: string;
  bgColor?: string;
}) => (
  <span
    {...{ onMouseEnter, onMouseLeave, onFocus, onClick }}
    className="inline-block -m-1 text-xs h-5 w-5 text-center border border-solid scale-50 mr-0.5"
    style={{ borderColor, color: textColor, backgroundColor: bgColor }}>
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
  node: RenderStructureNode;
  style: any;
  toolBar?: boolean;
  searchValue: string;
  toggleExpend: (e: any) => void;
  onSelect: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, node: RenderStructureNode) => void;
}

const Node = (props: IProps) => {
  const { componentMap, foxI18n, config, events } = useFoxpageContext();
  const { idx, childNum, expended, style, node, toolBar, selected, searchValue, toggleExpend, onSelect } =
    props;
  const { onDragEnd, onDragStart } = useContext(StructureTreeContext);
  const readOnly = !!config.sys?.readOnly;
  const { id } = node;
  const {
    moveable = true,
    isExtend,
    isExtendAndModified,
    hasCondition,
    hasVariable,
    hasMock,
    isTplNode,
    rightClickConfig,
  } = node.__editorConfig || {};
  const component = componentMap[node.name];

  const canDragIn = componentMap[node.name]?.enableChildren && !isTplNode;
  const deprecated = componentMap[node.name]?.deprecated;

  const expandIcon =
    !isTplNode && childNum > 0 ? (
      <div className="text-xs w-2 mr-2 text-center" onClick={toggleExpend}>
        {!expended ? <RightOutlined className="scale-75" /> : <DownOutlined className="scale-75" />}
      </div>
    ) : (
      <div className="text-xs w-3.5 text-center" />
    );
  const trimmedSearchValue = searchValue.trim();
  const strTitle = (node.label || node.name) as string;
  const index = strTitle.toLowerCase().indexOf(trimmedSearchValue.toLowerCase());
  const beforeStr = strTitle.substring(0, index);
  const afterStr = strTitle.slice(index + trimmedSearchValue.length);
  const matchedStr = strTitle.slice(index, index + trimmedSearchValue.length);
  const label =
    index > -1 ? (
      <span>
        {beforeStr}
        <span className="text-fox bg-slate-200">{matchedStr}</span>
        {afterStr}
      </span>
    ) : (
      <span>{strTitle}</span>
    );

  const title = (
    <div className="inline-flex min-w-0 items-center align-top">
      <div className="relative flex items-center min-w-0" title={node.label || node.name}>
        <span
          className={`${
            node.name === BLANK_NODE ? 'line-through text-[#999]' : 'none'
          } mr-1 text-xs truncate flex-1 min-w-0`}>
          {label}
        </span>
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
          {deprecated && (
            <Tooltip title={foxI18n.deprecated}>
              <ExclamationCircleTwoTone twoToneColor={'#cd201f'} />
            </Tooltip>
          )}
          {!component && node.name !== BLANK_NODE && (
            <Tooltip title={foxI18n.deleted}>
              <ExclamationCircleTwoTone twoToneColor={'#cd201f'} />
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );

  const extra = toolBar && (
    <div className="inline-flex items-center py-0 pr w-9 justify-end">
      {!isTplNode && (
        <span style={{ color: '#999' }} title="Children component count">
          {childNum || ''}
        </span>
      )}
      {!readOnly && (
        <DragOutlined
          className={`ml-1 ${!moveable ? 'text-[#ccc] hover:cursor-not-allowed' : 'hover:cursor-move'}`}
          data-node-id={id}
          draggable={moveable}
          onDragStart={(e) => onDragStart(e, node)}
          onDragEnd={() => onDragEnd()}
        />
      )}
    </div>
  );

  return (
    <RightClick
      readOnly={readOnly}
      config={rightClickConfig}
      copy={(params) => events.onCopyToClipboard?.(node, params)}
      paste={(params) => events.onPasteFromClipboard?.(node, params)}>
      <div
        className={'flex items-center min-w-0 justify-between py-3 px-1 relative flex-1 hover:cursor-pointer'}
        id={id}
        onClick={(e) => {
          onSelect(e, node);
        }}
        data-component-id={id}
        data-type="component"
        data-with-children={canDragIn}
        data-close={!expended}
        data-index={idx + 1}
        data-parent-id={node.extension?.parentId}
        style={style}>
        {selected && <NodeOperations idx={idx} />}
        <div className="flex items-center min-w-0">
          {expandIcon}
          {title}
        </div>
        {extra}
      </div>
    </RightClick>
  );
};

export default Node;
