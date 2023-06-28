import React from 'react';

import { BugOutlined, CopyOutlined, DeleteOutlined, RollbackOutlined } from '@ant-design/icons';
import { Popconfirm } from 'antd';

import { BLANK_NODE } from '../../../constant';
import { useEditorContext, useFoxpageContext } from '../../../context';

const buttonClassName =
  'text-xs text-white bg-fox w-5 h-5 flex items-center justify-center rounded-none border-none p-0 outline-none hover:cursor-pointer hover:bg-fox-secondary transition-all duration-300 ease-[cubic-bezier(0.645, 0.045, 0.355, 1)]';

const BUTTON_SIZE = 18; // height & width

const NodeOperations: React.FC<{ idx: number }> = ({ idx }) => {
  const { foxI18n, rootNode, events, config, selectNode, componentMap } = useFoxpageContext();
  const { events: editorEvents } = useEditorContext();
  const { onRemoveComponent, onCopyComponent } = events;
  const { handleMockerVisible } = editorEvents;
  const isRootNode = rootNode?.id === selectNode?.id;
  const { name } = selectNode || {};
  const isBlankNode = name === BLANK_NODE;
  const readOnly = !!config.sys?.readOnly;
  const deprecated = selectNode && componentMap[selectNode.name]?.deprecated;

  return !isRootNode ? (
    <div
      className="absolute text-right pointer-events-auto flex"
      style={{ top: idx === 0 && !Boolean(rootNode) ? 0 : -BUTTON_SIZE, right: '-10px' }}>
      {!isBlankNode ? (
        <>
          {config.sys?.mockable && !readOnly && (
            <button
              className={buttonClassName}
              onClick={() => {
                handleMockerVisible && handleMockerVisible(true);
              }}>
              <BugOutlined />
            </button>
          )}

          {!readOnly && !deprecated && (
            <Popconfirm
              title={foxI18n.copyComponentTip}
              onConfirm={() => {
                onCopyComponent && selectNode && onCopyComponent(selectNode);
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
                onRemoveComponent && selectNode && onRemoveComponent(selectNode);
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
                onRemoveComponent && selectNode && onRemoveComponent(selectNode);
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
