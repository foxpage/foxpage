import React, { useContext, useEffect, useState } from 'react';

import { ArrowsAltOutlined, CloseOutlined, ShrinkOutlined } from '@ant-design/icons';
import styled from 'styled-components';

import CusButton from '@/components/common/Button';
import { RenderStructureNode } from '@/types/index';

import { PanelHeader } from '../components';
import { FoxContext } from '../context';

import EditorMain from './Main';

const Container = styled.div`
  height: calc(100% - 32px);
`;

const Actions = styled.div`
  width: 40px;
  display: flex;
  padding-top: 4px;
`;

const DELAY = 100; //ms

interface IProps {
  selectNode: RenderStructureNode | null;
  onShrink?: (status: boolean) => void;
  onExpend?: (status: boolean) => void;
}

const EditorIndex = (props: IProps) => {
  const [visible, setVisible] = useState(false);
  const [shrink, setShrink] = useState(false);
  const [newSelectNode, setNewSelectNode] = useState<RenderStructureNode | null>(null);
  const { foxI18n } = useContext(FoxContext);
  const { selectNode } = props;
  const { onShrink, onExpend } = props;

  useEffect(() => {
    const _visible = !!selectNode;
    if (_visible !== visible) {
      handleVisible(_visible);
    }
    if (_visible) {
      setTimeout(() => {
        setNewSelectNode(selectNode);
      }, DELAY);
    } else {
      setNewSelectNode(null);
    }
  }, [selectNode]);

  const handleVisible = (value: boolean) => {
    setVisible(value);
    if (typeof onExpend === 'function') {
      onExpend(value);
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

  if (!visible) {
    return null;
  }

  return (
    <>
      <PanelHeader
        key="editor"
        title={foxI18n.editorTitle}
        extr={
          <Actions>
            <CusButton icon={icons} onClick={handleShrink} />
            <CusButton icon={<CloseOutlined />} onClick={handleClose} />
          </Actions>
        }
      />
      <Container>
        <EditorMain selectNode={newSelectNode} />
      </Container>
    </>
  );
};

export default EditorIndex;
