import React, { useContext, useEffect, useState } from 'react';

import { ArrowsAltOutlined, CloseOutlined, ShrinkOutlined } from '@ant-design/icons';
import styled from 'styled-components';

import CusButton from '@/components/common/Button';
import { FoxBuilderEvents, RenderStructureNode } from '@/types/index';

import { PanelHeader } from '../components';
import { FoxContext } from '../context';

import EditorMain from './Main';

const Container = styled.div`
  height: calc(100% - 32px);
`;

const DELAY = 100; //ms
const LONG_DELAY = 300; //ms

interface IProps {
  selectNode: RenderStructureNode | null;
  visible?: boolean;
  onShrink?: (status: boolean) => void;
  onExpand?: (status: boolean) => void;
}

const EditorIndex = (props: IProps) => {
  const [show, setShow] = useState(false);
  const [shrink, setShrink] = useState(false);
  const [newSelectNode, setNewSelectNode] = useState<RenderStructureNode | null>(null);
  const { foxI18n, events } = useContext(FoxContext);
  const { onUpdateComponent, onWindowChange } = events;
  const { selectNode, visible, onShrink, onExpand } = props;

  useEffect(() => {
    const _visible = !!selectNode;
    if (_visible !== show) {
      handleVisible(_visible);
    }
    if (_visible) {
      setTimeout(
        () => {
          setNewSelectNode(selectNode);
        },
        show ? DELAY : LONG_DELAY,
      );
    } else {
      setNewSelectNode(null);
    }
  }, [selectNode]);

  const handleVisible = (value: boolean) => {
    setShow(value);
    if (typeof onExpand === 'function') {
      onExpand(value);
    }
  };

  const handleShrink = () => {
    const _shrink = !shrink;
    setShrink(_shrink);
    if (typeof onShrink === 'function') {
      onShrink(_shrink);
    }
  };

  const handleClose = () => {
    handleVisible(false);
  };

  const icons = () => (shrink ? <ShrinkOutlined /> : <ArrowsAltOutlined />);

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

  if (!show || !visible) {
    return null;
  }

  return (
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
        <EditorMain
          key="editor"
          selectNode={newSelectNode}
          onChange={handleChange}
          onWindowChange={handleWindoWChange}
        />
      </Container>
    </>
  );
};

export default EditorIndex;
