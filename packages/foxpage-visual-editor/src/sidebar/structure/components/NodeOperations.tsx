import React, { useContext } from 'react';

import {
  BugOutlined,
  ControlOutlined,
  CopyOutlined,
  DeleteOutlined,
  RollbackOutlined,
} from '@ant-design/icons';
import { Popconfirm } from 'antd';

import { BLANK_NODE } from '@/constant/index';
import { EditorContext, FoxContext } from '@/context/index';

const buttonClassName =
  'text-xs text-white bg-fox w-5 h-5 flex items-center justify-center rounded-none border-none p-0 outline-none hover:cursor-pointer hover:bg-fox-secondary transition-all duration-300 ease-[cubic-bezier(0.645, 0.045, 0.355, 1)]';

const BUTTON_SIZE = 18; // height & width

const NodeOperations: React.FC<{}> = () => {
  const { foxI18n, rootNode, events, config } = useContext(FoxContext);
  const { events: editorEvents, selectNode } = useContext(EditorContext);
  const { onRemoveComponent, onCopyComponent, onWindowChange } = events;
  const { openMock } = editorEvents;
  const isRootNode = rootNode?.id === selectNode?.id;
  const { name } = selectNode || {};
  const isBlankNode = name === BLANK_NODE;
  const readOnly = !!config.sys?.readOnly;

  const handleBindCondition = () => {
    if (typeof onWindowChange === 'function' && selectNode) {
      onWindowChange('conditionBind', {
        status: true,
        component: selectNode,
      });
    }
  };

  return !isRootNode ? (
    <div
      className="absolute text-right pointer-events-auto flex"
      style={{ top: -BUTTON_SIZE, right: '-10px' }}>
      {!isBlankNode ? (
        <>
          {config.sys?.mockable && !readOnly && (
            <button
              className={buttonClassName}
              onClick={() => {
                openMock && openMock(true);
              }}>
              <BugOutlined />
            </button>
          )}
          <button className={buttonClassName} onClick={handleBindCondition}>
            <ControlOutlined />
          </button>
          {!readOnly && (
            <Popconfirm
              title={foxI18n.copyComponentTip}
              onConfirm={() => {
                onCopyComponent && onCopyComponent(selectNode);
              }}
              okText={foxI18n.yes}
              cancelText={foxI18n.no}>
              <button className={buttonClassName}>
                <CopyOutlined />
              </button>
            </Popconfirm>
          )}

          {!readOnly && (
            <Popconfirm
              title={foxI18n.deleteComponentTip}
              onConfirm={() => {
                onRemoveComponent && onRemoveComponent(selectNode);
              }}
              okText={foxI18n.yes}
              cancelText={foxI18n.no}>
              <button className={buttonClassName}>
                <DeleteOutlined />
              </button>
            </Popconfirm>
          )}
        </>
      ) : (
        <>
          {!readOnly && (
            <Popconfirm
              title={foxI18n.rollBackComponentTip}
              onConfirm={() => {
                onRemoveComponent && onRemoveComponent(selectNode);
              }}
              okText={foxI18n.yes}
              cancelText={foxI18n.no}>
              <button className={buttonClassName}>
                <RollbackOutlined />
              </button>
            </Popconfirm>
          )}
        </>
      )}
    </div>
  ) : null;
};

export default NodeOperations;
