import React, { useContext, useEffect, useState } from 'react';

import {
  BugOutlined,
  ControlOutlined,
  CopyOutlined,
  DeleteOutlined,
  RollbackOutlined,
} from '@ant-design/icons';
import { Popconfirm } from 'antd';
import styled from 'styled-components';

import { BLANK_NODE } from '@/constant/index';
import { EditorContext, FoxContext } from '@/context/index';

const Boundary = styled.div`
  border: 2px solid #1890ff;
  position: absolute;
  right: 0;
  z-index: 1;
  pointer-events: none;
`;

const Button = styled.button`
  font-size: 12px;
  background: rgb(24, 144, 255);
  width: 26px;
  height: 20px;
  color: rgb(255, 255, 255);
  text-align: center;
  line-height: 15px;
  border: none;
  border-radius: 0;
  padding: 0;
  outline: none;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  &:hover {
    background: rgb(64, 169, 255);
  }
`;
const OperateTool = styled.div`
  position: absolute;
  right: 0;
  text-align: right;
  pointer-events: auto;
`;

const BUTTON_SIZE = 23; // height & width

const getElement = (id: string) => {
  return document.getElementById(id);
};

const Tools = (props: { expendIds: string[] }) => {
  const [scrollXY, setScrollXY] = useState<{ scrollX: number; scrollY: number }>({
    scrollX: 0,
    scrollY: 0,
  });
  const { foxI18n, rootNode, events, config } = useContext(FoxContext);
  const { events: editorEvents, selectNode } = useContext(EditorContext);
  const { onRemoveComponent, onCopyComponent, onWindowChange } = events;
  const { openMock } = editorEvents;
  const { id = '', name } = selectNode || {};
  const isBlankNode = name === BLANK_NODE;
  const { expendIds } = props;
  const show = expendIds.findIndex((item) => item === id) === -1;
  const isRootNode = rootNode?.id === selectNode?.id;

  const handleScroll = () => {
    const { top = 0, left = 0 } = getElement('structure-content')?.getBoundingClientRect() || {};
    setScrollXY({ scrollX: left, scrollY: top });
  };

  useEffect(() => {
    const root = document.getElementById('structure-root');
    root?.addEventListener('scroll', handleScroll);
    return () => {
      root?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    handleScroll();
  }, [selectNode, expendIds]);

  const handleBindCondition = () => {
    if (typeof onWindowChange === 'function' && selectNode) {
      onWindowChange('conditionBind', {
        status: true,
        component: selectNode,
      });
    }
  };

  if (!selectNode) {
    return null;
  }

  const element = show && id ? getElement(id) : null;
  if (!element) {
    return null;
  }

  const rect = element.getBoundingClientRect();
  const { top = 0, width = 0, height = 0 } = rect;
  const { scrollY = 0 } = scrollXY;

  return (
    <Boundary style={{ top: top - scrollY, left: 8, width: Math.max(width, 42), height }}>
      {!isRootNode && (
        <OperateTool style={{ top: -BUTTON_SIZE, right: -2 }}>
          {!isBlankNode ? (
            <>
              {config.sys?.mockable && (
                <Button
                  onClick={() => {
                    openMock && openMock(true);
                  }}>
                  <BugOutlined />
                </Button>
              )}
              <Button onClick={handleBindCondition}>
                <ControlOutlined />
              </Button>
              <Popconfirm
                title={foxI18n.copyComponentTip}
                onConfirm={() => {
                  onCopyComponent && onCopyComponent(selectNode);
                }}
                okText={foxI18n.yes}
                cancelText={foxI18n.no}>
                <Button>
                  <CopyOutlined />
                </Button>
              </Popconfirm>

              <Popconfirm
                title={foxI18n.deleteComponentTip}
                onConfirm={() => {
                  onRemoveComponent && onRemoveComponent(selectNode);
                }}
                okText={foxI18n.yes}
                cancelText={foxI18n.no}>
                <Button>
                  <DeleteOutlined />
                </Button>
              </Popconfirm>
            </>
          ) : (
            <>
              <Popconfirm
                title={foxI18n.rollBackComponentTip}
                onConfirm={() => {
                  onRemoveComponent && onRemoveComponent(selectNode);
                }}
                okText={foxI18n.yes}
                cancelText={foxI18n.no}>
                <Button>
                  <RollbackOutlined />
                </Button>
              </Popconfirm>
            </>
          )}
        </OperateTool>
      )}
    </Boundary>
  );
};

export default Tools;
