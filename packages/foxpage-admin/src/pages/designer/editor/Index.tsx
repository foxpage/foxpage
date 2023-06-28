import React, { useEffect, useMemo, useState } from 'react';

import { ArrowsAltOutlined, CloseOutlined, ShrinkOutlined } from '@ant-design/icons';
import { Empty } from 'antd';
import isNil from 'lodash/isNil';
import styled from 'styled-components';

import { FoxBuilderEvents, RenderStructureNode } from '@/types/index';

import { PanelHeader } from '../components';
import CusButton from '../components/common/Button';
import { MAX_WIDTH, WIDTH } from '../constant';
import { useEditorContext, useFoxpageContext } from '../context';

import EditorMain from './Main';

const Container = styled.div`
  height: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  align-items: stretch;
  justify-content: center;
  .ant-empty {
    flex: 1;
    display: flex;
    align-items: stretch;
    flex-direction: column;
    justify-content: center;
  }
`;

const EditorIndex = () => {
  const {
    foxI18n,
    selectNode,
    structureMap,
    events: { onUpdateComponent, onWindowChange },
  } = useFoxpageContext();
  const {
    editorShrink,
    editorExpand,
    mockerVisible,
    events: { handleEditorExpand, handleEditorShrink },
  } = useEditorContext();
  const [display, setDisplay] = useState(false);
  const visible = !mockerVisible;

  const selected = useMemo(() => {
    return selectNode ? (selectNode.__editorConfig ? selectNode : structureMap[selectNode.id]) : selectNode;
  }, [structureMap, selectNode]);

  useEffect(() => {
    if (editorExpand) {
      setTimeout(() => {
        setDisplay(true);
      }, 300);
    } else {
      setDisplay(false);
    }
  }, [editorExpand]);

  const handleShrink = () => {
    const _shrink = !editorShrink;
    if (typeof handleEditorShrink === 'function') {
      handleEditorShrink(_shrink);
    }
  };

  const handleClose = () => {
    handleEditorExpand(false);
  };

  const icons = () => (editorShrink ? <ShrinkOutlined /> : <ArrowsAltOutlined />);

  const handleChange = (value: RenderStructureNode) => {
    if (typeof onUpdateComponent === 'function') {
      onUpdateComponent(value);
    }
  };

  const handleWindoWChange: FoxBuilderEvents['onWindowChange'] = (target, opt) => {
    if (typeof onWindowChange === 'function') {
      onWindowChange(target, opt);
    }
  };
  if (!visible) {
    return null;
  }

  return (
    <div
      style={{
        width: `${editorExpand ? (editorShrink ? MAX_WIDTH : WIDTH) : 0}px`,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        flex: 1,
        transition: 'width 0.3s',
      }}>
      {display ? (
        <>
          <PanelHeader
            key="editor"
            title={foxI18n.editorTitle}
            extra={
              <div className="flex">
                <CusButton icon={icons} onClick={handleShrink} />
                <CusButton icon={<CloseOutlined />} onClick={handleClose} />
              </div>
            }
          />

          <Container>
            {!isNil(selected) ? (
              <EditorMain
                key="editor"
                selectNode={selected}
                onChange={handleChange}
                onWindowChange={handleWindoWChange}></EditorMain>
            ) : (
              <Empty />
            )}
          </Container>
        </>
      ) : null}
    </div>
  );
};

export default EditorIndex;
